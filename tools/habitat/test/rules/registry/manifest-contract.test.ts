import path from "node:path";
import {
  habitatArtifactPathPlan,
  loadRuleRegistryDocument,
  loadRuleRegistryDocumentEffect,
  type RuleRegistryDirectoryEntry,
  type RuleRegistryFileSystem,
  type RuleRegistrySyncFileSystem,
} from "@habitat/cli/service/model/rules/index";
import { Effect } from "effect";
import { describe, expect, test } from "vitest";

describe("location-independent rule manifests", () => {
  test("loads a rule manifest from an arbitrary Habitat inventory location", async () => {
    const registryDir = "/repo/.habitat";
    const rulePath = path.join(registryDir, "inventory/current/rules/sample/rule.json");
    const scriptPath = ".habitat/execution/rules/sample/check.mjs";
    const baselinePath = ".habitat/execution/rules/sample/baseline.json";
    const fileSystem = virtualRegistryFileSystem({
      [path.join(registryDir, "index.json")]: JSON.stringify(rulePackIndex()),
      [rulePath]: JSON.stringify(
        ruleManifest({
          id: "sample-location-independent-rule",
          title: "Sample Location Independent Rule",
          runner: {
            name: "habitat",
            mode: "script",
            runtime: "node",
            files: { script: scriptPath },
          },
          artifacts: { baseline: baselinePath },
        })
      ),
      [path.join("/repo", scriptPath)]: "",
      [path.join("/repo", baselinePath)]: "[]\n",
    });

    const document = await Effect.runPromise(
      loadRuleRegistryDocumentEffect(registryDir, fileSystem)
    );

    expect(document.rules).toEqual([
      expect.objectContaining({
        id: "sample-location-independent-rule",
        title: "Sample Location Independent Rule",
        placement: {
          niche: "docs",
          blueprint: "docs-site",
          category: "quality",
          artifactKind: "check",
        },
        runner: {
          name: "habitat",
          mode: "script",
          runtime: "node",
          files: { script: scriptPath },
        },
        artifacts: { baseline: baselinePath },
      }),
    ]);
  });

  test("sync loaders discover arbitrary Habitat inventory locations", () => {
    const registryDir = "/repo/.habitat";
    const rulePath = path.join(registryDir, "future/ontology/rules/sample/rule.json");
    const scriptPath = ".habitat/execution/rules/sync-sample/check.mjs";
    const fileSystem = virtualSyncRegistryFileSystem({
      [path.join(registryDir, "index.json")]: JSON.stringify(rulePackIndex()),
      [rulePath]: JSON.stringify(
        ruleManifest({
          id: "sync-location-independent-rule",
          runner: {
            name: "habitat",
            mode: "script",
            runtime: "node",
            files: { script: scriptPath },
          },
        })
      ),
      [path.join("/repo", scriptPath)]: "",
    });

    const document = loadRuleRegistryDocument(registryDir, fileSystem);

    expect(document.rules).toEqual([
      expect.objectContaining({
        id: "sync-location-independent-rule",
        manifestFilePath: ".habitat/future/ontology/rules/sample/rule.json",
      }),
    ]);
  });

  test("rejects duplicate manifest ids independent of physical location", async () => {
    const registryDir = "/repo/.habitat";
    const firstRulePath = path.join(registryDir, "inventory/current/rules/first/rule.json");
    const secondRulePath = path.join(registryDir, "future/ontology/elsewhere/rule.json");
    const fileSystem = virtualRegistryFileSystem({
      [path.join(registryDir, "index.json")]: JSON.stringify(rulePackIndex()),
      [firstRulePath]: JSON.stringify(ruleManifest({ id: "duplicate-rule" })),
      [secondRulePath]: JSON.stringify(ruleManifest({ id: "duplicate-rule" })),
      [path.join("/repo", defaultScriptPath("duplicate-rule"))]: "",
    });

    await expect(
      Effect.runPromise(loadRuleRegistryDocumentEffect(registryDir, fileSystem))
    ).rejects.toThrow(
      'Duplicate Habitat rule id: "duplicate-rule" in .habitat/future/ontology/elsewhere/rule.json, .habitat/inventory/current/rules/first/rule.json.'
    );
  });

  test("rejects missing explicit runner references before execution", async () => {
    const registryDir = "/repo/.habitat";
    const rulePath = path.join(registryDir, "inventory/current/rules/missing-runner/rule.json");
    const missingScriptPath = ".habitat/execution/rules/missing-runner/check.mjs";
    const baselinePath = ".habitat/execution/rules/missing-runner/baseline.json";
    const fileSystem = virtualRegistryFileSystem({
      [path.join(registryDir, "index.json")]: JSON.stringify(rulePackIndex()),
      [rulePath]: JSON.stringify(
        ruleManifest({
          id: "missing-runner",
          runner: {
            name: "habitat",
            mode: "script",
            runtime: "node",
            files: { script: missingScriptPath },
          },
          artifacts: { baseline: baselinePath },
        })
      ),
      [path.join("/repo", baselinePath)]: "[]\n",
    });

    await expect(
      Effect.runPromise(loadRuleRegistryDocumentEffect(registryDir, fileSystem))
    ).rejects.toThrow(/missing-runner: referenced runner or artifact file does not exist/);
  });

  test("rejects missing explicit artifact references before execution", async () => {
    const registryDir = "/repo/.habitat";
    const rulePath = path.join(registryDir, "inventory/current/rules/missing-baseline/rule.json");
    const scriptPath = ".habitat/execution/rules/missing-baseline/check.mjs";
    const missingBaselinePath = ".habitat/execution/rules/missing-baseline/baseline.json";
    const fileSystem = virtualRegistryFileSystem({
      [path.join(registryDir, "index.json")]: JSON.stringify(rulePackIndex()),
      [rulePath]: JSON.stringify(
        ruleManifest({
          id: "missing-baseline",
          runner: {
            name: "habitat",
            mode: "script",
            runtime: "node",
            files: { script: scriptPath },
          },
          artifacts: { baseline: missingBaselinePath },
        })
      ),
      [path.join("/repo", scriptPath)]: "",
    });

    await expect(
      Effect.runPromise(loadRuleRegistryDocumentEffect(registryDir, fileSystem))
    ).rejects.toThrow(/missing-baseline: referenced runner or artifact file does not exist/);
  });

  test("classifies changed manifest, runner, and baseline files by manifest references", () => {
    const rule = ruleManifest({
      id: "moved-rule",
      runner: {
        name: "habitat",
        mode: "script",
        runtime: "node",
        files: { script: ".habitat/execution/rules/moved-rule/check.mjs" },
      },
      artifacts: { baseline: ".habitat/execution/rules/moved-rule/baseline.json" },
    });

    const plan = habitatArtifactPathPlan(
      [
        ".habitat/future/ontology/rules/moved/rule.json",
        ".habitat/execution/rules/moved-rule/check.mjs",
        ".habitat/execution/rules/moved-rule/baseline.json",
      ],
      [
        {
          id: rule.id,
          manifestFilePath: ".habitat/future/ontology/rules/moved/rule.json",
          runner: rule.runner,
          artifacts: rule.artifacts,
        },
      ]
    );

    expect(plan.nonSourceCheckRuleArtifactIds).toEqual(["moved-rule"]);
    expect(plan.hasUnclassifiedArtifact).toBe(false);
  });
});

