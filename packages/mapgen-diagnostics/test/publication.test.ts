import { describe, expect, it } from "bun:test";
import {
  closeSync,
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  openSync,
  readdirSync,
  readFileSync,
  realpathSync,
  renameSync,
  rmSync,
  symlinkSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, relative } from "node:path";
import { publishJsonEvidence } from "../src/index.js";
import { writeFileAtomically } from "../src/internal/atomic-file.js";

function withTemporaryDirectory(run: (directory: string) => void): void {
  const directory = mkdtempSync(join(tmpdir(), "mapgen-json-evidence-"));
  try {
    run(directory);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

describe("JSON evidence publication", () => {
  it("admits absolute paths, creates parent directories, and writes stable JSON", () => {
    withTemporaryDirectory((directory) => {
      const path = join(directory, "nested", "evidence.json");
      const expected = `{
  "status": "complete",
  "counts": [
    2,
    1
  ]
}`;

      const result = publishJsonEvidence({
        path,
        evidence: { status: "complete", counts: [2, 1] },
      });

      expect(result).toEqual({
        path: realpathSync(path),
        byteLength: Buffer.byteLength(expected),
      });
      expect(readFileSync(path, "utf8")).toBe(expected);
    });
  });

  it("resolves relative paths from the caller's current working directory", () => {
    withTemporaryDirectory((directory) => {
      const absolutePath = join(directory, "relative", "evidence.json");
      const relativePath = relative(process.cwd(), absolutePath);

      const result = publishJsonEvidence({
        path: relativePath,
        evidence: { source: "relative" },
      });

      expect(result.path).toBe(realpathSync(absolutePath));
      expect(JSON.parse(readFileSync(absolutePath, "utf8"))).toEqual({ source: "relative" });
    });
  });

  it("atomically replaces an existing evidence file without retaining temporary files", () => {
    withTemporaryDirectory((directory) => {
      const path = join(directory, "evidence.json");
      writeFileSync(path, '{"status":"retained"}');

      publishJsonEvidence({
        path,
        evidence: { status: "replaced", revision: 2 },
      });

      expect(readFileSync(path, "utf8")).toBe(`{
  "status": "replaced",
  "revision": 2
}`);
      expect(readdirSync(directory)).toEqual(["evidence.json"]);
    });
  });

  it("cleans up its temporary file and preserves the original publication error", () => {
    withTemporaryDirectory((directory) => {
      const path = join(directory, "evidence.json");
      writeFileSync(join(directory, "sentinel.txt"), "retained");
      // A directory at the target path forces the final rename to fail after the temporary write.
      mkdirSync(path);
      writeFileSync(join(path, "nested.txt"), "retained");

      expect(() =>
        publishJsonEvidence({
          path,
          evidence: { status: "not-published" },
        })
      ).toThrow();

      expect(lstatSync(path).isDirectory()).toBeTrue();
      expect(readFileSync(join(path, "nested.txt"), "utf8")).toBe("retained");
      expect(readFileSync(join(directory, "sentinel.txt"), "utf8")).toBe("retained");
      expect(readdirSync(directory).sort()).toEqual(["evidence.json", "sentinel.txt"]);
    });
  });

  it("cleans an owned temporary file when descriptor writing fails after creation", () => {
    withTemporaryDirectory((directory) => {
      const path = join(directory, "evidence.json");
      const writeFailure = new Error("injected descriptor write failure");
      let temporaryPath: string | undefined;
      let closeCount = 0;
      let thrown: unknown;
      writeFileSync(path, '{"status":"last-good"}');

      try {
        writeFileAtomically(path, '{"status":"partial"}', {
          open: (candidatePath) => {
            temporaryPath = candidatePath;
            return openSync(candidatePath, "wx");
          },
          write: (descriptor, data) => {
            writeFileSync(descriptor, data);
            if (!temporaryPath || !existsSync(temporaryPath)) {
              throw new Error("Expected the exclusive temporary file to exist during writing.");
            }
            throw writeFailure;
          },
          close: (descriptor) => {
            closeCount += 1;
            closeSync(descriptor);
          },
          rename: renameSync,
          unlink: unlinkSync,
        });
      } catch (error) {
        thrown = error;
      }

      expect(thrown).toBe(writeFailure);
      expect(closeCount).toBe(1);
      expect(temporaryPath).toBeDefined();
      expect(existsSync(temporaryPath ?? "")).toBeFalse();
      expect(readFileSync(path, "utf8")).toBe('{"status":"last-good"}');
      expect(readdirSync(directory)).toEqual(["evidence.json"]);
    });
  });

  it("does not create directories when evidence cannot be serialized", () => {
    withTemporaryDirectory((directory) => {
      const path = join(directory, "not-created", "evidence.json");
      const cyclic: { self?: unknown } = {};
      cyclic.self = cyclic;

      expect(() => publishJsonEvidence({ path, evidence: cyclic })).toThrow();
      expect(existsSync(join(directory, "not-created"))).toBeFalse();
    });
  });

  it("replaces a target symlink without mutating the linked file", () => {
    withTemporaryDirectory((directory) => {
      const outsidePath = join(directory, "outside.json");
      const path = join(directory, "evidence.json");
      writeFileSync(outsidePath, '{"status":"outside"}');
      symlinkSync(outsidePath, path);

      publishJsonEvidence({ path, evidence: { status: "inside" } });

      expect(lstatSync(path).isSymbolicLink()).toBeFalse();
      expect(readFileSync(path, "utf8")).toContain('"inside"');
      expect(readFileSync(outsidePath, "utf8")).toBe('{"status":"outside"}');
    });
  });
});
