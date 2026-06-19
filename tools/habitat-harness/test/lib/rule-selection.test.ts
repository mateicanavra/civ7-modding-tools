import { describe, expect, test } from "vitest";
import {
  checkCommandContext,
  createCheckReport,
  renderCheckReport,
  rulesForExecution,
  stagedGritScanRoots,
} from "../../src/lib/check-report.js";
import { validateCheckReport } from "../../src/lib/diagnostics.js";
import { type RuleSelection, selectRules } from "../../src/lib/rule-selection.js";
import type { HarnessRule } from "../../src/rules/architecture.js";
import type { RuleGritFacts } from "../../src/rules/registry/index.js";

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
      command: checkCommandContext(["--json", "--rule", "definitely-not-a-rule"]),
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

  test("rejects check reports whose ok flag contradicts failed rules", () => {
    const invalid = {
      schemaVersion: 1,
      command: "habitat check --json",
      startedAt: "2026-06-13T00:00:00.000Z",
      ok: true,
      rules: [
        {
          ruleId: "demo-rule",
          ownerTool: "habitat-native",
          lane: "enforced",
          status: "fail",
          locked: true,
          durationMs: 1,
          diagnostics: [
            {
              ruleId: "demo-rule",
              path: ".",
              message: "broken",
              severity: "error",
              baselined: false,
            },
          ],
          detect: ["demo"],
          message: "demo",
          remediate: null,
        },
      ],
    };

    expect(validateCheckReport(invalid)).toContain("ok must be false when any rule status is fail");
    expect(() => renderCheckReport(invalid, { json: true })).toThrow(/ok must be false/);
  });

  test("staged execution keeps only local-feedback Grit rules when approved staged roots exist", () => {
    const stagedEligible = fakeRule("grit-hook", "grit-check", "@internal/habitat-harness", {
      localFeedback: true,
    });
    const currentTreeOnly = fakeRule(
      "grit-current-tree",
      "grit-check",
      "@internal/habitat-harness"
    );
    const nativeRule = fakeRule("file-layer-rule", "file-layer", "@internal/habitat-harness");

    expect(
      rulesForExecution([stagedEligible, currentTreeOnly, nativeRule], {
        gritFacts: [fakeGritFact("grit-hook", ["packages"])],
        localFeedbackFacts: [{ id: "grit-hook", localFeedback: true }],
        staged: true,
        stagedPaths: ["packages/mapgen-core/src/core/index.ts"],
      }).map((rule) => rule.id)
    ).toEqual(["grit-hook", "file-layer-rule"]);
  });

  test("staged execution excludes Grit rules when staged paths are outside approved roots", () => {
    const stagedEligible = fakeRule("grit-hook", "grit-check", "@internal/habitat-harness", {
      localFeedback: true,
    });

    expect(
      rulesForExecution([stagedEligible], {
        gritFacts: [fakeGritFact("grit-hook", ["packages"])],
        localFeedbackFacts: [{ id: "grit-hook", localFeedback: true }],
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

function fakeGritFact(id: string, scanRoots: readonly string[]): RuleGritFacts {
  return {
    id,
    gritPattern: "fixture_pattern",
    lane: "enforced",
    message: "test fixture",
    scanRoots: [...scanRoots],
  };
}
