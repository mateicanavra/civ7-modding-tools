import { describe, expect, test } from "vitest";
import { rules } from "../../src/rules/architecture.js";
import {
  parseRuleRegistryDocument,
  parseRuleRegistryText,
  type RuleRegistryDocumentV1,
  type RuleRegistryRecordV1,
  ruleBaselineFacts,
  ruleCommandExecutionFacts,
  ruleFileLayerFacts,
  ruleGraphFacts,
  ruleGritFacts,
  ruleLocalFeedbackFacts,
  ruleRoutingFacts,
} from "../../src/rules/registry.js";

describe("rule registry contract", () => {
  test("loads the current registry through the TypeBox schema", () => {
    expect(rules).toHaveLength(52);
    expect(rules.filter((rule) => rule.ownerTool === "grit-check")).toHaveLength(32);
    expect(rules.filter((rule) => rule.lane === "advisory")).toHaveLength(3);
    expect(rules.some((rule) => "hookScope" in rule)).toBe(false);
    expect(
      rules
        .filter((rule) => rule.ownerTool === "grit-check")
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
            ownerTool: "wrapped-test",
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
            ownerTool: "wrapped-test",
            nxTarget: "@internal/habitat-harness:test:legacy",
          },
        ]),
        "inline-registry.json"
      ),
      "registry-schema-invalid"
    );

    expectInvalid(
      parseRuleRegistryDocument(
        registryDocument([{ ...baseRule({ ownerTool: "grit-check" }) }]),
        "inline-registry.json"
      ),
      "registry-schema-invalid"
    );

    expectInvalid(
      parseRuleRegistryDocument(
        registryDocument([
          {
            ...baseRule({ ownerTool: "grit-check" }),
            gritPattern: "sample_pattern",
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

  test("keeps local feedback out of Grit execution facts", () => {
    const rule = baseRule({
      ownerTool: "grit-check",
      gritPattern: "sample_pattern",
      scanRoots: ["packages"],
      localFeedback: true,
    });

    expect(ruleGritFacts([rule])).toEqual([
      {
        id: "sample-rule",
        lane: "enforced",
        message: "Fix the structural issue.",
        gritPattern: "sample_pattern",
        scanRoots: ["packages"],
      },
    ]);
    expect(ruleLocalFeedbackFacts([rule])).toEqual([
      {
        id: "sample-rule",
        localFeedback: true,
      },
    ]);
  });

  test("projects consumer facts without routing or baseline fields", () => {
    const commandRule = baseRule();
    const gritRule = baseRule({
      id: "grit-rule",
      ownerTool: "grit-check",
      gritPattern: "sample_pattern",
      scanRoots: ["packages"],
      localFeedback: true,
    });
    const fileLayerRule = baseRule({
      id: "file-layer-rule",
      ownerTool: "file-layer",
      generatedZone: "swooper-map-generated",
    });

    expect(ruleCommandExecutionFacts([commandRule, gritRule, fileLayerRule])).toEqual([
      {
        id: "sample-rule",
        ownerTool: "habitat-native",
        lane: "enforced",
        detect: ["habitat", "check", "--rule", "sample-rule"],
        message: "Fix the structural issue.",
      },
    ]);
    expect(ruleGritFacts([commandRule, gritRule, fileLayerRule])).toEqual([
      {
        id: "grit-rule",
        lane: "enforced",
        message: "Fix the structural issue.",
        gritPattern: "sample_pattern",
        scanRoots: ["packages"],
      },
    ]);
    expect(ruleFileLayerFacts([commandRule, gritRule, fileLayerRule])).toEqual([
      {
        id: "file-layer-rule",
        ownerTool: "file-layer",
        lane: "enforced",
        message: "Fix the structural issue.",
        generatedZone: "swooper-map-generated",
      },
    ]);
  });

  test("projects routing facts without prose scope", () => {
    const sourceRule = baseRule({
      pathCoverage: [{ kind: "exact-path", patterns: ["packages/**"] }],
    });
    const projected = ruleRoutingFacts([sourceRule]);

    expect(projected).toEqual([
      {
        id: "sample-rule",
        ownerTool: "habitat-native",
        ownerProject: "@internal/habitat-harness",
        pathCoverage: [{ kind: "exact-path", patterns: ["packages/**"] }],
      },
    ]);
    const [coverage] = projected[0]?.pathCoverage ?? [];
    if (coverage?.kind === "exact-path") coverage.patterns.push("apps/**");
    expect(sourceRule.pathCoverage).toEqual([{ kind: "exact-path", patterns: ["packages/**"] }]);
  });

  test("projects baseline facts without owner, routing, execution, or report fields", () => {
    expect(
      ruleBaselineFacts([
        baseRule({
          exceptionPath: "scripts/lint/lint-adapter-boundary.sh#ALLOWLIST",
          ownerTool: "grit-check",
          gritPattern: "sample_pattern",
          scanRoots: ["packages"],
          localFeedback: true,
          manifestPath: "tools/habitat-harness/src/rules/pattern-authority/sample-rule.json",
        }),
      ])
    ).toEqual([
      {
        id: "sample-rule",
        exceptionPath: "scripts/lint/lint-adapter-boundary.sh#ALLOWLIST",
      },
    ]);
  });

  test("projects graph facts from owner roots and structured targets", () => {
    const ownerRoots = new Map([
      ["@internal/habitat-harness", "tools/habitat-harness"],
      ["mod-swooper-maps", "mods/mod-swooper-maps"],
    ]);

    expect(
      ruleGraphFacts(
        [
          baseRule({ id: "biome-ci" }),
          baseRule({
            id: "wrapped-test-rule",
            ownerProject: "mod-swooper-maps",
            ownerTool: "wrapped-test",
            graphTarget: {
              project: "mod-swooper-maps",
              target: "test:architecture-core-purity",
            },
          }),
          baseRule({ id: "direct-rule" }),
        ],
        ownerRoots
      )
    ).toEqual([
      {
        id: "biome-ci",
        ownerProject: "@internal/habitat-harness",
        ownerRoot: "tools/habitat-harness",
        alias: {
          kind: "depends-on",
          target: { project: "@internal/habitat-harness", target: "biome:ci" },
        },
      },
      {
        id: "wrapped-test-rule",
        ownerProject: "mod-swooper-maps",
        ownerRoot: "mods/mod-swooper-maps",
        alias: {
          kind: "depends-on",
          target: { project: "mod-swooper-maps", target: "test:architecture-core-purity" },
        },
      },
      {
        id: "direct-rule",
        ownerProject: "@internal/habitat-harness",
        ownerRoot: "tools/habitat-harness",
        alias: { kind: "direct-rule-check" },
      },
    ]);

    expect(() => ruleGraphFacts([baseRule({ ownerProject: "unknown-owner" })], ownerRoots)).toThrow(
      "unknown ownerProject"
    );
  });
});

function registryDocument(rules: unknown[]): unknown {
  return {
    schemaVersion: 1,
    ownerRoots: {
      "@internal/habitat-harness": "tools/habitat-harness",
      "mod-swooper-maps": "mods/mod-swooper-maps",
    },
    rules,
  };
}

function expectInvalid(
  result: ReturnType<typeof parseRuleRegistryDocument>,
  code: "registry-schema-invalid" | "registry-duplicate-rule-id" | "registry-json-invalid"
): void {
  expect(result.ok).toBe(false);
  if (!result.ok) expect(result.issues.some((issue) => issue.code === code)).toBe(true);
}

function baseRule(overrides: Record<string, unknown> = {}): RuleRegistryRecordV1 {
  const rule = {
    id: "sample-rule",
    ownerTool: "habitat-native",
    ownerProject: "@internal/habitat-harness",
    lane: "enforced",
    scope: "workspace",
    forbids: "broken structure",
    why: "Keeps the workspace structurally coherent.",
    detect: ["habitat", "check", "--rule", "sample-rule"],
    remediate: null,
    message: "Fix the structural issue.",
    exceptionPath: "none",
    pathCoverage: [{ kind: "project-owner" }],
  } satisfies RuleRegistryRecordV1;
  return { ...rule, ...overrides } as RuleRegistryRecordV1;
}
