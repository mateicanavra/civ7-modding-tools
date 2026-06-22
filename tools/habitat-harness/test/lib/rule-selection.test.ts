import { repoRoot } from "@internal/habitat-harness/resources/paths";
import {
  checkCommandContext,
  renderCheckReport,
  structuralCheckRequest,
  validateCheckReport,
} from "@internal/habitat-harness/service/model/check/index";
import {
  rulesForExecution,
  selectorRefusalReportEffect,
  stagedSourceCheckNotApplicableRecords,
} from "@internal/habitat-harness/service/model/check/policy/structural/index";
import type {
  RuleRegistryRecordV1,
  RuleSourceFacts,
} from "@internal/habitat-harness/service/model/rules/index";
import {
  type RuleSelection,
  selectRules,
} from "@internal/habitat-harness/service/model/rules/policy/selection.policy";
import {
  approvedScanRootsForRules,
  stagedSourceCheckPaths,
} from "@internal/habitat-harness/service/model/source-check/index";
import { Effect } from "effect";
import { describe, expect, test } from "vitest";

const fakeRules: RuleRegistryRecordV1[] = [
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

  test("renders invalid selectors as schemaVersion 1 failing CheckReports", () => {
    const report = Effect.runSync(
      selectorRefusalReportEffect(
        selectionFailure({ rule: "definitely-not-a-rule" }),
        structuralCheckRequest({
          command: checkCommandContext(["--json", "--rule", "definitely-not-a-rule"]),
          rule: "definitely-not-a-rule",
        })
      )
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

  test("renders shared check work once instead of per-rule fake durations", () => {
    const report = {
      schemaVersion: 1,
      command: "habitat check --tool source-check",
      startedAt: "2026-06-21T00:00:00.000Z",
      ok: true,
      rules: [
        passingRule("alpha-pattern", {
          durationMs: 2500,
          timing: {
            kind: "shared",
            groupId: "source-check:source-rules",
            durationMs: 2500,
            ruleCount: 2,
          },
        }),
        passingRule("beta-pattern", {
          durationMs: 2500,
          timing: {
            kind: "shared",
            groupId: "source-check:source-rules",
            durationMs: 2500,
            ruleCount: 2,
          },
        }),
      ],
    };

    const rendered = renderCheckReport(report);

    expect(rendered).toContain(
      "alpha-pattern (source-check, enforced) [locked] — shared:source-check:source-rules"
    );
    expect(rendered).toContain(
      "beta-pattern (source-check, enforced) [locked] — shared:source-check:source-rules"
    );
    expect(rendered).toContain("shared work:\n  source-check:source-rules: 2500ms across 2 rules");
  });

  test("staged execution preserves selected rules for explicit not-applicable disposition", () => {
    const stagedEligible = fakeRule("hook", "source-check", "@internal/habitat-harness", {
      hookCheck: true,
    });
    const currentTreeOnly = fakeRule("current-tree", "source-check", "@internal/habitat-harness");
    const nativeRule = fakeRule("file-layer-rule", "file-layer", "@internal/habitat-harness");

    expect(
      rulesForExecution([stagedEligible, currentTreeOnly, nativeRule], {
        sourceRuleFacts: [fakeSourceRuleFact("hook", ["packages"])],
        hookCheckFacts: [{ id: "hook", hookCheck: true }],
        staged: true,
        stagedPaths: ["packages/mapgen-core/src/core/index.ts"],
      }).map((rule) => rule.id)
    ).toEqual(["hook", "current-tree", "file-layer-rule"]);
  });

  test("default local execution excludes graph and hygiene proof rules", () => {
    const local = fakeRule("local-source", "source-check", "@internal/habitat-harness");
    const fileLayer = fakeRule("local-file", "file-layer", "@internal/habitat-harness");
    const graph = fakeRule("graph-proof", "nx", "@internal/habitat-harness");
    const hygiene = fakeRule("format-proof", "format-check", "@internal/habitat-harness");
    const target = fakeRule("target-proof", "nx", "@internal/habitat-harness");

    expect(
      rulesForExecution([local, fileLayer, graph, hygiene, target]).map((rule) => rule.id)
    ).toEqual(["local-source", "local-file"]);
  });

  test("explicit selectors preserve graph and hygiene proof rules", () => {
    const graph = fakeRule("graph-proof", "nx", "@internal/habitat-harness");
    const hygiene = fakeRule("format-proof", "format-check", "@internal/habitat-harness");

    expect(
      rulesForExecution([graph, hygiene], { selection: { tool: "nx" } }).map((rule) => rule.id)
    ).toEqual(["graph-proof", "format-proof"]);
  });

  test("staged execution does not drop source-check rules when staged paths are outside approved roots", () => {
    const stagedEligible = fakeRule("hook", "source-check", "@internal/habitat-harness", {
      hookCheck: true,
    });

    expect(
      rulesForExecution([stagedEligible], {
        sourceRuleFacts: [fakeSourceRuleFact("hook", ["packages"])],
        hookCheckFacts: [{ id: "hook", hookCheck: true }],
        staged: true,
        stagedPaths: ["tools/habitat-harness/src/service/modules/hook/router.ts"],
      }).map((rule) => rule.id)
    ).toEqual(["hook"]);
  });

  test("source-check staged checks with no approved roots report not-applicable instead of baseline-only pass", () => {
    const gritRule = fakeSourceRuleFact("hook", ["packages"]);
    const scanRoots = stagedSourceCheckPaths(["README.md"], approvedScanRootsForRules([gritRule]), {
      repoRoot,
    });
    const records = stagedSourceCheckNotApplicableRecords([gritRule], scanRoots);
    const record = records?.get("hook");

    expect(scanRoots).toEqual([]);
    expect(record).toMatchObject({
      result: {
        exitCode: 1,
        diagnostics: [
          {
            ruleId: "hook",
            message: "Rule not applicable: staged scope contains no approved roots for this rule.",
            severity: "error",
            baselined: false,
          },
        ],
      },
      durationMs: 0,
      disposition: {
        kind: "not-applicable",
        reason: "staged-scope-no-approved-roots",
      },
    });
    expect(
      record?.result.diagnostics.every((diagnostic) =>
        diagnostic.message.startsWith("Rule not applicable: staged scope")
      )
    ).toBe(true);
  });

  test("source-check staged scan roots preserve exact approved file paths", () => {
    expect(
      stagedSourceCheckPaths(
        [
          "packages/mapgen-core/src/core/index.ts",
          "tools/habitat-harness/src/service/modules/hook/router.ts",
          "README.md",
        ],
        ["packages/mapgen-core/src/core"],
        { repoRoot }
      )
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
  overrides: Partial<RuleRegistryRecordV1> = {}
): RuleRegistryRecordV1 {
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

function passingRule(id: string, overrides: Record<string, unknown> = {}) {
  return {
    ruleId: id,
    ownerTool: "source-check",
    lane: "enforced",
    status: "pass",
    locked: true,
    durationMs: 1,
    diagnostics: [],
    detect: ["demo"],
    message: "demo",
    remediate: null,
    ...overrides,
  };
}

function fakeSourceRuleFact(id: string, scanRoots: readonly string[]): RuleSourceFacts {
  return {
    id,
    patternName: "fixture_pattern",
    lane: "enforced",
    message: "test fixture",
    scanRoots: [...scanRoots],
  };
}
