import { describe, expect, test } from "vitest";
import type { RulePatternFacts } from "../../src/domains/rule-registry/index.js";
import { type RuleSelection, selectRules } from "../../src/domains/rule-selection/index.js";
import {
  checkCommandContext,
  createCheckReportEffect,
  renderCheckReport,
  rulesForExecution,
  stagedPatternScanRoots,
} from "../../src/domains/structural-check/index.js";
import { validateCheckReport } from "../../src/domains/structural-check/schema.js";
import type { HarnessRule } from "../../src/rules/architecture.js";
import { runHabitatEffect } from "../../src/runtime/index.js";

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
    const report = await runHabitatEffect(
      createCheckReportEffect({
        command: checkCommandContext(["--json", "--rule", "definitely-not-a-rule"]),
        rule: "definitely-not-a-rule",
      })
    );

    expect(validateCheckReport(report)).toEqual([]);
    expect(report.ok).toBe(false);
    expect(report.rules).toHaveLength(1);
    expect(report.rules[0]).toMatchObject({
      ruleId: "rule-selection-integrity",
      ownerTool: "habitat-builtin",
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
          ownerTool: "command-check",
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

  test("staged execution preserves selected rules for explicit not-applicable disposition", () => {
    const stagedEligible = fakeRule("hook", "pattern-check", "@internal/habitat-harness", {
      hookCheck: true,
    });
    const currentTreeOnly = fakeRule("current-tree", "pattern-check", "@internal/habitat-harness");
    const nativeRule = fakeRule("file-layer-rule", "file-layer", "@internal/habitat-harness");

    expect(
      rulesForExecution([stagedEligible, currentTreeOnly, nativeRule], {
        gritFacts: [fakeGritFact("hook", ["packages"])],
        hookCheckFacts: [{ id: "hook", hookCheck: true }],
        staged: true,
        stagedPaths: ["packages/mapgen-core/src/core/index.ts"],
      }).map((rule) => rule.id)
    ).toEqual(["hook", "current-tree", "file-layer-rule"]);
  });

  test("staged execution does not drop Grit rules when staged paths are outside approved roots", () => {
    const stagedEligible = fakeRule("hook", "pattern-check", "@internal/habitat-harness", {
      hookCheck: true,
    });

    expect(
      rulesForExecution([stagedEligible], {
        gritFacts: [fakeGritFact("hook", ["packages"])],
        hookCheckFacts: [{ id: "hook", hookCheck: true }],
        staged: true,
        stagedPaths: ["tools/habitat-harness/src/service/modules/hook/router.ts"],
      }).map((rule) => rule.id)
    ).toEqual(["hook"]);
  });

  test("staged Grit checks with no approved roots report not-applicable instead of baseline-only pass", async () => {
    const report = await runHabitatEffect(
      createCheckReportEffect({
        tool: "pattern-check",
        staged: true,
        stagedPaths: ["README.md"],
      })
    );

    const gritReports = report.rules.filter((rule) => rule.ownerTool === "pattern-check");
    expect(gritReports.length).toBeGreaterThan(0);
    expect(gritReports.every((rule) => rule.status !== "pass")).toBe(true);
    expect(
      gritReports.every((rule) =>
        rule.diagnostics.some((diagnostic) =>
          diagnostic.message.startsWith("Rule not applicable: staged scope")
        )
      )
    ).toBe(true);
    expect(report.ok).toBe(false);
  }, 90_000);

  test("staged Grit scan roots preserve exact approved file paths", () => {
    expect(
      stagedPatternScanRoots([
        "packages/mapgen-core/src/core/index.ts",
        "tools/habitat-harness/src/service/modules/hook/router.ts",
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

function fakeGritFact(id: string, scanRoots: readonly string[]): RulePatternFacts {
  return {
    id,
    patternName: "fixture_pattern",
    lane: "enforced",
    message: "test fixture",
    scanRoots: [...scanRoots],
  };
}
