import path from "node:path";
import { NodeContext } from "@effect/platform-node";
import { FileReadFailed } from "@habitat/cli/resources/errors/index";
import {
  habitatAuthorityPathPlan,
  loadRuleRegistryDocument,
  loadRuleRegistryDocumentEffect,
  type RuleRegistryDirectoryEntry,
  type RuleRegistryFileSystem,
  type RuleRegistryRecord,
  type RuleRegistrySyncFileSystem,
} from "@habitat/cli/service/model/rules/index";
import { Effect, Match, Schema } from "effect";
import { describe, expect, test } from "vitest";

const withNodeContext = Effect.provide(NodeContext.layer);
const stringifyJsonDocument = Schema.encodeSync(Schema.parseJson());

describe("location-independent rule manifests", () => {
  test("loads a rule manifest from an arbitrary Habitat inventory location", async () => {
    const registryDir = registryDirectory();
    const rulePath = path.join(registryDir, "inventory/current/rules/sample/rule.json");
    const scriptPath = executionRulePath("sample", "check.mjs");
    const baselinePath = executionRulePath("sample", "baseline.json");
    const ruleIntroductionManifestPath = path.posix.join(
      ".habitat",
      "execution",
      "rules",
      "sample",
      "rule-introduction-manifest.json"
    );
    const fileSystem = virtualRegistryFileSystem({
      [path.join(registryDir, "index.json")]: stringifyJsonDocument(rulePackIndex()),
      [rulePath]: stringifyJsonDocument(
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
      loadRuleRegistryDocumentEffect(registryDir, fileSystem).pipe(withNodeContext)
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
    const registryDir = registryDirectory();
    const rulePath = path.join(registryDir, "future/ontology/rules/sample/rule.json");
    const scriptPath = executionRulePath("sync-sample", "check.mjs");
    const fileSystem = virtualSyncRegistryFileSystem({
      [path.join(registryDir, "index.json")]: stringifyJsonDocument(rulePackIndex()),
      [rulePath]: stringifyJsonDocument(
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
    const registryDir = registryDirectory();
    const rulePath = path.join(
      registryDir,
      "docs/blueprints/docs-site/quality/check/stale-shape/rule.json"
    );
    const scriptPath = executionRulePath("stale-shape", "check.mjs");
    const fileSystem = virtualRegistryFileSystem({
      [path.join(registryDir, "index.json")]: stringifyJsonDocument(rulePackIndex()),
      [rulePath]: stringifyJsonDocument(
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
      Effect.runPromise(
        loadRuleRegistryDocumentEffect(registryDir, fileSystem).pipe(withNodeContext)
      )
    ).rejects.toThrow(/must not use category\/operation-kind path nesting/);
  });

  test("rejects duplicate manifest ids independent of physical location", async () => {
    const registryDir = registryDirectory();
    const firstRulePath = path.join(registryDir, "inventory/current/rules/first/rule.json");
    const secondRulePath = path.join(registryDir, "future/ontology/elsewhere/rule.json");
    const fileSystem = virtualRegistryFileSystem({
      [path.join(registryDir, "index.json")]: stringifyJsonDocument(rulePackIndex()),
      [firstRulePath]: stringifyJsonDocument(ruleManifest({ id: "duplicate-rule" })),
      [secondRulePath]: stringifyJsonDocument(ruleManifest({ id: "duplicate-rule" })),
      [path.join("/repo", defaultScriptPath("duplicate-rule"))]: "",
    });

    await expect(
      Effect.runPromise(
        loadRuleRegistryDocumentEffect(registryDir, fileSystem).pipe(withNodeContext)
      )
    ).rejects.toThrow(
      'Duplicate Habitat rule id: "duplicate-rule" in .habitat/future/ontology/elsewhere/rule.json, .habitat/inventory/current/rules/first/rule.json.'
    );
  });

  test("rejects missing explicit runner references before execution", async () => {
    const registryDir = registryDirectory();
    const rulePath = path.join(registryDir, "inventory/current/rules/missing-runner/rule.json");
    const missingScriptPath = executionRulePath("missing-runner", "check.mjs");
    const baselinePath = executionRulePath("missing-runner", "baseline.json");
    const fileSystem = virtualRegistryFileSystem({
      [path.join(registryDir, "index.json")]: stringifyJsonDocument(rulePackIndex()),
      [rulePath]: stringifyJsonDocument(
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
      Effect.runPromise(
        loadRuleRegistryDocumentEffect(registryDir, fileSystem).pipe(withNodeContext)
      )
    ).rejects.toThrow(/missing-runner: referenced runner or support file does not exist/);
  });

  test("rejects a missing admitted fix pattern before preview", async () => {
    const registryDir = path.join("/", "repo", ".habitat");
    const rulePath = path.join(registryDir, "inventory/current/rules/missing-fix/rule.json");
    const patternPath = path.posix.join(".habitat", "execution/rules/missing-fix/pattern.md");
    const fixPatternPath = path.posix.join(
      ".habitat",
      "execution/rules/missing-fix/fix.pattern.md"
    );
    const baselinePath = path.posix.join(".habitat", "execution/rules/missing-fix/baseline.json");
    const fileSystem = virtualRegistryFileSystem({
      [path.join(registryDir, "index.json")]: stringifyJsonDocument(rulePackIndex()),
      [rulePath]: stringifyJsonDocument(
        ruleManifest({
          id: "missing-fix",
          pathCoverage: [{ kind: "exact-path", patterns: ["tools/habitat/**"] }],
          scanRoots: ["tools/habitat"],
          runner: {
            name: "grit",
            files: { pattern: patternPath },
            patternName: "missing_fix",
            fix: { kind: "preview-only", pattern: fixPatternPath, effects: ["modify"] },
          },
          supportFiles: { baseline: baselinePath },
        })
      ),
      [path.join("/repo", patternPath)]: "pattern body\n",
      [path.join("/repo", baselinePath)]: "[]\n",
    });

    await expect(
      Effect.runPromise(
        loadRuleRegistryDocumentEffect(registryDir, fileSystem).pipe(withNodeContext)
      )
    ).rejects.toThrow(/missing-fix: referenced runner or support file does not exist/);
  });

  test("rejects fix admission with non-exact coverage through manifest loading", async () => {
    const registryDir = path.join("/", "repo", ".habitat");
    const rulePath = path.join(registryDir, "inventory/current/rules/broad-fix/rule.json");
    const patternPath = path.posix.join(
      ".habitat",
      "execution",
      "rules",
      "broad-fix",
      "pattern.md"
    );
    const fixPatternPath = path.posix.join(
      ".habitat",
      "execution",
      "rules",
      "broad-fix",
      "fix.pattern.md"
    );
    const fileSystem = virtualRegistryFileSystem({
      [path.join(registryDir, "index.json")]: stringifyJsonDocument(rulePackIndex()),
      [rulePath]: stringifyJsonDocument(
        ruleManifest({
          id: "broad-fix",
          scanRoots: ["tools/habitat"],
          runner: {
            name: "grit",
            files: { pattern: patternPath },
            patternName: "broad_fix",
            fix: { kind: "preview-only", pattern: fixPatternPath, effects: ["modify"] },
          },
        })
      ),
      [path.join("/repo", patternPath)]: "pattern body\n",
      [path.join("/repo", fixPatternPath)]: "pattern body\n",
    });

    await expect(
      Effect.runPromise(
        loadRuleRegistryDocumentEffect(registryDir, fileSystem).pipe(withNodeContext)
      )
    ).rejects.toThrow(/fix preview admission requires exact-path coverage only/);
  });

  test("rejects missing explicit support file references before execution", async () => {
    const registryDir = registryDirectory();
    const rulePath = path.join(registryDir, "inventory/current/rules/missing-baseline/rule.json");
    const scriptPath = executionRulePath("missing-baseline", "check.mjs");
    const missingBaselinePath = executionRulePath("missing-baseline", "baseline.json");
    const fileSystem = virtualRegistryFileSystem({
      [path.join(registryDir, "index.json")]: stringifyJsonDocument(rulePackIndex()),
      [rulePath]: stringifyJsonDocument(
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
      Effect.runPromise(
        loadRuleRegistryDocumentEffect(registryDir, fileSystem).pipe(withNodeContext)
      )
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
      Effect.runPromise(
        loadRuleRegistryDocumentEffect(registryDir, fileSystem).pipe(withNodeContext)
      )
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
    const rule: RuleRegistryRecord = ruleManifest({
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

function ruleManifest<const Overrides extends Record<string, unknown>>(overrides?: Overrides) {
  const id = String(overrides?.id ?? "sample-rule");
  const base = {
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
  } satisfies RuleRegistryRecord;
  return { ...base, ...overrides };
}

function defaultScriptPath(ruleId: string): string {
  return executionRulePath(ruleId, "check.mjs");
}

function registryDirectory(): string {
  return path.join("/", "repo", ".habitat");
}

function executionRulePath(ruleId: string, fileName: string): string {
  return path.posix.join(".habitat", "execution", "rules", ruleId, fileName);
}

function virtualRegistryFileSystem(files: Record<string, string>): RuleRegistryFileSystem {
  const filePaths = Object.keys(files);
  const directories = ancestorDirectories(filePaths);

  return {
    isDirectory: (registryPath) => Effect.succeed(directories.has(registryPath)),
    readDirectory: (registryPath) =>
      Match.value(directories.has(registryPath)).pipe(
        Match.when(true, () =>
          Effect.succeed(directoryEntries(registryPath, directories, filePaths))
        ),
        Match.orElse(() => Effect.die(new Error(`not a directory: ${registryPath}`)))
      ),
    readText: (registryPath) =>
      Match.value(files[registryPath]).pipe(
        Match.when(Match.undefined, () =>
          Effect.fail(new FileReadFailed({ path: registryPath, cause: "missing registry fixture" }))
        ),
        Match.orElse((contents) => Effect.succeed(contents))
      ),
  };
}

function virtualSyncRegistryFileSystem(files: Record<string, string>): RuleRegistrySyncFileSystem {
  const filePaths = Object.keys(files);
  const directories = ancestorDirectories(filePaths);

  return {
    isDirectory: (registryPath) => directories.has(registryPath),
    readDirectory: (registryPath) =>
      Match.value(directories.has(registryPath)).pipe(
        Match.when(true, () => directoryEntries(registryPath, directories, filePaths)),
        Match.orElse(() => {
          throw new Error(`not a directory: ${registryPath}`);
        })
      ),
    readText: (registryPath) =>
      Match.value(files[registryPath]).pipe(
        Match.when(Match.undefined, () => {
          throw new Error(`missing file: ${registryPath}`);
        }),
        Match.orElse((contents) => contents)
      ),
  };
}

function ancestorDirectories(filePaths: readonly string[]): ReadonlySet<string> {
  return new Set(filePaths.flatMap(pathAncestors));
}

function pathAncestors(filePath: string): string[] {
  const parent = path.dirname(filePath);
  return Match.value(parent === path.dirname(parent)).pipe(
    Match.when(true, () => []),
    Match.orElse(() => [parent, ...pathAncestors(parent)])
  );
}

function directoryEntries(
  directory: string,
  directories: ReadonlySet<string>,
  filePaths: readonly string[]
): RuleRegistryDirectoryEntry[] {
  const childDirectories = [...directories]
    .filter((child) => path.dirname(child) === directory)
    .map((child) => ({ name: path.basename(child), kind: "directory" as const }));
  const childFiles = filePaths
    .filter((filePath) => path.dirname(filePath) === directory)
    .map((filePath) => ({ name: path.basename(filePath), kind: "file" as const }));
  return [...childDirectories, ...childFiles].sort((left, right) =>
    left.name.localeCompare(right.name)
  );
}
