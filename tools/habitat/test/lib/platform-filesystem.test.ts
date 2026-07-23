import { mkdtempSync, rmdirSync, symlinkSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { NodeContext } from "@effect/platform-node";
import { readDirectoryNoFollow } from "@habitat/cli/resources/platform/index";
import { Effect } from "effect";
import { describe, expect, test } from "vitest";

describe("platform filesystem no-follow reads", () => {
  test("refuses a directory symlink before reading its target", async () => {
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
