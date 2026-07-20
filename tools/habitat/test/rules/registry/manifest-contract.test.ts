import path from "node:path";
import {
  habitatAuthorityPathPlan,
  loadRuleRegistryDocument,
  loadRuleRegistryDocumentEffect,
  type RuleRegistryDirectoryEntry,
  type RuleRegistryFileSystem,
  type RuleRegistrySyncFileSystem,
} from "@habitat/cli/service/model/rules/index";
import { Effect, Schema } from "effect";
import { describe, expect, test } from "vitest";

describe("location-independent rule manifests", () => {
  test("loads a rule manifest from an arbitrary Habitat inventory location", async () => {
    const registryDir = "/repo/.habitat";
    const rulePath = path.join(registryDir, "inventory/current/rules/sample/rule.json");
    const scriptPath = ".habitat/execution/rules/sample/check.mjs";
    const baselinePath = ".habitat/execution/rules/sample/baseline.json";
    const ruleIntroductionManifestPath = path.posix.join(
      ".habitat",
      "execution",
      "rules",
      "sample",
      "rule-introduction-manifest.json"
    );
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
          supportFiles: {
            baseline: baselinePath,
            ruleIntroductionManifest: ruleIntroductionManifestPath,
          },
        })
      ),
      [path.join("/repo", scriptPath)]: "",
      [path.join("/repo", baselinePath)]: "[]\n",
      [path.join("/repo", ruleIntroductionManifestPath)]: "{}\n",
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
        },
        runner: {
          name: "habitat",
          mode: "script",
          runtime: "node",
          files: { script: scriptPath },
        },
        supportFiles: {
          baseline: baselinePath,
          ruleIntroductionManifest: ruleIntroductionManifestPath,
        },
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

  test("rejects stale category and operation-kind packet nesting", async () => {
    const registryDir = "/repo/.habitat";
    const rulePath = path.join(
      registryDir,
      "docs/blueprints/docs-site/quality/check/stale-shape/rule.json"
    );
    const scriptPath = ".habitat/execution/rules/stale-shape/check.mjs";
    const fileSystem = virtualRegistryFileSystem({
      [path.join(registryDir, "index.json")]: JSON.stringify(rulePackIndex()),
      [rulePath]: JSON.stringify(
        ruleManifest({
          id: "stale-shape",
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

    await expect(
      Effect.runPromise(loadRuleRegistryDocumentEffect(registryDir, fileSystem))
    ).rejects.toThrow(/must not use category\/operation-kind path nesting/);
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
          supportFiles: { baseline: baselinePath },
        })
      ),
      [path.join("/repo", baselinePath)]: "[]\n",
    });

    await expect(
      Effect.runPromise(loadRuleRegistryDocumentEffect(registryDir, fileSystem))
    ).rejects.toThrow(/missing-runner: referenced runner or support file does not exist/);
  });

  test("rejects missing explicit support file references before execution", async () => {
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
          supportFiles: { baseline: missingBaselinePath },
        })
      ),
      [path.join("/repo", scriptPath)]: "",
    });

    await expect(
      Effect.runPromise(loadRuleRegistryDocumentEffect(registryDir, fileSystem))
    ).rejects.toThrow(/missing-baseline: referenced runner or support file does not exist/);
  });

  test("rejects a missing rule introduction manifest before execution", async () => {
    const registryDir = path.join("/repo", ".habitat");
    const rulePath = path.join(
      registryDir,
      "inventory/current/rules/missing-introduction-manifest/rule.json"
    );
    const scriptPath = path.posix.join(
      ".habitat",
      "execution",
      "rules",
      "missing-introduction-manifest",
      "check.mjs"
    );
    const baselinePath = path.posix.join(
      ".habitat",
      "execution",
      "rules",
      "missing-introduction-manifest",
      "baseline.json"
    );
    const missingManifestPath = path.posix.join(
      ".habitat",
      "execution",
      "rules",
      "missing-introduction-manifest",
      "rule-introduction-manifest.json"
    );
    const fileSystem = virtualRegistryFileSystem({
      [path.join(registryDir, "index.json")]: Schema.encodeSync(Schema.parseJson())(
        rulePackIndex()
      ),
      [rulePath]: Schema.encodeSync(Schema.parseJson())(
        ruleManifest({
          id: "missing-introduction-manifest",
          runner: {
            name: "habitat",
            mode: "script",
            runtime: "node",
            files: { script: scriptPath },
          },
          supportFiles: {
            baseline: baselinePath,
            ruleIntroductionManifest: missingManifestPath,
          },
        })
      ),
      [path.join("/repo", scriptPath)]: "",
      [path.join("/repo", baselinePath)]: "[]\n",
    });

    await expect(
      Effect.runPromise(loadRuleRegistryDocumentEffect(registryDir, fileSystem))
    ).rejects.toThrow(
      /missing-introduction-manifest: referenced runner or support file does not exist/
    );
  });

  test("classifies changed manifest, runner, and support files by manifest references", () => {
    const ruleIntroductionManifestPath = path.posix.join(
      ".habitat",
      "execution",
      "rules",
      "moved-rule",
      "rule-introduction-manifest.json"
    );
    const rule = ruleManifest({
      id: "moved-rule",
      runner: {
        name: "habitat",
        mode: "script",
        runtime: "node",
        files: { script: ".habitat/execution/rules/moved-rule/check.mjs" },
      },
      supportFiles: {
        baseline: ".habitat/execution/rules/moved-rule/baseline.json",
        ruleIntroductionManifest: ruleIntroductionManifestPath,
      },
    });

    const plan = habitatAuthorityPathPlan(
      [
        ".habitat/future/ontology/rules/moved/rule.json",
        ".habitat/execution/rules/moved-rule/check.mjs",
        ".habitat/execution/rules/moved-rule/baseline.json",
        ruleIntroductionManifestPath,
      ],
      [
        {
          id: rule.id,
          manifestFilePath: ".habitat/future/ontology/rules/moved/rule.json",
          runner: rule.runner,
          supportFiles: rule.supportFiles,
        },
      ]
    );

    expect(plan.nonSourceCheckRuleIds).toEqual(["moved-rule"]);
    expect(plan.hasUnclassifiedAuthorityFile).toBe(false);
  });
});

function rulePackIndex() {
  return {
    schemaVersion: 2,
    ownerRoots: {
      habitat: "tools/habitat",
    },
  };
}

function ruleManifest(overrides: Record<string, unknown> = {}) {
  const id = String(overrides.id ?? "sample-rule");
  return {
    schemaVersion: 2,
    id,
    title: "Sample Rule",
    placement: {
      niche: "docs",
      blueprint: "docs-site",
      category: "quality",
    },
    operation: { kind: "check" },
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
