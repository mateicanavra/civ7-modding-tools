import type { HabitatDirectoryEntry } from "@habitat/cli/resources/platform/index";
import { executeSelectedRulesEffect } from "@habitat/cli/service/model/check/policy/structural/execution.policy";
import { ruleFactsCatalog } from "@habitat/cli/service/model/rules/index";
import { Effect } from "effect";
import { describe, expect, test } from "vitest";

const repoRoot = "/repo";

describe("structure-check native execution", () => {
  test("executes selected structure rules without command, Grit, or Nx handoff", async () => {
    const fixture = {
      files: new Map([
        [
          `${repoRoot}/.habitat/sample/sample.structure.toml`,
          `
schemaVersion = 1

[[scopes]]
name = "root"
root = "pkg"
kind = "directory"
mode = "open"
required = ["src"]
`,
        ],
      ]),
      directories: new Map<string, readonly HabitatDirectoryEntry[]>([
        [`${repoRoot}/pkg`, [{ name: "src", kind: "directory" }]],
        [`${repoRoot}/pkg/src`, []],
      ]),
    };
    const rules = ruleFactsCatalog({
      schemaVersion: 1,
      ownerRoots: { habitat: "tools/habitat" },
      rules: [
        {
          id: "sample-structure-rule",
          title: "Sample Structure Rule",
          ownerProject: "habitat",
          lane: "enforced",
          forbids: "missing structure",
          why: "The test proves native structure execution.",
          remediate: null,
          message: "Fix structure.",
          exceptionPath: "none",
          runner: {
            name: "habitat",
            mode: "structure",
            structurePath: ".habitat/sample/sample.structure.toml",
          },
          pathCoverage: [{ kind: "exact-path", patterns: ["pkg"] }],
        },
      ],
    });

    const results = await Effect.runPromise(
      executeSelectedRulesEffect(
        rules.selector,
        {},
        {
          baselineFileSystem: fileSystemPort(fixture),
          biome: { run: () => failIfCalled("biome") },
          command: { run: () => failIfCalled("command") },
          git: {
            diffNameOnly: () => failIfCalled("git.diffNameOnly"),
            diffNameStatus: () => failIfCalled("git.diffNameStatus"),
            lsTreeNameOnly: () => failIfCalled("git.lsTreeNameOnly"),
            mergeBase: () => failIfCalled("git.mergeBase"),
            show: () => failIfCalled("git.show"),
          },
          grit: { runRules: () => failIfCalled("grit") },
          nx: {
            runMany: () => failIfCalled("nx.runMany"),
            runTarget: () => failIfCalled("nx.runTarget"),
          },
          repoRoot,
          rules,
          sourceFileSystem: fileSystemPort(fixture),
          structureFileSystem: fileSystemPort(fixture),
        }
      )
    );

    expect(results.get("sample-structure-rule")?.result).toEqual({
      exitCode: 0,
      diagnostics: [],
    });
  });
});

function fileSystemPort(fixture: {
  files: ReadonlyMap<string, string>;
  directories: ReadonlyMap<string, readonly HabitatDirectoryEntry[]>;
}) {
  return {
    isDirectory: (targetPath: string) => Effect.succeed(fixture.directories.has(targetPath)),
    isFile: (targetPath: string) => Effect.succeed(fixture.files.has(targetPath)),
    makeDirectory: () => Effect.void,
    readDirectory: (targetPath: string) =>
      fixture.directories.has(targetPath)
        ? Effect.succeed(fixture.directories.get(targetPath) ?? [])
        : Effect.fail(new Error(`Missing directory fixture: ${targetPath}`)),
    readText: (targetPath: string) =>
      fixture.files.has(targetPath)
        ? Effect.succeed(fixture.files.get(targetPath) ?? "")
        : Effect.fail(new Error(`Missing file fixture: ${targetPath}`)),
    writeText: () => Effect.void,
  };
}

function failIfCalled(label: string): Effect.Effect<never, never> {
  return Effect.die(new Error(`${label} should not be called by structure-check execution`));
}
