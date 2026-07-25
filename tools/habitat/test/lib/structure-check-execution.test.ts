import { captureOutput, makeHabitatCommandResult } from "@habitat/cli/resources/command/index";
import { FileReadFailed } from "@habitat/cli/resources/errors/index";
import type { HabitatDirectoryEntry, HabitatPathKind } from "@habitat/cli/resources/platform/index";
import { executeSelectedRulesEffect } from "@habitat/cli/service/model/check/policy/structural/execution.policy";
import { createCheckReportEffect } from "@habitat/cli/service/model/check/policy/structural/report.policy";
import { type RuleRegistryRecord, ruleFactsCatalog } from "@habitat/cli/service/model/rules/index";
import { Effect, Match } from "effect";
import { describe, expect, test } from "vitest";

const repoRoot = "/repo";

describe("structure-check native execution", () => {
  test("injects affirmed blueprint continuity into staged Habitat reports without a registry rule", async () => {
    const baselinePath = ".habitat/baselines/sample-file-layer-rule.json";
    const emptyFixture = {
      files: new Map<string, string>([[`${repoRoot}/${baselinePath}`, "[]"]]),
      directories: new Map<string, readonly HabitatDirectoryEntry[]>(),
    };
    const rules = ruleFactsCatalog({
      schemaVersion: 2,
      ownerRoots: { habitat: "tools/habitat" },
      rules: [
        {
          id: "sample-file-layer-rule",
          schemaVersion: 2,
          title: "Sample File Layer Rule",
          placement: {
            niche: "fixtures",
            blueprint: "_self",
            category: "structure",
          },
          operation: { kind: "check" },
          ownerProject: "habitat",
          lane: "enforced",
          forbids: "forbidden source filenames",
          why: "The test needs one selected native Habitat rule.",
          remediate: null,
          message: "Remove the forbidden filename.",
          supportFiles: { baseline: baselinePath },
          pathCoverage: [{ kind: "workspace-gate" }],
          forbiddenFileNames: ["forbidden.ts"],
          runner: {
            name: "habitat",
            mode: "file-layer",
            guard: "forbidden-file-name",
          },
        },
      ],
    });
    const stagedResult = makeHabitatCommandResult(
      {
        commandId: "git-diff-name-status",
        kind: "git-state",
        executable: "git",
        argv: ["diff", "--cached", "--name-status", "-z"],
        cwd: repoRoot,
      },
      { stdout: captureOutput("M\0packages/example/src/index.ts\0") }
    );

    const report = await Effect.runPromise(
      createCheckReportEffect(
        { rule: "sample-file-layer-rule", staged: true },
        {
          baselineFileSystem: fileSystemPort(emptyFixture),
          biome: { run: () => failIfCalled("biome") },
          command: { run: () => failIfCalled("command") },
          git: {
            diffNameOnly: () => failIfCalled("git.diffNameOnly"),
            diffNameStatus: () => Effect.succeed(stagedResult),
            visiblePathInventory: () => failIfCalled("git.visiblePathInventory"),
            lsTreeNameOnly: () => failIfCalled("git.lsTreeNameOnly"),
            mergeBase: () => failIfCalled("git.mergeBase"),
            show: () => failIfCalled("git.show"),
            showIndex: () => failIfCalled("git.showIndex"),
          },
          ruleDiagnostics: { runRules: () => failIfCalled("ruleDiagnostics") },
          nx: {
            runMany: () => failIfCalled("nx.runMany"),
            runTarget: () => failIfCalled("nx.runTarget"),
          },
          repoRoot,
          rules,
          structureFileSystem: fileSystemPort(emptyFixture),
        }
      )
    );

    expect(rules.selector.map(({ id }) => id)).toEqual(["sample-file-layer-rule"]);
    expect(report.rules.map(({ ruleId }) => ruleId)).toEqual([
      "sample-file-layer-rule",
      "affirmed-blueprint-continuity",
    ]);
    expect(report.ok).toBe(true);
  });

  test("executes selected structure rules with one Git inventory and no command, Grit, or Nx handoff", async () => {
    let inventoryCalls = 0;
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
            visiblePathInventory: () =>
              Effect.sync(() => {
                inventoryCalls += 1;
                return {
                  paths: ["pkg/src/index.ts"],
                  trackedNonFilePaths: [],
                };
              }),
            lsTreeNameOnly: () => failIfCalled("git.lsTreeNameOnly"),
            mergeBase: () => failIfCalled("git.mergeBase"),
            show: () => failIfCalled("git.show"),
            showIndex: () => failIfCalled("git.showIndex"),
          },
          ruleDiagnostics: { runRules: () => failIfCalled("ruleDiagnostics") },
          nx: {
            runMany: () => failIfCalled("nx.runMany"),
            runTarget: () => failIfCalled("nx.runTarget"),
          },
          repoRoot,
          rules,
          structureFileSystem: fileSystemPort(fixture),
        }
      )
    );

    expect(results.get("sample-structure-rule")?.result).toEqual({
      exitCode: 0,
      diagnostics: [],
    });
    expect(inventoryCalls).toBe(1);
  });

  test("refuses the structure batch once when Git inventory is unavailable", async () => {
    let inventoryCalls = 0;
    const rules = ruleFactsCatalog({
      schemaVersion: 2,
      ownerRoots: { habitat: "tools/habitat" },
      rules: [
        structureRuleRecord("first-structure-rule"),
        structureRuleRecord("second-structure-rule"),
      ],
    });

    const results = await Effect.runPromise(
      executeSelectedRulesEffect(
        rules.selector,
        {},
        {
          baselineFileSystem: unavailableFileSystemPort(),
          biome: { run: () => failIfCalled("biome") },
          command: { run: () => failIfCalled("command") },
          git: {
            diffNameOnly: () => failIfCalled("git.diffNameOnly"),
            diffNameStatus: () => failIfCalled("git.diffNameStatus"),
            visiblePathInventory: () =>
              Effect.sync(() => {
                inventoryCalls += 1;
                return null;
              }),
            lsTreeNameOnly: () => failIfCalled("git.lsTreeNameOnly"),
            mergeBase: () => failIfCalled("git.mergeBase"),
            show: () => failIfCalled("git.show"),
            showIndex: () => failIfCalled("git.showIndex"),
          },
          ruleDiagnostics: { runRules: () => failIfCalled("ruleDiagnostics") },
          nx: {
            runMany: () => failIfCalled("nx.runMany"),
            runTarget: () => failIfCalled("nx.runTarget"),
          },
          repoRoot,
          rules,
          structureFileSystem: unavailableFileSystemPort(),
        }
      )
    );

    expect(inventoryCalls).toBe(1);
    expect([...results.values()]).toHaveLength(2);
    for (const record of results.values()) {
      expect(record).toMatchObject({
        result: {
          exitCode: 1,
          diagnostics: [{ baselined: false }],
        },
        timing: {
          kind: "shared",
          groupId: "habitat:structure-rules",
          ruleCount: 2,
        },
        disposition: {
          kind: "execution-failed",
          source: "git-provider",
          failure: "GitVisiblePathInventoryUnavailable",
        },
      });
    }
  });

  test("keeps an unavailable Git inventory failing when a baseline covers its diagnostic", async () => {
    const baselinePath = ".habitat/sample/sample.baseline.json";
    const inventoryFailureMessage =
      "Git visible-path inventory unavailable: Git could not provide the complete visible path inventory required for bounded structure evaluation.";
    const fixture = {
      files: new Map([
        [`${repoRoot}/${baselinePath}`, JSON.stringify([`.::${inventoryFailureMessage}`])],
      ]),
      directories: new Map<string, readonly HabitatDirectoryEntry[]>(),
    };
    const rules = ruleFactsCatalog({
      schemaVersion: 2,
      ownerRoots: { habitat: "tools/habitat" },
      rules: [
        {
          id: "inventory-required",
          schemaVersion: 2,
          title: "Inventory Required",
          placement: {
            niche: "fixtures",
            blueprint: "_self",
            category: "structure",
          },
          operation: { kind: "check" },
          ownerProject: "habitat",
          lane: "enforced",
          forbids: "unbounded structure evaluation",
          why: "Structure evaluation requires a complete visible-path inventory.",
          remediate: null,
          message: "Restore Git visible-path inventory.",
          runner: {
            name: "habitat",
            mode: "structure",
            files: { structure: ".habitat/sample/sample.structure.toml" },
          },
          supportFiles: { baseline: baselinePath },
          pathCoverage: [{ kind: "exact-path", patterns: ["pkg"] }],
        },
      ],
    });

    const report = await Effect.runPromise(
      createCheckReportEffect(
        { rule: "inventory-required" },
        {
          baselineFileSystem: fileSystemPort(fixture),
          biome: { run: () => failIfCalled("biome") },
          command: { run: () => failIfCalled("command") },
          git: {
            diffNameOnly: () => failIfCalled("git.diffNameOnly"),
            diffNameStatus: () => failIfCalled("git.diffNameStatus"),
            visiblePathInventory: () => Effect.succeed(null),
            lsTreeNameOnly: () => failIfCalled("git.lsTreeNameOnly"),
            mergeBase: () => failIfCalled("git.mergeBase"),
            show: () => failIfCalled("git.show"),
            showIndex: () => failIfCalled("git.showIndex"),
          },
          ruleDiagnostics: { runRules: () => failIfCalled("ruleDiagnostics") },
          nx: {
            runMany: () => failIfCalled("nx.runMany"),
            runTarget: () => failIfCalled("nx.runTarget"),
          },
          repoRoot,
          rules,
          structureFileSystem: fileSystemPort(fixture),
        }
      )
    );

    expect(report.ok).toBe(false);
    expect(report.rules[0]).toMatchObject({
      status: "fail",
      disposition: {
        kind: "execution-failed",
        source: "git-provider",
        failure: "GitVisiblePathInventoryUnavailable",
      },
      diagnostics: [{ baselined: false, message: inventoryFailureMessage }],
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
    pathKind: (targetPath: string) => Effect.succeed(fixturePathKind(fixture, targetPath)),
    makeDirectory: () => Effect.void,
    readDirectory: (targetPath: string) =>
      fixture.directories.has(targetPath)
        ? Effect.succeed(fixture.directories.get(targetPath) ?? [])
        : Effect.fail(
            new FileReadFailed({
              path: targetPath,
              cause: "Missing directory fixture",
            })
          ),
    readText: (targetPath: string) =>
      fixture.files.has(targetPath)
        ? Effect.succeed(fixture.files.get(targetPath) ?? "")
        : Effect.fail(
            new FileReadFailed({
              path: targetPath,
              cause: "Missing file fixture",
            })
          ),
    writeText: () => Effect.void,
  };
}

function unavailableFileSystemPort() {
  return {
    isDirectory: () => failIfCalled("fileSystem.isDirectory"),
    isFile: () => failIfCalled("fileSystem.isFile"),
    pathKind: () => failIfCalled("fileSystem.pathKind"),
    makeDirectory: () => failIfCalled("fileSystem.makeDirectory"),
    readDirectory: () => failIfCalled("fileSystem.readDirectory"),
    readText: () => failIfCalled("fileSystem.readText"),
    writeText: () => failIfCalled("fileSystem.writeText"),
  };
}

function structureRuleRecord(id: string): RuleRegistryRecord {
  return {
    id,
    schemaVersion: 2,
    title: id,
    placement: {
      niche: "fixtures",
      blueprint: "_self",
      category: "structure",
    },
    operation: { kind: "check" },
    ownerProject: "habitat",
    lane: "enforced",
    forbids: "unbounded structure evaluation",
    why: "The test proves shared structure inventory refusal.",
    remediate: null,
    message: "Restore Git visible-path inventory.",
    runner: {
      name: "habitat",
      mode: "structure",
      files: { structure: `.habitat/sample/${id}.structure.toml` },
    },
    pathCoverage: [{ kind: "exact-path", patterns: ["pkg"] }],
  };
}

function fixturePathKind(
  fixture: {
    files: ReadonlyMap<string, string>;
    directories: ReadonlyMap<string, readonly HabitatDirectoryEntry[]>;
  },
  targetPath: string
): HabitatPathKind {
  return Match.value(targetPath).pipe(
    Match.when(
      (candidate) => fixture.directories.has(candidate),
      (): HabitatPathKind => "directory"
    ),
    Match.when(
      (candidate) => fixture.files.has(candidate),
      (): HabitatPathKind => "file"
    ),
    Match.orElse((): HabitatPathKind => "missing")
  );
}

function failIfCalled(label: string): Effect.Effect<never, never> {
  return Effect.die(new Error(`${label} should not be called by structure-check execution`));
}
