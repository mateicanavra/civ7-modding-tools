import { makeHabitatCommandResult } from "@habitat/cli/resources/command/index";
import { repoRoot } from "@habitat/cli/resources/paths";
import {
  checkCommandContext,
  renderCheckReport,
  structuralCheckRequest,
  validateCheckReport,
} from "@habitat/cli/service/model/check/index";
import { executeCommandRulesEffect } from "@habitat/cli/service/model/check/policy/structural/command-execution.policy";
import {
  rulesForExecution,
  selectorRefusalReportEffect,
  stagedSourceCheckNotApplicableRecords,
} from "@habitat/cli/service/model/check/policy/structural/index";
import type {
  RuleCommandExecutionFacts,
  RuleRegistryRecord,
  RuleSourceFacts,
} from "@habitat/cli/service/model/rules/index";
import {
  type RuleSelection,
  selectRules,
} from "@habitat/cli/service/model/rules/policy/selection.policy";
import {
  approvedScanRootsForRules,
  stagedSourceCheckPaths,
} from "@habitat/cli/service/model/source-check/index";
import { Effect } from "effect";
import { describe, expect, test } from "vitest";

const fakeRules: RuleRegistryRecord[] = [
  fakeRule("alpha-rule", "grit", "@scope/alpha"),
  fakeRule("beta-rule", "habitat", "@scope/beta"),
  fakeRule("gamma-rule", "grit", "@scope/gamma"),
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

  test("selects valid owner, rule, and runner filters", () => {
    expect(selectedIds({ owner: "@scope/alpha" })).toEqual(["alpha-rule"]);
    expect(selectedIds({ rule: "beta-rule" })).toEqual(["beta-rule"]);
    expect(selectedIds({ rules: ["alpha-rule", "gamma-rule"] })).toEqual([
      "alpha-rule",
      "gamma-rule",
    ]);
    expect(selectedIds({ runner: "grit" })).toEqual(["alpha-rule", "gamma-rule"]);
  });

  test("unions repeated rule selectors before intersecting owner and runner", () => {
    expect(selectedIds({ rules: ["alpha-rule", "gamma-rule"], runner: "grit" })).toEqual([
      "alpha-rule",
      "gamma-rule",
    ]);
    expect(selectedIds({ rules: ["alpha-rule", "beta-rule"], runner: "grit" })).toEqual([
      "alpha-rule",
    ]);
    expect(
      selectionFailure({ rules: ["alpha-rule", "beta-rule"], owner: "@scope/gamma" })
    ).toMatchObject({
      reason: "empty-selection",
    });
  });

  test("reports unknown owner, rule, and runner selectors with structured facts", () => {
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
    expect(selectionFailure({ rules: ["alpha-rule", "missing-rule"] })).toMatchObject({
      reason: "unknown-selector",
      selectorFacts: [
        { kind: "rule", requestedValue: "alpha-rule", known: true },
        { kind: "rule", requestedValue: "missing-rule", known: false },
      ],
    });
    expect(selectionFailure({ runner: "missing-runner" })).toMatchObject({
      reason: "unknown-selector",
      selectorFacts: [{ kind: "runner", requestedValue: "missing-runner", known: false }],
    });
  });

  test("reports a value used in the wrong selector namespace", () => {
    expect(selectionFailure({ rule: "grit" })).toMatchObject({
      reason: "wrong-selector-namespace",
      selectorFacts: [
        {
          kind: "rule",
          requestedValue: "grit",
          known: false,
          matchedNamespace: "runner",
          matchingRuleIds: [],
        },
      ],
    });
  });

  test("reports valid selectors whose intersection contains no rules", () => {
    expect(selectionFailure({ owner: "@scope/alpha", runner: "habitat" })).toMatchObject({
      reason: "empty-selection",
      selectorFacts: [
        {
          kind: "owner",
          requestedValue: "@scope/alpha",
          known: true,
          matchingRuleIds: ["alpha-rule"],
        },
        {
          kind: "runner",
          requestedValue: "habitat",
          known: true,
          matchingRuleIds: ["beta-rule"],
        },
      ],
      emptyIntersection: {
        matchingRuleIdsBySelector: {
          "owner:@scope/alpha": ["alpha-rule"],
          "runner:habitat": ["beta-rule"],
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
      runner: "habitat",
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
          runner: "habitat",
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
      command: "habitat check --runner grit",
      startedAt: "2026-06-21T00:00:00.000Z",
      ok: true,
      rules: [
        passingRule("alpha-pattern", {
          durationMs: 2500,
          timing: {
            kind: "shared",
            groupId: "grit:source-rules",
            durationMs: 2500,
            ruleCount: 2,
          },
        }),
        passingRule("beta-pattern", {
          durationMs: 2500,
          timing: {
            kind: "shared",
            groupId: "grit:source-rules",
            durationMs: 2500,
            ruleCount: 2,
          },
        }),
      ],
    };

    const rendered = renderCheckReport(report);

    expect(rendered).toContain(
      "alpha-pattern (grit, enforced) [locked] — shared:grit:source-rules"
    );
    expect(rendered).toContain("beta-pattern (grit, enforced) [locked] — shared:grit:source-rules");
    expect(rendered).toContain("shared work:\n  grit:source-rules: 2500ms across 2 rules");
  });

  test("staged execution preserves selected rules for explicit not-applicable disposition", () => {
    const stagedEligible = fakeRule("hook", "grit", "@habitat/cli", {
      hookCheck: true,
    });
    const currentTreeOnly = fakeRule("current-tree", "grit", "@habitat/cli");
    const nativeRule = fakeRule("file-layer-rule", "habitat", "@habitat/cli", {
      runner: { name: "habitat", mode: "file-layer", guard: "host-surface" },
    });

    expect(
      rulesForExecution([stagedEligible, currentTreeOnly, nativeRule], {
        sourceRuleFacts: [fakeSourceRuleFact("hook", ["packages"])],
        hookCheckFacts: [{ id: "hook", hookCheck: true }],
        staged: true,
        stagedPaths: ["packages/mapgen-core/src/core/index.ts"],
      }).map((rule) => rule.id)
    ).toEqual(["hook", "current-tree", "file-layer-rule"]);
  });

  test("default local execution excludes graph-backed rules", () => {
    const local = fakeRule("local-source", "grit", "@habitat/cli");
    const fileLayer = fakeRule("local-file", "habitat", "@habitat/cli", {
      runner: { name: "habitat", mode: "file-layer", guard: "host-surface" },
    });
    const graph = fakeRule("graph-proof", "nx", "@habitat/cli");
    const hygiene = fakeRule("format-proof", "habitat", "@habitat/cli");
    const target = fakeRule("target-proof", "nx", "@habitat/cli");

    expect(
      rulesForExecution([local, fileLayer, graph, hygiene, target]).map((rule) => rule.id)
    ).toEqual(["local-source", "local-file", "format-proof"]);
  });

  test("explicit runner selectors do not widen beyond the selected runner", () => {
    const graph = fakeRule("graph-proof", "nx", "@habitat/cli");
    const hygiene = fakeRule("format-proof", "habitat", "@habitat/cli");

    expect(
      rulesForExecution([graph, hygiene], { selection: { runner: "nx" } }).map((rule) => rule.id)
    ).toEqual(["graph-proof"]);
  });

  test("Habitat script execution runs adjacent executable role files", async () => {
    const requests: Array<{ executable: string; argv: readonly string[] }> = [];
    const results = new Map();
    await Effect.runPromise(
      executeCommandRulesEffect(
        [
          fakeCommandRule(
            "direct-bun",
            ".habitat/civ7/mapgen/domains/rules/direct/check.ts",
            "bun"
          ),
          fakeCommandRule(
            "direct-js",
            ".habitat/civ7/mapgen/domains/rules/direct/check.mjs",
            "node"
          ),
          fakeCommandRule(
            "direct-sh",
            ".habitat/civ7/mapgen/domains/rules/direct/check.sh",
            "bash"
          ),
        ],
        results,
        {
          repoRoot,
          command: {
            run: (request) =>
              Effect.sync(() => {
                requests.push({ executable: request.executable, argv: request.argv });
                return makeHabitatCommandResult(request);
              }),
          },
        } as any
      )
    );

    expect(requests).toEqual([
      {
        executable: "bun",
        argv: [".habitat/civ7/mapgen/domains/rules/direct/check.ts"],
      },
      {
        executable: "node",
        argv: [".habitat/civ7/mapgen/domains/rules/direct/check.mjs"],
      },
      {
        executable: "bash",
        argv: [".habitat/civ7/mapgen/domains/rules/direct/check.sh"],
      },
    ]);
    expect([...results.keys()].sort()).toEqual(["direct-bun", "direct-js", "direct-sh"]);
  });

  test("staged execution does not drop source-check rules when staged paths are outside approved roots", () => {
    const stagedEligible = fakeRule("hook", "grit", "@habitat/cli", {
      hookCheck: true,
    });

    expect(
      rulesForExecution([stagedEligible], {
        sourceRuleFacts: [fakeSourceRuleFact("hook", ["packages"])],
        hookCheckFacts: [{ id: "hook", hookCheck: true }],
        staged: true,
        stagedPaths: ["tools/habitat/src/service/modules/hook/router.ts"],
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
          "tools/habitat/src/service/modules/hook/router.ts",
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
  runnerName: "grit" | "habitat" | "nx",
  ownerProject: string,
  overrides: Partial<RuleRegistryRecord> = {}
): RuleRegistryRecord {
  return {
    id,
    ownerProject,
    lane: "enforced",
    forbids: "test fixture",
    why: "test fixture",
    remediate: null,
    message: "test fixture",
    exceptionPath: "none",
    runner: runnerFor(id, runnerName),
    pathCoverage: [{ kind: "project-owner" }],
    ...overrides,
  };
}

function passingRule(id: string, overrides: Record<string, unknown> = {}) {
  return {
    ruleId: id,
    runner: "grit",
    lane: "enforced",
    status: "pass",
    locked: true,
    durationMs: 1,
    diagnostics: [],
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
    runner: {
      name: "grit",
      files: { pattern: `.habitat/fixtures/rules/${id}/pattern.md` },
      patternName: "fixture_pattern",
    },
    pathCoverage: [{ kind: "project-owner" }],
    scanRoots: [...scanRoots],
  };
}

function fakeCommandRule(
  id: string,
  scriptPath: string,
  runtime: "bun" | "node" | "bash"
): RuleCommandExecutionFacts {
  return {
    id,
    lane: "enforced",
    runner: {
      name: "habitat",
      mode: "script",
      files: { script: scriptPath },
      runtime,
    },
    message: `${id} failed.`,
  };
}

function runnerFor(
  id: string,
  runnerName: "grit" | "habitat" | "nx"
): RuleRegistryRecord["runner"] {
  if (runnerName === "grit") {
    return {
      name: "grit",
      files: { pattern: `.habitat/fixtures/rules/${id}/pattern.md` },
      patternName: id,
    };
  }
  if (runnerName === "nx") return { name: "nx", target: { project: "habitat", target: "test" } };
  return {
    name: "habitat",
    mode: "script",
    files: { script: `.habitat/fixtures/rules/${id}/check.mjs` },
    runtime: "node",
  };
}
