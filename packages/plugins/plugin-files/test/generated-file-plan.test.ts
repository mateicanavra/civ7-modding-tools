import { lstat, mkdir, mkdtemp, readdir, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  applyGeneratedFilePlan,
  type GeneratedFilePlan,
  inspectGeneratedFilePlan,
} from "../src/generated-file-plan.js";

async function withTempDirectory(
  prefix: string,
  run: (root: string) => Promise<void>
): Promise<void> {
  const root = await mkdtemp(resolve(tmpdir(), prefix));
  try {
    await run(root);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

function fixturePlan(content: string | Uint8Array = "current\n"): GeneratedFilePlan {
  return {
    exclusiveSets: [{ relativeDir: "generated", fileExtension: ".ts" }],
    files: [{ relativePath: "generated/current.ts", content }],
  };
}

describe("generated file plan admission", () => {
  it.each([
    {
      label: "empty file path",
      plan: { exclusiveSets: [], files: [{ relativePath: "", content: "bad" }] },
      message: "must not be empty",
    },
    {
      label: "absolute file path",
      plan: { exclusiveSets: [], files: [{ relativePath: "/outside.ts", content: "bad" }] },
      message: "must be relative",
    },
    {
      label: "escaped file path",
      plan: { exclusiveSets: [], files: [{ relativePath: "../outside.ts", content: "bad" }] },
      message: "escapes output root",
    },
    {
      label: "empty exclusive directory",
      plan: { exclusiveSets: [{ relativeDir: "", fileExtension: ".ts" }], files: [] },
      message: "must not be empty",
    },
    {
      label: "malformed extension",
      plan: { exclusiveSets: [{ relativeDir: "generated", fileExtension: "ts" }], files: [] },
      message: "nonempty file extension",
    },
  ] satisfies readonly Readonly<{
    label: string;
    plan: GeneratedFilePlan;
    message: string;
  }>[])("rejects $label before touching disk", async ({ plan, message }) => {
    await withTempDirectory("generated-file-plan-invalid-", async (root) => {
      const marker = resolve(root, "marker.txt");
      await writeFile(marker, "untouched");

      await expect(applyGeneratedFilePlan(plan, { outputRoot: root })).rejects.toThrow(message);
      expect(await readFile(marker, "utf8")).toBe("untouched");
    });
  });

  it("rejects duplicate normalized targets before cleanup", async () => {
    await withTempDirectory("generated-file-plan-duplicate-", async (root) => {
      const stale = resolve(root, "generated/stale.ts");
      await mkdir(resolve(root, "generated"), { recursive: true });
      await writeFile(stale, "stale");
      const plan: GeneratedFilePlan = {
        exclusiveSets: [{ relativeDir: "generated", fileExtension: ".ts" }],
        files: [
          { relativePath: "generated/current.ts", content: "first" },
          { relativePath: "generated/nested/../current.ts", content: "second" },
        ],
      };

      await expect(applyGeneratedFilePlan(plan, { outputRoot: root })).rejects.toThrow(
        "duplicate normalized target"
      );
      expect(await readFile(stale, "utf8")).toBe("stale");
    });
  });

  it("rejects overlapping exclusive sets before cleanup", async () => {
    await withTempDirectory("generated-file-plan-overlap-", async (root) => {
      const stale = resolve(root, "generated/stale.ts");
      await mkdir(resolve(root, "generated"), { recursive: true });
      await writeFile(stale, "stale");

      await expect(
        applyGeneratedFilePlan(
          {
            exclusiveSets: [
              { relativeDir: "generated", fileExtension: ".ts" },
              { relativeDir: "generated/.", fileExtension: ".d.ts" },
            ],
            files: [],
          },
          { outputRoot: root }
        )
      ).rejects.toThrow("overlapping exclusive sets");
      expect(await readFile(stale, "utf8")).toBe("stale");
    });
  });

  it("rejects impossible file and directory topology before cleanup", async () => {
    await withTempDirectory("generated-file-plan-topology-", async (root) => {
      const stale = resolve(root, "generated/stale.ts");
      await mkdir(resolve(root, "generated"), { recursive: true });
      await writeFile(stale, "stale");

      await expect(
        applyGeneratedFilePlan(
          {
            exclusiveSets: [{ relativeDir: "generated", fileExtension: ".ts" }],
            files: [
              { relativePath: "output", content: "parent" },
              { relativePath: "output/child.ts", content: "child" },
            ],
          },
          { outputRoot: root }
        )
      ).rejects.toThrow("file targets cannot contain one another");
      expect(await readFile(stale, "utf8")).toBe("stale");

      await expect(
        applyGeneratedFilePlan(
          {
            exclusiveSets: [{ relativeDir: "generated", fileExtension: ".ts" }],
            files: [{ relativePath: "generated", content: "blocks the set" }],
          },
          { outputRoot: root }
        )
      ).rejects.toThrow("file target cannot contain an exclusive directory");
      expect(await readFile(stale, "utf8")).toBe("stale");
    });
  });

  it("preflights every existing set and file kind before any cleanup", async () => {
    await withTempDirectory("generated-file-plan-preflight-", async (root) => {
      await mkdir(resolve(root, "first"), { recursive: true });
      const stale = resolve(root, "first/stale.ts");
      await writeFile(stale, "stale");
      await writeFile(resolve(root, "not-a-directory"), "file");

      await expect(
        applyGeneratedFilePlan(
          {
            exclusiveSets: [
              { relativeDir: "first", fileExtension: ".ts" },
              { relativeDir: "not-a-directory", fileExtension: ".ts" },
            ],
            files: [],
          },
          { outputRoot: root }
        )
      ).rejects.toThrow("must be a directory");
      expect(await readFile(stale, "utf8")).toBe("stale");

      await mkdir(resolve(root, "planned-directory"));
      await expect(
        applyGeneratedFilePlan(
          {
            exclusiveSets: [{ relativeDir: "first", fileExtension: ".ts" }],
            files: [{ relativePath: "planned-directory", content: "file" }],
          },
          { outputRoot: root }
        )
      ).rejects.toThrow("must be a regular file");
      expect(await readFile(stale, "utf8")).toBe("stale");
    });
  });

  it("rejects symlinked roots and path components before cleanup", async () => {
    await withTempDirectory("generated-file-plan-links-", async (parent) => {
      await withTempDirectory("generated-file-plan-link-target-", async (outside) => {
        const stale = resolve(outside, "stale.ts");
        await writeFile(stale, "outside");
        const linkedRoot = resolve(parent, "linked-root");
        await symlink(outside, linkedRoot);

        await expect(
          applyGeneratedFilePlan(fixturePlan(), { outputRoot: linkedRoot })
        ).rejects.toThrow("output root must not be a symlink");
        expect(await readFile(stale, "utf8")).toBe("outside");

        const actualRoot = resolve(parent, "actual-root");
        await mkdir(actualRoot);
        await symlink(outside, resolve(actualRoot, "generated"));
        await expect(
          applyGeneratedFilePlan(fixturePlan(), { outputRoot: actualRoot })
        ).rejects.toThrow("path traverses symlink");
        expect(await readFile(stale, "utf8")).toBe("outside");
      });
    });
  });
});

describe("generated file plan inspection", () => {
  it("reports current, missing, mismatched, and unexpected files deterministically", async () => {
    await withTempDirectory("generated-file-plan-inspection-", async (root) => {
      const plan: GeneratedFilePlan = {
        exclusiveSets: [{ relativeDir: "generated", fileExtension: ".ts" }],
        files: [
          { relativePath: "generated/b.ts", content: "expected-b" },
          { relativePath: "generated/a.ts", content: "expected-a" },
          { relativePath: "data.bin", content: Uint8Array.from([1, 2, 3]) },
        ],
      };
      await applyGeneratedFilePlan(plan, { outputRoot: root });
      expect(await inspectGeneratedFilePlan(plan, { outputRoot: root })).toEqual({
        kind: "current",
      });

      await rm(resolve(root, "generated/a.ts"));
      await writeFile(resolve(root, "generated/b.ts"), "different");
      await writeFile(resolve(root, "generated/z.ts"), "unexpected");

      expect(await inspectGeneratedFilePlan(plan, { outputRoot: root })).toEqual({
        kind: "stale",
        issues: [
          { kind: "missing", relativePath: "generated/a.ts" },
          { kind: "content-mismatch", relativePath: "generated/b.ts" },
          { kind: "unexpected", relativePath: "generated/z.ts" },
        ],
      });
    });
  });

  it("does not materialize missing files or clean unexpected files", async () => {
    await withTempDirectory("generated-file-plan-read-only-", async (root) => {
      await mkdir(resolve(root, "generated"), { recursive: true });
      const unexpected = resolve(root, "generated/stale.ts");
      await writeFile(unexpected, "stale");

      expect(await inspectGeneratedFilePlan(fixturePlan(), { outputRoot: root })).toEqual({
        kind: "stale",
        issues: [
          { kind: "missing", relativePath: "generated/current.ts" },
          { kind: "unexpected", relativePath: "generated/stale.ts" },
        ],
      });
      expect(await readFile(unexpected, "utf8")).toBe("stale");
      await expect(lstat(resolve(root, "generated/current.ts"))).rejects.toMatchObject({
        code: "ENOENT",
      });
    });
  });

  it("reports extension-matching directories and symlinks as unexpected", async () => {
    await withTempDirectory("generated-file-plan-inspection-kinds-", async (root) => {
      await mkdir(resolve(root, "generated/directory.ts"), { recursive: true });
      await writeFile(resolve(root, "outside.ts"), "outside");
      await symlink(resolve(root, "outside.ts"), resolve(root, "generated/link.ts"));

      expect(
        await inspectGeneratedFilePlan(
          {
            exclusiveSets: [{ relativeDir: "generated", fileExtension: ".ts" }],
            files: [],
          },
          { outputRoot: root }
        )
      ).toEqual({
        kind: "stale",
        issues: [
          { kind: "unexpected", relativePath: "generated/directory.ts" },
          { kind: "unexpected", relativePath: "generated/link.ts" },
        ],
      });
    });
  });

  it("compares planned text with exact UTF-8 bytes", async () => {
    await withTempDirectory("generated-file-plan-text-bytes-", async (root) => {
      const plan: GeneratedFilePlan = {
        exclusiveSets: [],
        files: [{ relativePath: "replacement.txt", content: "\uFFFD" }],
      };
      await writeFile(resolve(root, "replacement.txt"), Uint8Array.from([0xff]));

      expect(await inspectGeneratedFilePlan(plan, { outputRoot: root })).toEqual({
        kind: "stale",
        issues: [{ kind: "content-mismatch", relativePath: "replacement.txt" }],
      });
    });
  });

  it("inspects text using the same UTF-8 encoding that application writes", async () => {
    await withTempDirectory("generated-file-plan-text-encoding-", async (root) => {
      const plan: GeneratedFilePlan = {
        exclusiveSets: [],
        files: [{ relativePath: "surrogate.txt", content: "\ud800" }],
      };

      await applyGeneratedFilePlan(plan, { outputRoot: root });
      expect(await inspectGeneratedFilePlan(plan, { outputRoot: root })).toEqual({
        kind: "current",
      });
    });
  });

  it("rejects non-directory sets and non-file targets instead of treating them as missing", async () => {
    await withTempDirectory("generated-file-plan-read-error-", async (root) => {
      await writeFile(resolve(root, "not-a-directory"), "file");
      await expect(
        inspectGeneratedFilePlan(
          {
            exclusiveSets: [{ relativeDir: "not-a-directory", fileExtension: ".ts" }],
            files: [],
          },
          { outputRoot: root }
        )
      ).rejects.toThrow("must be a directory");

      await mkdir(resolve(root, "directory-as-file"));
      await expect(
        inspectGeneratedFilePlan(
          {
            exclusiveSets: [],
            files: [{ relativePath: "directory-as-file", content: "expected" }],
          },
          { outputRoot: root }
        )
      ).rejects.toThrow("must be a regular file");
    });
  });
});

describe("generated file plan application", () => {
  it("snapshots byte content before its first filesystem await", async () => {
    await withTempDirectory("generated-file-plan-byte-snapshot-", async (root) => {
      const bytes = Uint8Array.from([1, 2, 3]);
      const application = applyGeneratedFilePlan(
        { exclusiveSets: [], files: [{ relativePath: "bytes.bin", content: bytes }] },
        { outputRoot: root }
      );
      bytes[0] = 9;
      await application;

      expect(Array.from(await readFile(resolve(root, "bytes.bin")))).toEqual([1, 2, 3]);
    });
  });

  it("cleans only direct matching files and preserves other entries", async () => {
    await withTempDirectory("generated-file-plan-cleanup-", async (root) => {
      await mkdir(resolve(root, "generated/nested"), { recursive: true });
      await writeFile(resolve(root, "generated/stale.ts"), "stale");
      await writeFile(resolve(root, "generated/keep.txt"), "keep");
      await writeFile(resolve(root, "generated/nested/keep.ts"), "nested");

      await applyGeneratedFilePlan(fixturePlan(), { outputRoot: root });

      expect((await readdir(resolve(root, "generated"))).sort()).toEqual([
        "current.ts",
        "keep.txt",
        "nested",
      ]);
      expect(await readFile(resolve(root, "generated/keep.txt"), "utf8")).toBe("keep");
      expect(await readFile(resolve(root, "generated/nested/keep.ts"), "utf8")).toBe("nested");
    });
  });

  it("rejects extension-matching non-files before cleaning regular files", async () => {
    await withTempDirectory("generated-file-plan-cleanup-kinds-", async (root) => {
      await mkdir(resolve(root, "generated/directory.ts"), { recursive: true });
      const stale = resolve(root, "generated/stale.ts");
      await writeFile(stale, "stale");

      const plan: GeneratedFilePlan = {
        exclusiveSets: [{ relativeDir: "generated", fileExtension: ".ts" }],
        files: [],
      };
      await expect(applyGeneratedFilePlan(plan, { outputRoot: root })).rejects.toThrow(
        "exclusive-set entry must be a regular file"
      );
      expect(await readFile(stale, "utf8")).toBe("stale");

      await rm(resolve(root, "generated/directory.ts"), { recursive: true });
      await writeFile(resolve(root, "outside.ts"), "outside");
      await symlink(resolve(root, "outside.ts"), resolve(root, "generated/link.ts"));
      await expect(applyGeneratedFilePlan(plan, { outputRoot: root })).rejects.toThrow(
        "exclusive-set entry must be a regular file"
      );
      expect(await readFile(stale, "utf8")).toBe("stale");
    });
  });
});
