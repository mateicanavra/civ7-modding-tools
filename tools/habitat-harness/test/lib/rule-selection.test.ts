import { describe, expect, test } from "vitest";
import {
  createCheckReport,
  rulesForExecution,
  type RuleSelection,
  renderCheckReport,
  selectRules,
  stagedGritScanRoots,
} from "../../src/lib/command-engine.js";
import { validateCheckReport } from "../../src/lib/diagnostics.js";
import type { HarnessRule } from "../../src/rules/architecture.js";

const fakeRules: HarnessRule[] = [
  fakeRule("alpha-rule", "tool-a", "@scope/alpha"),
  fakeRule("beta-rule", "tool-b", "@scope/beta"),
  fakeRule("gamma-rule", "tool-a", "@scope/gamma"),
];

describe("rule selector boundary", () => {
  test("selects all rules when no selectors are requested", () => {
    const result = selectRules({}, fakeRules);

    expect(result.ok).toBe(true);
    if (result.ok)
      expect(result.rules.map((rule) => rule.id)).toEqual([
        "alpha-rule",
        "beta-rule",
        "gamma-rule",
      ]);
  });

  test("selects valid owner, rule, and tool filters", () => {
    expect(selectedIds({ owner: "@scope/alpha" })).toEqual(["alpha-rule"]);
    expect(selectedIds({ rule: "beta-rule" })).toEqual(["beta-rule"]);
    expect(selectedIds({ tool: "tool-a" })).toEqual(["alpha-rule", "gamma-rule"]);
  });

  test("reports unknown owner, rule, and tool selectors with structured facts", () => {
    expect(selectionFailure({ owner: "@scope/missing" })).toMatchObject({
      reason: "unknown-selector",
      selectorFacts: [
        {
          kind: "owner",
          requestedValue: "@scope/missing",
          known: false,
          matchingRuleIds: [],
        },
      ],
    });
    expect(selectionFailure({ rule: "missing-rule" })).toMatchObject({
      reason: "unknown-selector",
      selectorFacts: [{ kind: "rule", requestedValue: "missing-rule", known: false }],
    });
    expect(selectionFailure({ tool: "missing-tool" })).toMatchObject({
      reason: "unknown-selector",
      selectorFacts: [{ kind: "tool", requestedValue: "missing-tool", known: false }],
    });
  });

  test("reports a value used in the wrong selector namespace", () => {
    expect(selectionFailure({ rule: "tool-a" })).toMatchObject({
      reason: "wrong-selector-namespace",
      selectorFacts: [
        {
          kind: "rule",
          requestedValue: "tool-a",
          known: false,
          matchedNamespace: "tool",
          matchingRuleIds: [],
        },
      ],
    });
  });

  test("reports valid selectors whose intersection contains no rules", () => {
    expect(selectionFailure({ owner: "@scope/alpha", tool: "tool-b" })).toMatchObject({
      reason: "empty-selection",
      selectorFacts: [
        {
          kind: "owner",
          requestedValue: "@scope/alpha",
          known: true,
          matchingRuleIds: ["alpha-rule"],
        },
        {
          kind: "tool",
          requestedValue: "tool-b",
          known: true,
          matchingRuleIds: ["beta-rule"],
        },
      ],
      emptyIntersection: {
        matchingRuleIdsBySelector: {
          "owner:@scope/alpha": ["alpha-rule"],
          "tool:tool-b": ["beta-rule"],
        },
      },
    });
  });

  test("renders invalid selectors as schemaVersion 1 failing CheckReports", async () => {
    const report = await createCheckReport({
      commandArgs: ["--json", "--rule", "definitely-not-a-rule"],
      rule: "definitely-not-a-rule",
    });

    expect(validateCheckReport(report)).toEqual([]);
    expect(report.ok).toBe(false);
    expect(report.rules).toHaveLength(1);
    expect(report.rules[0]).toMatchObject({
      ruleId: "rule-selection-integrity",
      ownerTool: "habitat-native",
      status: "fail",
    });
    expect(report.rules[0].diagnostics[0].message).toContain("Unknown Habitat rule id");

    const json = renderCheckReport(report, { json: true });
    expect(JSON.parse(json)).toMatchObject({ schemaVersion: 1, ok: false });
  });

  test("staged execution keeps only hook-scoped Grit rules when approved staged roots exist", () => {
    const hookScoped = fakeRule("grit-hook", "grit-check", "@internal/habitat-harness", {
      hookScope: "pre-commit",
    });
    const currentTreeOnly = fakeRule("grit-current-tree", "grit-check", "@internal/habitat-harness");
    const nativeRule = fakeRule("file-layer-rule", "file-layer", "@internal/habitat-harness");

    expect(
      rulesForExecution([hookScoped, currentTreeOnly, nativeRule], {
        staged: true,
        stagedPaths: ["packages/mapgen-core/src/core/index.ts"],
      }).map((rule) => rule.id)
    ).toEqual(["grit-hook", "file-layer-rule"]);
  });

  test("staged execution excludes Grit rules when staged paths are outside approved roots", () => {
    const hookScoped = fakeRule("grit-hook", "grit-check", "@internal/habitat-harness", {
      hookScope: "pre-commit",
    });

    expect(
      rulesForExecution([hookScoped], {
        staged: true,
        stagedPaths: ["tools/habitat-harness/src/lib/hooks.ts"],
      }).map((rule) => rule.id)
    ).toEqual([]);
  });

  test("staged Grit scan roots preserve exact approved file paths", () => {
    expect(
      stagedGritScanRoots([
        "packages/mapgen-core/src/core/index.ts",
        "tools/habitat-harness/src/lib/hooks.ts",
        "README.md",
      ])
    ).toEqual(["packages/mapgen-core/src/core/index.ts"]);
  });
});

function selectedIds(selection: RuleSelection): string[] {
  const result = selectRules(selection, fakeRules);
  expect(result.ok).toBe(true);
  if (!result.ok) return [];
  return result.rules.map((rule) => rule.id);
}

function selectionFailure(selection: RuleSelection) {
  const result = selectRules(selection, fakeRules);
  expect(result.ok).toBe(false);
  if (result.ok) throw new Error("expected selector failure");
  return result;
}

function fakeRule(
  id: string,
  ownerTool: string,
  ownerProject: string,
  overrides: Partial<HarnessRule> = {}
): HarnessRule {
  return {
    id,
    ownerTool,
    ownerProject,
    lane: "enforced",
    scope: ".",
    forbids: "test fixture",
    why: "test fixture",
    detect: ["true"],
    remediate: null,
    message: "test fixture",
    exceptionPath: "none",
    ...overrides,
  };
}
