import path from "node:path";
import { NodeContext } from "@effect/platform-node";
import type { HabitatDirectoryEntry } from "@habitat/cli/resources/platform/index";
import { violationKey } from "@habitat/cli/service/model/baseline/index";
import { executeSelectedRulesEffect } from "@habitat/cli/service/model/check/policy/structural/execution.policy";
import { createCheckReportEffect } from "@habitat/cli/service/model/check/policy/structural/report.policy";
import { ruleFactsCatalog } from "@habitat/cli/service/model/rules/index";
import { Effect, Match, Schema } from "effect";
import { describe, expect, test } from "vitest";

const repoRoot = path.join("/", "repo");

describe("structure-check native execution", () => {
  test("executes selected structure rules with one Git inventory and no command, Grit, or Nx handoff", async () => {
    let visibleInventoryCalls = 0;
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
            listVisiblePaths: () =>
              Effect.sync(() => {
                visibleInventoryCalls += 1;
                return [{ mode: "100644", repoPath: "pkg/src/index.ts" }];
              }),
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
    expect(visibleInventoryCalls).toBe(1);
  });

  test("reports an unavailable Git inventory as a non-baselinable execution failure", async () => {
    const authorityPaths = {
      baseline: ".habitat/sample/baseline.json",
      index: ".habitat/index.json",
      manifest: ".habitat/sample/rule.json",
      structure: ".habitat/sample/sample.structure.toml",
    } as const;
    const inventoryDiagnostic = {
      ruleId: "sample-structure-rule",
      path: ".",
      message:
        "[visible-path-inventory-unavailable] Unable to enumerate Git-visible paths and modes; structure checks refuse to inspect an unbounded filesystem tree.",
      severity: "error" as const,
      baselined: false,
    };
    const fixture = {
      files: new Map([
        [
          path.join(repoRoot, authorityPaths.structure),
          `schemaVersion = 1

[[scopes]]
name = "root"
root = "pkg"
kind = "directory"
mode = "open"
`,
        ],
        [
          path.join(repoRoot, authorityPaths.baseline),
          stringifyJsonDocument([violationKey(inventoryDiagnostic)]),
        ],
        [
          path.join(repoRoot, authorityPaths.index),
          stringifyJsonDocument({
            schemaVersion: 2,
            ownerRoots: { habitat: "tools/habitat" },
          }),
        ],
        [
          path.join(repoRoot, authorityPaths.manifest),
          stringifyJsonDocument({
            schemaVersion: 2,
            id: "sample-structure-rule",
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
              files: { structure: authorityPaths.structure },
            },
            pathCoverage: [{ kind: "exact-path", patterns: ["pkg"] }],
            supportFiles: { baseline: authorityPaths.baseline },
          }),
        ],
      ]),
      directories: new Map<string, readonly HabitatDirectoryEntry[]>([
        [
          path.join(repoRoot, ".habitat"),
          [
            { name: "index.json", kind: "file" },
            { name: "sample", kind: "directory" },
          ],
        ],
        [
          path.join(repoRoot, ".habitat/sample"),
          [
            { name: "baseline.json", kind: "file" },
            { name: "rule.json", kind: "file" },
            { name: "sample.structure.toml", kind: "file" },
          ],
        ],
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
            files: { structure: authorityPaths.structure },
          },
          pathCoverage: [{ kind: "exact-path", patterns: ["pkg"] }],
          supportFiles: { baseline: authorityPaths.baseline },
        },
      ],
    });
    const forbiddenExecution = Effect.die(
      new Error("Unrelated providers must not run when Git inventory acquisition fails.")
    );
    const fileSystem = fileSystemPort(fixture);
    const report = await Effect.runPromise(
      createCheckReportEffect(
        { rule: "sample-structure-rule" },
        {
          baselineFileSystem: fileSystem,
          biome: { run: () => forbiddenExecution },
          command: { run: () => forbiddenExecution },
          git: {
            diffNameOnly: () => forbiddenExecution,
            diffNameStatus: () => forbiddenExecution,
            listVisiblePaths: () => Effect.succeed(null),
            lsTreeNameOnly: () => forbiddenExecution,
            mergeBase: () => Effect.succeed(null),
            show: () => Effect.succeed(null),
          },
          ruleDiagnostics: { runRules: () => forbiddenExecution },
          nx: {
            runMany: () => forbiddenExecution,
            runTarget: () => forbiddenExecution,
          },
          repoRoot,
          rules,
          structureFileSystem: fileSystem,
        }
      ).pipe(Effect.provide(NodeContext.layer))
    );

    expect(report.ok).toBe(false);
    expect(report.rules[0]).toMatchObject({
      status: "fail",
      disposition: {
        kind: "execution-failed",
        source: "git-provider",
        failure: "visible-path-inventory-unavailable",
      },
      diagnostics: [{ ...inventoryDiagnostic, baselined: true }],
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
    readPathKind: (targetPath: string) =>
      Effect.succeed(
        Match.value({
          directory: fixture.directories.has(targetPath),
          file: fixture.files.has(targetPath),
        }).pipe(
          Match.when({ directory: true }, () => "directory" as const),
          Match.when({ file: true }, () => "file" as const),
          Match.orElse(() => "missing" as const)
        )
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

function stringifyJsonDocument(value: unknown): string {
  return `${Schema.encodeSync(Schema.parseJson())(value)}\n`;
}
