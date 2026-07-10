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
});
