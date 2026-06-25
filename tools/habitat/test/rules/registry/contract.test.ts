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
import { baseRule, expectInvalid, registryDocument } from "./helpers.js";

describe("rule registry contract", () => {
  test("loads the current registry through the TypeBox schema", () => {
    const rules = loadRuleRegistryDocument(path.join(repoRoot, ruleRegistryRepoPath), {
      isDirectory: isDirectorySync,
      readDirectory: readDirectorySync,
      readText: readTextSync,
    }).rules;

    expect(rules).toHaveLength(60);
    expect(rules.filter((rule) => rule.ownerTool === "source-check")).toHaveLength(29);
    expect(rules.filter((rule) => rule.ownerTool === "command-check")).toHaveLength(23);
    expect(rules.filter((rule) => rule.ownerTool === "file-layer")).toHaveLength(5);
    expect(rules.filter((rule) => rule.ownerTool === "format-check")).toHaveLength(1);
    expect(rules.filter((rule) => rule.ownerTool === "grit-check")).toHaveLength(1);
    expect(rules.filter((rule) => rule.ownerTool === "nx")).toHaveLength(1);
    expect(rules.filter((rule) => rule.lane === "advisory")).toHaveLength(1);
    expect(
      rules
        .filter((rule) => rule.ownerTool === "source-check")
        .every((rule) => rule.scanRoots.length > 0)
    ).toBe(true);
    expect(rules.every((rule) => rule.pathCoverage.length > 0)).toBe(true);
  });

  test("async directory loading falls back when the root index is absent", async () => {
    const registryDir = "/repo/.habitat";
    const fallbackIndex = path.join(
      registryDir,
      "habitat/toolkit/_self/triage/rule-pack-index/index.json"
    );
    const rulePath = path.join(
      registryDir,
      "global/repository/_self/check/sample-rule/sample-rule.rule.json"
    );
    const fileSystem = virtualRegistryFileSystem({
      [fallbackIndex]: JSON.stringify({
        schemaVersion: 1,
        ownerRoots: {
          habitat: "tools/habitat",
        },
      }),
      [rulePath]: JSON.stringify(baseRule()),
    });

    const document = await Effect.runPromise(
      loadRuleRegistryDocumentEffect(registryDir, fileSystem)
    );

    expect(document.rules.map((rule) => rule.id)).toEqual(["sample-rule"]);
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

  test("rejects unknown adapters and unsupported lanes", () => {
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

  test("rejects missing identity facts", () => {
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

  test("rejects contradicted variant fields", () => {
    expectInvalid(
      parseRuleRegistryDocument(
        registryDocument([
          {
            ...baseRule(),
            ownerTool: "nx",
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
            ownerTool: "nx",
            nxTarget: "habitat:test:wrapped",
          },
        ]),
        "inline-registry.json"
      ),
      "registry-schema-invalid"
    );

    expectInvalid(
      parseRuleRegistryDocument(
        registryDocument([{ ...baseRule({ ownerTool: "source-check" }) }]),
        "inline-registry.json"
      ),
      "registry-schema-invalid"
    );

    expectInvalid(
      parseRuleRegistryDocument(
        registryDocument([
          {
            ...baseRule({ ownerTool: "source-check" }),
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
            ...baseRule({ ownerTool: "file-layer" }),
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
