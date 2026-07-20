import path from "node:path";
import { ruleRegistryRepoPath } from "@habitat/cli/resources/authority-paths";
import { repoRoot } from "@habitat/cli/resources/paths";
import {
  isDirectorySync,
  readDirectorySync,
  readTextSync,
} from "@habitat/cli/resources/platform/filesystem";
import {
  loadRuleRegistryDocumentWithDiscovery,
  parseRuleRegistryDocument,
  parseRuleRegistryText,
} from "@habitat/cli/service/model/rules/index";
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
  test("loads every registered manifest through the TypeBox schema", () => {
    const registryPath = path.join(repoRoot, ruleRegistryRepoPath);
    const { document, discoveredManifestPaths } = loadRuleRegistryDocumentWithDiscovery(
      registryPath,
      {
        isDirectory: isDirectorySync,
        readDirectory: readDirectorySync,
        readText: readTextSync,
      }
    );
    const { rules } = document;

    expect(discoveredManifestPaths.length).toBeGreaterThan(0);
    expect(rules.map((rule) => rule.manifestFilePath).sort()).toEqual(discoveredManifestPaths);
    expect(new Set(rules.map((rule) => rule.id)).size).toBe(rules.length);
    expect(rules.every((rule) => rule.schemaVersion === 2)).toBe(true);
    expect(rules.every((rule) => rule.operation.kind === "check")).toBe(true);
    expect(rules.every((rule) => rule.id && rule.title && rule.placement && rule.runner)).toBe(
      true
    );
    expect(rules.every((rule) => rule.supportFiles?.baseline)).toBe(true);
    expect(rules.every((rule) => rule.manifestFilePath?.endsWith("/rule.json"))).toBe(true);
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
          message:
            'Duplicate Habitat rule id: "duplicate-rule" in inline-registry.json, inline-registry.json.',
        },
      ],
    });
  });

  test.each([
    ["ownerTool", "unknown-tool"],
    ["detect", ["fixture", "command"]],
    ["scope", "tools/habitat/**"],
  ])("rejects stale execution metadata field %s", (field, value) => {
    expectInvalid(
      parseRuleRegistryDocument(
        registryDocument([{ ...baseRule(), [field]: value }]),
        "inline-registry.json"
      ),
      "registry-schema-invalid"
    );
  });

  test("rejects the retired active-registry manifestPath field", () => {
    expectInvalid(
      parseRuleRegistryDocument(
        registryDocument([
          {
            ...baseRule({ runner: gritRunner("manifest-path") }),
            scanRoots: ["tools/habitat"],
            manifestPath: ".habitat/patterns/manifests/manifest-path.json",
          },
        ]),
        "inline-registry.json"
      ),
      "registry-schema-invalid"
    );
  });

  test("rejects unsupported lanes", () => {
    expectInvalid(
      parseRuleRegistryDocument(
        registryDocument([{ ...baseRule(), lane: "experimental" }]),
        "inline-registry.json"
      ),
      "registry-schema-invalid"
    );
  });

  test("rejects missing manifest identity, placement, and runner facts", () => {
    const { id: _id, ...missingId } = baseRule();
    const { title: _title, ...missingTitle } = baseRule();
    const { placement: _placement, ...missingPlacement } = baseRule();
    const { runner: _runner, ...missingRunner } = baseRule();

    for (const candidate of [missingId, missingTitle, missingPlacement, missingRunner]) {
      expectInvalid(
        parseRuleRegistryDocument(registryDocument([candidate]), "inline-registry.json"),
        "registry-schema-invalid"
      );
    }
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

  test("rejects contradicted runner-specific fields", () => {
    expectInvalid(
      parseRuleRegistryDocument(
        registryDocument([{ ...baseRule(), runner: nxRunner() }]),
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

  test("accepts each explicit runner shape", () => {
    const result = parseRuleRegistryDocument(
      registryDocument([
        { ...baseRule({ id: "grit-rule", runner: gritRunner("grit-rule") }), scanRoots: ["src"] },
        baseRule({ id: "script-rule", runner: habitatScriptRunner("script-rule") }),
        baseRule({ id: "structure-rule", runner: habitatStructureRunner("structure-rule") }),
        {
          ...baseRule({
            id: "generated-zone-rule",
            runner: habitatFileLayerRunner("generated-zone"),
          }),
          generatedZone: "dist/generated",
        },
        {
          ...baseRule({ id: "nx-rule", runner: nxRunner("habitat", "check") }),
          graphTarget: { project: "habitat", target: "check" },
        },
      ]),
      "inline-registry.json"
    );

    expect(result).toMatchObject({ ok: true });
  });

  test.each([
    "/absolute/pattern.md",
    "patterns/pattern.md",
    ".habitat\\rules\\pattern.md",
    ".habitat//rules/pattern.md",
    ".habitat/./rules/pattern.md",
    ".habitat/rules/../pattern.md",
    ".habitat/",
  ])("rejects non-authoritative Grit pattern path %s", (pattern) => {
    const runner = gritRunner("path-authority");
    expectInvalid(
      parseRuleRegistryDocument(
        registryDocument([
          {
            ...baseRule({ id: "path-authority", runner }),
            runner: { ...runner, files: { pattern } },
            scanRoots: ["tools/habitat"],
          },
        ]),
        "inline-registry.json"
      ),
      "registry-schema-invalid"
    );
  });

  test("requires fix admission and its asset to be one closed Grit runner field", () => {
    const runner = gritRunner("apply-authority");
    for (const fix of [
      { kind: "plan-only" },
      { pattern: ".habitat/fixtures/fix.pattern.md" },
      { kind: "write", pattern: ".habitat/fixtures/fix.pattern.md" },
      { kind: "plan-only", pattern: "../outside.pattern.md" },
    ]) {
      expectInvalid(
        parseRuleRegistryDocument(
          registryDocument([
            {
              ...baseRule({ id: "apply-authority", runner }),
              runner: { ...runner, fix },
              scanRoots: ["tools/habitat"],
            },
          ]),
          "inline-registry.json"
        ),
        "registry-schema-invalid"
      );
    }

    expectInvalid(
      parseRuleRegistryDocument(
        registryDocument([
          {
            ...baseRule({ id: "legacy-apply-asset", runner }),
            runner: {
              ...runner,
              files: { ...runner.files, applyPattern: ".habitat/fixtures/fix.pattern.md" },
            },
            scanRoots: ["tools/habitat"],
          },
        ]),
        "inline-registry.json"
      ),
      "registry-schema-invalid"
    );
  });

  test("rejects invalid Grit asset authority before probing the referenced path", () => {
    const registryPath = "/repo/.habitat/rules";
    const indexPath = `${registryPath}/index.json`;
    const rulePath = `${registryPath}/sample/rule.json`;
    const runner = gritRunner("asset-order");
    const rule = {
      ...baseRule({ id: "asset-order", runner }),
      runner: { ...runner, files: { pattern: "outside/pattern.md" } },
      scanRoots: ["tools/habitat"],
    };
    const reads: string[] = [];
    expect(() =>
      loadRuleRegistryDocumentWithDiscovery(registryPath, {
        isDirectory: (candidate) => candidate === registryPath,
        readDirectory: (candidate) =>
          candidate === registryPath
            ? [
                { name: "index.json", kind: "file" },
                { name: "sample", kind: "directory" },
              ]
            : [{ name: "rule.json", kind: "file" }],
        readText: (candidate) => {
          reads.push(candidate);
          if (candidate === indexPath) {
            return JSON.stringify({
              schemaVersion: 2,
              ownerRoots: { habitat: "tools/habitat" },
            });
          }
          if (candidate === rulePath) return JSON.stringify(rule);
          throw new Error(`unexpected referenced-file read: ${candidate}`);
        },
      })
    ).toThrow(/normalized relative \.habitat/);
    expect(reads).toEqual([indexPath, indexPath, rulePath]);
  });
});
