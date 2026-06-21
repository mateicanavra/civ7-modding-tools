import { describe, expect, test } from "vitest";
import {
  parseRuleRegistryDocument,
  parseRuleRegistryText,
} from "../../../src/domains/rule-registry/index.js";
import { rules } from "../../../src/rules/architecture.js";
import { baseRule, expectInvalid, registryDocument } from "./helpers.js";

describe("rule registry contract", () => {
  test("loads the current registry through the TypeBox schema", () => {
    expect(rules).toHaveLength(49);
    expect(rules.filter((rule) => rule.ownerTool === "source-check")).toHaveLength(34);
    expect(rules.filter((rule) => rule.ownerTool === "habitat")).toHaveLength(3);
    expect(rules.filter((rule) => rule.lane === "advisory")).toHaveLength(1);
    expect(
      rules
        .filter((rule) => rule.ownerTool === "source-check")
        .every((rule) => rule.scanRoots.length > 0)
    ).toBe(true);
    expect(rules.every((rule) => rule.pathCoverage.length > 0)).toBe(true);
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
            nxTarget: "@internal/habitat-harness:test:wrapped",
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
        registryDocument([{ ...baseRule(), manifestPath: "tools/habitat-harness/rule.json" }]),
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
