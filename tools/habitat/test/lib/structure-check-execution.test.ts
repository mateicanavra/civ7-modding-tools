import path from "node:path";
import { NodeContext } from "@effect/platform-node";
import type { HabitatDirectoryEntry } from "@habitat/cli/resources/platform/index";
import { executeSelectedRulesEffect } from "@habitat/cli/service/model/check/policy/structural/execution.policy";
import { ruleFactsCatalog } from "@habitat/cli/service/model/rules/index";
import { Effect, Match } from "effect";
import { describe, expect, test } from "vitest";

const repoRoot = path.join("/", "repo");

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
      schemaVersion: 2,
      ownerRoots: { habitat: "tools/habitat" },
      rules: [
        {
          id: "sample-structure-rule",
          schemaVersion: 2,
          title: "Sample Structure Rule",
          placement: {
            niche: "fixtures",
            blueprint: "_self",
            category: "structure",
          },
          operation: { kind: "check" },
          ownerProject: "habitat",
          lane: "enforced",
          forbids: "missing structure",
          why: "The test proves native structure execution.",
          remediate: null,
          message: "Fix structure.",
          runner: {
            name: "habitat",
            mode: "structure",
            files: { structure: ".habitat/sample/sample.structure.toml" },
          },
          pathCoverage: [{ kind: "exact-path", patterns: ["pkg"] }],
        },
      ],
    });
    const forbiddenExecution = Effect.die(
      new Error("Non-structure providers must not run during native structure execution.")
    );

    const results = await Effect.runPromise(
      executeSelectedRulesEffect(
        rules.selector,
        {},
        {
          baselineFileSystem: fileSystemPort(fixture),
          biome: { run: () => forbiddenExecution },
          command: { run: () => forbiddenExecution },
          git: {
            diffNameOnly: () => forbiddenExecution,
            diffNameStatus: () => forbiddenExecution,
            lsTreeNameOnly: () => forbiddenExecution,
            mergeBase: () => forbiddenExecution,
            show: () => forbiddenExecution,
          },
          ruleDiagnostics: { runRules: () => forbiddenExecution },
          nx: {
            runMany: () => forbiddenExecution,
            runTarget: () => forbiddenExecution,
          },
          repoRoot,
          rules,
          structureFileSystem: fileSystemPort(fixture),
        }
      ).pipe(Effect.provide(NodeContext.layer))
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
      Match.value(fixture.directories.get(targetPath)).pipe(
        Match.when(Match.undefined, () =>
          Effect.die(new Error(`Missing directory fixture: ${targetPath}`))
        ),
        Match.orElse((entries) => Effect.succeed([...entries]))
      ),
    readText: (targetPath: string) =>
      Match.value(fixture.files.get(targetPath)).pipe(
        Match.when(Match.undefined, () =>
          Effect.die(new Error(`Missing file fixture: ${targetPath}`))
        ),
        Match.orElse((contents) => Effect.succeed(contents))
      ),
    writeText: () => Effect.void,
  };
}
