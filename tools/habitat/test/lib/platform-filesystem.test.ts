import { mkdirSync, mkdtempSync, rmdirSync, symlinkSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { NodeContext } from "@effect/platform-node";
import { pathKindNoFollow, readDirectoryNoFollow } from "@habitat/cli/resources/platform/index";
import { Effect } from "effect";
import { describe, expect, test } from "vitest";

describe("platform filesystem no-follow reads", () => {
  test("classifies file and directory symlinks without entering their targets", async () => {
    const fixtureRoot = mkdtempSync(path.join(tmpdir(), "habitat-platform-no-follow-"));
    const outsideRoot = mkdtempSync(path.join(tmpdir(), "habitat-platform-outside-"));
    const nestedOutside = path.join(outsideRoot, "nested");
    const outsideFile = path.join(outsideRoot, "outside.ts");
    const directoryLink = path.join(fixtureRoot, "directory-link");
    const fileLink = path.join(fixtureRoot, "file-link");
    const missingPath = path.join(fixtureRoot, "missing");
    mkdirSync(nestedOutside);
    writeFileSync(path.join(nestedOutside, "secret.ts"), "outside\n");
    writeFileSync(outsideFile, "outside\n");
    symlinkSync(nestedOutside, directoryLink);
    symlinkSync(outsideFile, fileLink);

    try {
      const result = await Effect.runPromise(
        Effect.all({
          directory: pathKindNoFollow(fixtureRoot),
          file: pathKindNoFollow(outsideFile),
          missing: pathKindNoFollow(missingPath),
          directoryKind: pathKindNoFollow(directoryLink),
          fileKind: pathKindNoFollow(fileLink),
          entries: readDirectoryNoFollow(fixtureRoot),
        }).pipe(Effect.provide(NodeContext.layer))
      );

      expect(result.directory).toBe("directory");
      expect(result.file).toBe("file");
      expect(result.missing).toBe("missing");
      expect(result.directoryKind).toBe("other");
      expect(result.fileKind).toBe("other");
      expect(result.entries).toHaveLength(2);
      expect(result.entries).toEqual(
        expect.arrayContaining([
          { name: "directory-link", kind: "other" },
          { name: "file-link", kind: "other" },
        ])
      );
    } finally {
      unlinkSync(directoryLink);
      unlinkSync(fileLink);
      unlinkSync(path.join(nestedOutside, "secret.ts"));
      rmdirSync(nestedOutside);
      unlinkSync(outsideFile);
      rmdirSync(outsideRoot);
      rmdirSync(fixtureRoot);
    }
  });

  test("refuses a directory symlink as the directory-read target", async () => {
    const fixtureRoot = mkdtempSync(path.join(tmpdir(), "habitat-platform-target-link-"));
    const outsideRoot = mkdtempSync(path.join(tmpdir(), "habitat-platform-target-outside-"));
    const directoryLink = path.join(fixtureRoot, "directory-link");
    const outsideFile = path.join(outsideRoot, "secret.ts");
    writeFileSync(outsideFile, "outside\n");
    symlinkSync(outsideRoot, directoryLink);

    try {
      const result = await Effect.runPromise(
        Effect.either(readDirectoryNoFollow(directoryLink)).pipe(Effect.provide(NodeContext.layer))
      );

      expect(result).toMatchObject({
        _tag: "Left",
        left: {
          _tag: "FileReadFailed",
          path: directoryLink,
          cause: "refusing to read a directory through a symbolic link",
        },
      });
    } finally {
      unlinkSync(directoryLink);
      unlinkSync(outsideFile);
      rmdirSync(outsideRoot);
      rmdirSync(fixtureRoot);
    }
  });
});
