import path from "node:path";
import { ruleRegistryRepoPath } from "@habitat/cli/resources/artifact-paths";
import { repoRoot } from "@habitat/cli/resources/paths";
import {
  isDirectorySync,
  readDirectorySync,
  readTextSync,
} from "@habitat/cli/resources/platform/filesystem";
import {
  loadRuleRegistryDocument,
  loadRuleRegistryDocumentEffect,
  parseRuleRegistryDocument,
  parseRuleRegistryText,
  type RuleRegistryDirectoryEntry,
  type RuleRegistryFileSystem,
} from "@habitat/cli/service/model/rules/index";
import { Effect } from "effect";
import { describe, expect, test } from "vitest";
import {
  baseRule,
  expectInvalid,
  gritRunner,
  habitatFileLayerRunner,
  habitatScriptRunner,
  habitatStructureRunner,
  nxRunner,
  registryDocument,
} from "./helpers.js";

describe("rule registry contract", () => {
  test("loads the current registry through the TypeBox schema", () => {
    const rules = loadRuleRegistryDocument(path.join(repoRoot, ruleRegistryRepoPath), {
      isDirectory: isDirectorySync,
      readDirectory: readDirectorySync,
      readText: readTextSync,
    }).rules;

    expect(rules).toHaveLength(124);
    expect(rules.filter((rule) => rule.runner.name === "grit")).toHaveLength(79);
    expect(
      rules.filter((rule) => rule.runner.name === "habitat" && rule.runner.mode === "script")
    ).toHaveLength(31);
    expect(
      rules.filter((rule) => rule.runner.name === "habitat" && rule.runner.mode === "structure")
    ).toHaveLength(8);
    expect(
      rules.filter((rule) => rule.runner.name === "habitat" && rule.runner.mode === "file-layer")
    ).toHaveLength(5);
    expect(rules.filter((rule) => rule.runner.name === "nx")).toHaveLength(1);
    expect(rules.filter((rule) => rule.lane === "advisory")).toHaveLength(1);
    expect(
      rules.filter((rule) => rule.runner.name === "grit").every((rule) => rule.scanRoots.length > 0)
    ).toBe(true);
    expect(rules.every((rule) => rule.pathCoverage.length > 0)).toBe(true);
  });

  test("async directory loading uses the root registry index", async () => {
    const registryDir = "/repo/.habitat";
    const rootIndex = path.join(registryDir, "index.json");
    const rulePath = path.join(
      registryDir,
      "global/workspace/blueprints/project-boundary-model/structure/check/sample-rule/rule.json"
    );
    const fileSystem = virtualRegistryFileSystem({
      [rootIndex]: JSON.stringify({
        schemaVersion: 1,
        ownerRoots: {
          habitat: "tools/habitat",
        },
      }),
      [rulePath]: JSON.stringify(packetRuleInput()),
      [path.join(path.dirname(rulePath), "check.mjs")]: "",
    });

    const document = await Effect.runPromise(
      loadRuleRegistryDocumentEffect(registryDir, fileSystem)
    );

    expect(document.rules.map((rule) => rule.id)).toEqual(["sample-rule"]);
  });

  test("derives packet identity, title, default exception, and structure role path", async () => {
    const registryDir = "/repo/.habitat";
    const rootIndex = path.join(registryDir, "index.json");
    const rulePath = path.join(
      registryDir,
      "docs/blueprints/docs-site/structure/check/require_docs_site_root_inputs/rule.json"
    );
    const fileSystem = virtualRegistryFileSystem({
      [rootIndex]: JSON.stringify({
        schemaVersion: 1,
        ownerRoots: {
          habitat: "tools/habitat",
        },
      }),
      [rulePath]: JSON.stringify(packetRuleInput()),
      [path.join(path.dirname(rulePath), "structure.toml")]: "",
    });

    const document = await Effect.runPromise(
      loadRuleRegistryDocumentEffect(registryDir, fileSystem)
    );

    expect(document.rules).toEqual([
      expect.objectContaining({
        id: "require_docs_site_root_inputs",
        title: "Require Docs Site Root Inputs",
        exceptionPath: "none",
        runner: {
          name: "habitat",
          mode: "structure",
          structurePath:
            ".habitat/docs/blueprints/docs-site/structure/check/require_docs_site_root_inputs/structure.toml",
        },
      }),
    ]);
  });

  test("preserves explicit patternName override while deriving the default", async () => {
    const registryDir = "/repo/.habitat";
    const rootIndex = path.join(registryDir, "index.json");
    const defaultPatternRule = path.join(
      registryDir,
      "docs/blueprints/_self/quality/check/default_pattern_probe/rule.json"
    );
    const overridePatternRule = path.join(
      registryDir,
      "docs/blueprints/_self/quality/check/ensure_docs_checkout_paths_are_portable/rule.json"
    );
    const fileSystem = virtualRegistryFileSystem({
      [rootIndex]: JSON.stringify({
        schemaVersion: 1,
        ownerRoots: {
          habitat: "tools/habitat",
        },
      }),
      [defaultPatternRule]: JSON.stringify(packetRuleInput({ scanRoots: ["docs"] })),
      [path.join(path.dirname(defaultPatternRule), "pattern.md")]: "",
      [overridePatternRule]: JSON.stringify(
        packetRuleInput({
          patternName: "docs_local_checkout_paths",
          scanRoots: ["docs"],
        })
      ),
      [path.join(path.dirname(overridePatternRule), "pattern.md")]: "",
    });

    const document = await Effect.runPromise(
      loadRuleRegistryDocumentEffect(registryDir, fileSystem)
    );

    expect(
      document.rules.map((rule) => [
        rule.id,
        rule.runner.name === "grit" && rule.runner.patternName,
      ])
    ).toEqual([
      ["default_pattern_probe", "default_pattern_probe"],
      ["ensure_docs_checkout_paths_are_portable", "docs_local_checkout_paths"],
    ]);
  });

  test("rejects stale prefixed packet rule files", async () => {
    const registryDir = "/repo/.habitat";
    const rootIndex = path.join(registryDir, "index.json");
    const currentRule = path.join(
      registryDir,
      "global/workspace/blueprints/project-boundary-model/structure/check/sample-rule/rule.json"
    );
    const staleRule = path.join(
      registryDir,
      "global/workspace/blueprints/project-boundary-model/structure/check/sample-rule/sample-rule.rule.json"
    );
    const fileSystem = virtualRegistryFileSystem({
      [rootIndex]: JSON.stringify({
        schemaVersion: 1,
        ownerRoots: {
          habitat: "tools/habitat",
        },
      }),
      [currentRule]: JSON.stringify(packetRuleInput()),
      [path.join(path.dirname(currentRule), "check.mjs")]: "",
      [staleRule]: JSON.stringify(baseRule()),
    });

    await expect(
      Effect.runPromise(loadRuleRegistryDocumentEffect(registryDir, fileSystem))
    ).rejects.toThrow("prefixed rule filenames are stale");
  });

  test("rejects invalid JSON before schema validation", () => {
    const result = parseRuleRegistryText("{", "inline-registry.json");

    expect(result).toMatchObject({
      ok: false,
      issues: [{ code: "registry-json-invalid", path: "inline-registry.json" }],
    });
  });

  test("rejects missing schema version", () => {
    const result = parseRuleRegistryDocument({ rules: [] }, "inline-registry.json");

    expect(result).toMatchObject({
      ok: false,
      issues: [
        {
          code: "registry-schema-invalid",
          path: "inline-registry.json",
        },
      ],
    });
  });

  test("rejects duplicate rule ids", () => {
    const rule = baseRule({ id: "duplicate-rule" });
    const result = parseRuleRegistryDocument(
      registryDocument([rule, { ...rule }]),
      "inline-registry.json"
    );

    expect(result).toMatchObject({
      ok: false,
      issues: [
        {
          code: "registry-duplicate-rule-id",
          path: "inline-registry.json",
          message: 'Duplicate Habitat rule id: "duplicate-rule".',
        },
      ],
    });
  });

  test("rejects stale execution metadata and unsupported lanes", () => {
    expectInvalid(
      parseRuleRegistryDocument(
        registryDocument([{ ...baseRule(), ownerTool: "unknown-tool" }]),
        "inline-registry.json"
      ),
      "registry-schema-invalid"
    );

    expectInvalid(
      parseRuleRegistryDocument(
        registryDocument([{ ...baseRule(), lane: "experimental" }]),
        "inline-registry.json"
      ),
      "registry-schema-invalid"
    );
  });

  test("rejects missing derived identity facts in normalized records", () => {
    const { id: _id, ...missingId } = baseRule();

    expectInvalid(
      parseRuleRegistryDocument(registryDocument([missingId]), "inline-registry.json"),
      "registry-schema-invalid"
    );
  });

  test("rejects missing routing facts", () => {
    const { pathCoverage: _pathCoverage, ...missingRouting } = baseRule();

    expectInvalid(
      parseRuleRegistryDocument(registryDocument([missingRouting]), "inline-registry.json"),
      "registry-schema-invalid"
    );
  });

  test("rejects malformed routing facts", () => {
    for (const pathCoverage of [
      [{ kind: "exact-path" }],
      [{ kind: "exact-path", patterns: [] }],
      [{ kind: "project-owner", patterns: ["packages/**"] }],
      [{ kind: "workspace-gate", reason: "extra state" }],
      [{ kind: "unresolved-metadata" }],
      [{ kind: "unknown-routing-state" }],
    ]) {
      expectInvalid(
        parseRuleRegistryDocument(
          registryDocument([{ ...baseRule(), pathCoverage }]),
          "inline-registry.json"
        ),
        "registry-schema-invalid"
      );
    }
  });

  test("rejects contradicted derived runner fields", () => {
    expectInvalid(
      parseRuleRegistryDocument(
        registryDocument([
          {
            ...baseRule(),
            runner: nxRunner(),
          },
        ]),
        "inline-registry.json"
      ),
      "registry-schema-invalid"
    );

    expectInvalid(
      parseRuleRegistryDocument(
        registryDocument([
          {
            ...baseRule(),
            runner: nxRunner(),
            graphTarget: { project: "habitat", target: "different" },
          },
        ]),
        "inline-registry.json"
      ),
      "registry-schema-invalid"
    );

    expectInvalid(
      parseRuleRegistryDocument(
        registryDocument([{ ...baseRule({ runner: gritRunner("sample-rule") }) }]),
        "inline-registry.json"
      ),
      "registry-schema-invalid"
    );

    expectInvalid(
      parseRuleRegistryDocument(
        registryDocument([
          {
            ...baseRule({ runner: habitatStructureRunner("sample-rule") }),
            structureFile: ".habitat/sample/sample.structure.toml",
            patternName: "not_structure_authority",
          },
        ]),
        "inline-registry.json"
      ),
      "registry-schema-invalid"
    );

    expectInvalid(
      parseRuleRegistryDocument(
        registryDocument([
          {
            ...baseRule({ runner: gritRunner("sample-rule") }),
            patternName: "sample_pattern",
          },
        ]),
        "inline-registry.json"
      ),
      "registry-schema-invalid"
    );

    expectInvalid(
      parseRuleRegistryDocument(
        registryDocument([
          {
            ...baseRule({ runner: habitatFileLayerRunner("generated-zone") }),
            generatedZone: "generated-zone",
            forbiddenFileNames: ["pnpm-lock.yaml"],
          },
        ]),
        "inline-registry.json"
      ),
      "registry-schema-invalid"
    );
  });

  test("rejects malformed downstream metadata ownership", () => {
    expectInvalid(
      parseRuleRegistryDocument(
        registryDocument([{ ...baseRule(), exceptionPath: "" }]),
        "inline-registry.json"
      ),
      "registry-schema-invalid"
    );

    expectInvalid(
      parseRuleRegistryDocument(
        registryDocument([{ ...baseRule(), generatedZone: "swooper-map-generated" }]),
        "inline-registry.json"
      ),
      "registry-schema-invalid"
    );

    expectInvalid(
      parseRuleRegistryDocument(
        registryDocument([{ ...baseRule(), manifestPath: "tools/habitat/rule.json" }]),
        "inline-registry.json"
      ),
      "registry-schema-invalid"
    );

    expectInvalid(
      parseRuleRegistryDocument(
        registryDocument([{ ...baseRule(), hookCheck: true }]),
        "inline-registry.json"
      ),
      "registry-schema-invalid"
    );
  });
});

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

function packetRuleInput(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  const rule: Record<string, unknown> = { ...baseRule(), ...overrides };
  const ruleId = rule.id;
  delete rule.id;
  delete rule.title;
  delete rule.structureFile;
  delete rule.runner;
  if (rule.exceptionPath === "none") delete rule.exceptionPath;
  if (rule.patternName === ruleId) delete rule.patternName;
  return rule;
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
