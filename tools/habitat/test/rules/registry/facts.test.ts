import {
  ruleBaselineFacts,
  ruleCommandExecutionFacts,
  ruleFileLayerFacts,
  ruleGraphFacts,
  ruleGritFacts,
  ruleHookCheckFacts,
  ruleManifestFacts,
  ruleRoutingFacts,
  ruleSourceFacts,
  ruleStructureFacts,
} from "@habitat/cli/service/model/rules/index";
import { workspaceGraphTargetNames } from "@habitat/cli/service/model/workspace/index";
import { describe, expect, test } from "vitest";
import {
  baseRule,
  gritRunner,
  habitatFileLayerRunner,
  habitatScriptRunner,
  habitatStructureRunner,
  nxRunner,
} from "./helpers.js";

describe("rule registry facts", () => {
  test("keeps hook check out of Grit execution facts", () => {
    const rule = baseRule({
      runner: { ...gritRunner("sample-rule"), patternName: "sample_pattern" },
      scanRoots: ["packages"],
      hookCheck: true,
    });

    expect(ruleSourceFacts([rule])).toEqual([]);
    expect(ruleGritFacts([rule])).toEqual([
      {
        id: "sample-rule",
        lane: "enforced",
        message: "Fix the structural issue.",
        runner: { ...gritRunner("sample-rule"), patternName: "sample_pattern" },
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
      runner: { ...gritRunner("rule"), patternName: "sample_pattern" },
      scanRoots: ["packages"],
      hookCheck: true,
    });
    const fileLayerRule = baseRule({
      id: "file-layer-rule",
      runner: habitatFileLayerRunner("generated-zone"),
      generatedZone: "swooper-map-generated",
    });
    const structureRule = baseRule({
      id: "structure-rule",
      runner: habitatStructureRunner("structure-rule"),
    });

    expect(
      ruleCommandExecutionFacts([commandRule, gritRule, fileLayerRule, structureRule])
    ).toEqual([
      {
        id: "sample-rule",
        lane: "enforced",
        runner: habitatScriptRunner("sample-rule"),
        message: "Fix the structural issue.",
      },
    ]);
    expect(ruleGritFacts([commandRule, gritRule, fileLayerRule, structureRule])).toEqual([
      {
        id: "rule",
        lane: "enforced",
        message: "Fix the structural issue.",
        runner: { ...gritRunner("rule"), patternName: "sample_pattern" },
        patternName: "sample_pattern",
        pathCoverage: [{ kind: "project-owner" }],
        scanRoots: ["packages"],
      },
    ]);
    expect(ruleFileLayerFacts([commandRule, gritRule, fileLayerRule, structureRule])).toEqual([
      {
        id: "file-layer-rule",
        runner: habitatFileLayerRunner("generated-zone"),
        lane: "enforced",
        message: "Fix the structural issue.",
        generatedZone: "swooper-map-generated",
      },
    ]);
    expect(ruleStructureFacts([commandRule, gritRule, fileLayerRule, structureRule])).toEqual([
      {
        id: "structure-rule",
        lane: "enforced",
        message: "Fix the structural issue.",
        pathCoverage: [{ kind: "project-owner" }],
        runner: habitatStructureRunner("structure-rule"),
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
        runner: habitatScriptRunner("sample-rule"),
        ownerProject: "habitat",
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
          exceptionPath:
            ".habitat/civ7/platform/blueprints/civ7-adapter/boundary/check/block_unapproved_base_standard_boundary_leaks/check.sh#ALLOWLIST",
          runner: { ...gritRunner("sample-rule"), patternName: "sample_pattern" },
          scanRoots: ["packages"],
          hookCheck: true,
          manifestPath: ".habitat/patterns/manifests/sample-rule.json",
        }),
      ])
    ).toEqual([
      {
        id: "sample-rule",
        exceptionPath:
          ".habitat/civ7/platform/blueprints/civ7-adapter/boundary/check/block_unapproved_base_standard_boundary_leaks/check.sh#ALLOWLIST",
      },
    ]);
  });

  test("projects governance facts only for registered manifest references", () => {
    expect(
      ruleManifestFacts([
        baseRule({
          id: "registered-rule",
          runner: { ...gritRunner("registered-rule"), patternName: "registered_grit_rule" },
          scanRoots: ["packages"],
          manifestPath: ".habitat/patterns/manifests/registered-rule.json",
        }),
        baseRule({
          id: "metadata-only-rule",
          runner: { ...gritRunner("metadata-only-rule"), patternName: "metadata_only_grit_rule" },
          scanRoots: ["packages"],
        }),
        baseRule({
          id: "command-rule",
          runner: habitatScriptRunner("command-rule"),
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
      ["habitat", "tools/habitat"],
      ["mod-swooper-maps", "mods/mod-swooper-maps"],
    ]);

    expect(
      ruleGraphFacts(
        [
          baseRule({ id: "enforce_formatting_and_import_hygiene" }),
          baseRule({
            id: "nx-rule",
            ownerProject: "mod-swooper-maps",
            runner: nxRunner("mod-swooper-maps", "habitat:check"),
            graphTarget: {
              project: "mod-swooper-maps",
              target: "habitat:check",
            },
          }),
          baseRule({ id: "direct-rule" }),
        ],
        ownerRoots,
        workspaceGraphTargetNames()
      )
    ).toEqual([
      {
        id: "enforce_formatting_and_import_hygiene",
        ownerProject: "habitat",
        ownerRoot: "tools/habitat",
        lane: "enforced",
        message: "Fix the structural issue.",
        alias: {
          kind: "depends-on",
          target: { project: "habitat", target: "biome:ci" },
        },
      },
      {
        id: "nx-rule",
        ownerProject: "mod-swooper-maps",
        ownerRoot: "mods/mod-swooper-maps",
        lane: "enforced",
        message: "Fix the structural issue.",
        alias: {
          kind: "depends-on",
          target: { project: "mod-swooper-maps", target: "habitat:check" },
        },
      },
      {
        id: "direct-rule",
        ownerProject: "habitat",
        ownerRoot: "tools/habitat",
        lane: "enforced",
        message: "Fix the structural issue.",
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
