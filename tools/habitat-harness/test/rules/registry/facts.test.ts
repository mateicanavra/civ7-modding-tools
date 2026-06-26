import {
  ruleBaselineFacts,
  ruleCommandExecutionFacts,
  ruleFileLayerFacts,
  ruleGraphFacts,
  ruleHookCheckFacts,
  ruleManifestFacts,
  ruleRoutingFacts,
  ruleSourceFacts,
} from "@internal/habitat-harness/service/model/rules/index";
import { workspaceGraphTargetNames } from "@internal/habitat-harness/service/model/workspace/index";
import { describe, expect, test } from "vitest";
import { baseRule } from "./helpers.js";

describe("rule registry facts", () => {
  test("keeps hook check out of Grit execution facts", () => {
    const rule = baseRule({
      ownerTool: "source-check",
      patternName: "sample_pattern",
      scanRoots: ["packages"],
      hookCheck: true,
    });

    expect(ruleSourceFacts([rule])).toEqual([
      {
        id: "sample-rule",
        lane: "enforced",
        message: "Fix the structural issue.",
        patternName: "sample_pattern",
        pathCoverage: [{ kind: "project-owner" }],
        scanRoots: ["packages"],
      },
    ]);
    expect(ruleHookCheckFacts([rule])).toEqual([
      {
        id: "sample-rule",
        hookCheck: true,
      },
    ]);
  });

  test("projects consumer facts without routing or baseline fields", () => {
    const commandRule = baseRule();
    const gritRule = baseRule({
      id: "rule",
      ownerTool: "source-check",
      patternName: "sample_pattern",
      scanRoots: ["packages"],
      hookCheck: true,
    });
    const fileLayerRule = baseRule({
      id: "file-layer-rule",
      ownerTool: "file-layer",
      generatedZone: "swooper-map-generated",
    });

    expect(ruleCommandExecutionFacts([commandRule, gritRule, fileLayerRule])).toEqual([
      {
        id: "sample-rule",
        ownerTool: "command-check",
        lane: "enforced",
        detect: ["habitat", "check", "--rule", "sample-rule"],
        message: "Fix the structural issue.",
      },
    ]);
    expect(ruleSourceFacts([commandRule, gritRule, fileLayerRule])).toEqual([
      {
        id: "rule",
        lane: "enforced",
        message: "Fix the structural issue.",
        patternName: "sample_pattern",
        pathCoverage: [{ kind: "project-owner" }],
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
        ownerTool: "command-check",
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
          ownerTool: "source-check",
          patternName: "sample_pattern",
          scanRoots: ["packages"],
          hookCheck: true,
          manifestPath: ".habitat/patterns/manifests/sample-rule.json",
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
      ruleManifestFacts([
        baseRule({
          id: "registered-rule",
          ownerTool: "source-check",
          patternName: "registered_grit_rule",
          scanRoots: ["packages"],
          manifestPath: ".habitat/patterns/manifests/registered-rule.json",
        }),
        baseRule({
          id: "metadata-only-rule",
          ownerTool: "source-check",
          patternName: "metadata_only_grit_rule",
          scanRoots: ["packages"],
        }),
        baseRule({
          id: "command-rule",
          ownerTool: "command-check",
        }),
      ])
    ).toEqual([
      {
        id: "registered-rule",
        lane: "enforced",
        patternName: "registered_grit_rule",
        manifestPath: ".habitat/patterns/manifests/registered-rule.json",
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
          baseRule({ id: "format-ci" }),
          baseRule({
            id: "nx-rule",
            ownerProject: "mod-swooper-maps",
            ownerTool: "nx",
            graphTarget: {
              project: "mod-swooper-maps",
              target: "test:architecture-core-purity",
            },
          }),
          baseRule({ id: "direct-rule" }),
        ],
        ownerRoots,
        workspaceGraphTargetNames()
      )
    ).toEqual([
      {
        id: "format-ci",
        ownerProject: "@internal/habitat-harness",
        ownerRoot: "tools/habitat-harness",
        alias: {
          kind: "depends-on",
          target: { project: "@internal/habitat-harness", target: "biome:ci" },
        },
      },
      {
        id: "nx-rule",
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

    expect(() =>
      ruleGraphFacts(
        [baseRule({ ownerProject: "unknown-owner" })],
        ownerRoots,
        workspaceGraphTargetNames()
      )
    ).toThrow("unknown ownerProject");
  });
});
