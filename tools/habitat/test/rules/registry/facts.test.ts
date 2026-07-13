import {
  ruleAuthorityPathFacts,
  ruleBaselineFacts,
  ruleCommandExecutionFacts,
  ruleDiagnosticFacts,
  ruleFactsCatalog,
  ruleFileLayerFacts,
  ruleFixFacts,
  ruleGraphFacts,
  ruleGritFacts,
  ruleHookCheckFacts,
  ruleReportFacts,
  ruleRoutingFacts,
  ruleSelectorFacts,
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
  test("freezes the complete projected catalog snapshot", () => {
    const catalog = ruleFactsCatalog({
      schemaVersion: 2,
      ownerRoots: { habitat: "tools/habitat" },
      rules: [
        baseRule({
          runner: {
            ...gritRunner("sample-rule"),
            patternName: "sample_pattern",
            fix: {
              kind: "plan-only",
              pattern: ".habitat/fixtures/rules/sample-rule/fix.pattern.md",
            },
          },
          scanRoots: ["packages"],
        }),
      ],
    });

    expect(Object.isFrozen(catalog)).toBe(true);
    expect(Object.isFrozen(catalog.grit)).toBe(true);
    expect(Object.isFrozen(catalog.grit[0])).toBe(true);
    expect(Object.isFrozen(catalog.grit[0]?.scanRoots)).toBe(true);
    expect(Object.isFrozen(catalog.grit[0]?.runner)).toBe(true);
    expect(Object.isFrozen(catalog.grit[0]?.runner.files)).toBe(true);
    expect(Object.isFrozen(catalog.fix)).toBe(true);
    expect(Object.isFrozen(catalog.fix[0]?.fix)).toBe(true);
    expect(() => (catalog.grit[0]?.scanRoots as string[]).push("other")).toThrow(TypeError);
  });

  test("separates diagnostic execution and fix admission facts", () => {
    const rule = baseRule({
      runner: {
        ...gritRunner("sample-rule"),
        patternName: "sample_pattern",
        diagnosticAcquisition: { kind: "apply-dry-run" },
        fix: {
          kind: "plan-only",
          pattern: ".habitat/fixtures/rules/sample-rule/fix.pattern.md",
        },
      },
      scanRoots: ["packages"],
      hookCheck: true,
    });

    expect(ruleDiagnosticFacts([rule])).toEqual([
      {
        id: "sample-rule",
        lane: "enforced",
        message: "Fix the structural issue.",
        pathCoverage: [{ kind: "project-owner" }],
        scanRoots: ["packages"],
      },
    ]);
    expect(ruleGritFacts([rule])).toEqual([
      {
        id: "sample-rule",
        lane: "enforced",
        message: "Fix the structural issue.",
        runner: { ...gritRunner("sample-rule"), patternName: "sample_pattern" },
        patternName: "sample_pattern",
        diagnosticAcquisition: { kind: "apply-dry-run" },
        pathCoverage: [{ kind: "project-owner" }],
        scanRoots: ["packages"],
      },
    ]);
    expect(ruleFixFacts([rule])).toEqual([
      {
        id: "sample-rule",
        lane: "enforced",
        message: "Fix the structural issue.",
        pathCoverage: [{ kind: "project-owner" }],
        scanRoots: ["packages"],
        patternName: "sample_pattern",
        fix: {
          kind: "plan-only",
          pattern: ".habitat/fixtures/rules/sample-rule/fix.pattern.md",
        },
      },
    ]);
    expect(ruleHookCheckFacts([rule])).toEqual([
      {
        id: "sample-rule",
        hookCheck: true,
      },
    ]);
    const projectedRunner = { ...gritRunner("sample-rule"), patternName: "sample_pattern" };
    expect(ruleSelectorFacts([rule])[0]?.runner).toEqual(projectedRunner);
    expect(ruleReportFacts([rule])[0]?.runner).toEqual(projectedRunner);
    expect(ruleRoutingFacts([rule])[0]?.runner).toEqual(projectedRunner);
    for (const facts of [
      ruleSelectorFacts([rule]),
      ruleReportFacts([rule]),
      ruleRoutingFacts([rule]),
    ]) {
      expect(facts[0]?.runner).not.toHaveProperty("diagnosticAcquisition");
      expect(facts[0]?.runner).not.toHaveProperty("fix");
    }
    expect(ruleAuthorityPathFacts([rule])).toEqual([
      expect.objectContaining({
        id: "sample-rule",
        runner: projectedRunner,
        fixPattern: ".habitat/fixtures/rules/sample-rule/fix.pattern.md",
      }),
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
        diagnosticAcquisition: { kind: "check" },
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
            ".habitat/civ7/platform/_blueprints/civ7-adapter/block_unapproved_base_standard_boundary_leaks/check.sh#ALLOWLIST",
          runner: { ...gritRunner("sample-rule"), patternName: "sample_pattern" },
          scanRoots: ["packages"],
          hookCheck: true,
          supportFiles: {
            baseline: ".habitat/fixtures/rules/sample-rule/baseline.json",
            ruleIntroductionManifest:
              ".habitat/fixtures/rules/sample-rule/rule-introduction-manifest.json",
          },
        }),
      ])
    ).toEqual([
      {
        id: "sample-rule",
        baselinePath: ".habitat/fixtures/rules/sample-rule/baseline.json",
        ruleIntroductionManifestPath:
          ".habitat/fixtures/rules/sample-rule/rule-introduction-manifest.json",
        exceptionPath:
          ".habitat/civ7/platform/_blueprints/civ7-adapter/block_unapproved_base_standard_boundary_leaks/check.sh#ALLOWLIST",
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
