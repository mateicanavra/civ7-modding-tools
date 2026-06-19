import { describe, expect, test } from "vitest";
import {
  ruleBaselineFacts,
  ruleCommandExecutionFacts,
  ruleFileLayerFacts,
  ruleGovernanceFacts,
  ruleGraphFacts,
  ruleGritFacts,
  ruleLocalFeedbackFacts,
  ruleRoutingFacts,
} from "../../../src/rules/registry/index.js";
import { baseRule } from "./helpers.js";

describe("rule registry projections", () => {
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

  test("projects governance facts only for registered manifest references", () => {
    expect(
      ruleGovernanceFacts([
        baseRule({
          id: "registered-grit-rule",
          ownerTool: "grit-check",
          gritPattern: "registered_grit_rule",
          scanRoots: ["packages"],
          manifestPath:
            "tools/habitat-harness/src/rules/pattern-authority/registered-grit-rule.json",
        }),
        baseRule({
          id: "metadata-only-grit-rule",
          ownerTool: "grit-check",
          gritPattern: "metadata_only_grit_rule",
          scanRoots: ["packages"],
        }),
        baseRule({
          id: "command-rule",
          ownerTool: "habitat-native",
        }),
      ])
    ).toEqual([
      {
        id: "registered-grit-rule",
        lane: "enforced",
        gritPattern: "registered_grit_rule",
        manifestPath: "tools/habitat-harness/src/rules/pattern-authority/registered-grit-rule.json",
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