function rulePackIndex() {
  return {
    schemaVersion: 1,
    ownerRoots: {
      habitat: "tools/habitat",
    },
  };
}

function ruleManifest(overrides: Record<string, unknown> = {}) {
  const id = String(overrides.id ?? "sample-rule");
  return {
    schemaVersion: 1,
    id,
    title: "Sample Rule",
    placement: {
      niche: "docs",
      blueprint: "docs-site",
      category: "quality",
      artifactKind: "check",
    },
    ownerProject: "habitat",
    lane: "enforced",
    forbids: "fixture violation",
    why: "Fixture rule for location-independent manifest tests.",
    remediate: null,
    message: "Fixture diagnostic.",
    exceptionPath: "none",
    pathCoverage: [{ kind: "project-owner" }],
    runner: {
      name: "habitat",
      mode: "script",
      files: { script: defaultScriptPath(id) },
      runtime: "node",
    },
    ...overrides,
  };
}

function defaultScriptPath(ruleId: string): string {
  return `.habitat/execution/rules/${ruleId}/check.mjs`;
}

function virtualRegistryFileSystem(files: Record<string, string>): RuleRegistryFileSystem<never> {
  const filePaths = Object.keys(files);
  const directories = new Set<string>();
  for (const filePath of filePaths) {
    let current = path.dirname(filePath);
    while (current !== path.dirname(current)) {
      directories.add(current);
      current = path.dirname(current);
    }
  }

  return {
    isDirectory: (registryPath) => Effect.succeed(directories.has(registryPath)),
    readDirectory: (registryPath) =>
      directories.has(registryPath)
        ? Effect.succeed(directoryEntries(registryPath, directories, filePaths))
        : Effect.fail(new Error(`not a directory: ${registryPath}`)),
    readText: (registryPath) =>
      registryPath in files
        ? Effect.succeed(files[registryPath] as string)
        : Effect.fail(new Error(`missing file: ${registryPath}`)),
  };
}

function virtualSyncRegistryFileSystem(files: Record<string, string>): RuleRegistrySyncFileSystem {
  const filePaths = Object.keys(files);
  const directories = new Set<string>();
  for (const filePath of filePaths) {
    let current = path.dirname(filePath);
    while (current !== path.dirname(current)) {
      directories.add(current);
      current = path.dirname(current);
    }
  }

  return {
    isDirectory: (registryPath) => directories.has(registryPath),
    readDirectory: (registryPath) => {
      if (!directories.has(registryPath)) throw new Error(`not a directory: ${registryPath}`);
      return directoryEntries(registryPath, directories, filePaths);
    },
    readText: (registryPath) => {
      if (registryPath in files) return files[registryPath] as string;
      throw new Error(`missing file: ${registryPath}`);
    },
  };
}

function directoryEntries(
  directory: string,
  directories: ReadonlySet<string>,
  filePaths: readonly string[]
): RuleRegistryDirectoryEntry[] {
  const entries = new Map<string, RuleRegistryDirectoryEntry>();
  for (const child of directories) {
    if (path.dirname(child) === directory) {
      entries.set(path.basename(child), { name: path.basename(child), kind: "directory" });
    }
  }
  for (const filePath of filePaths) {
    if (path.dirname(filePath) === directory) {
      entries.set(path.basename(filePath), { name: path.basename(filePath), kind: "file" });
    }
  }
  return [...entries.values()].sort((left, right) => left.name.localeCompare(right.name));
}
