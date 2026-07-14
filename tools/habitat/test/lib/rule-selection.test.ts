import path from "node:path";
import { makeHabitatCommandResult } from "@habitat/cli/resources/command/index";
import { repoRoot } from "@habitat/cli/resources/paths";
import type { RuleDiagnosticsService } from "@habitat/cli/resources/rule-diagnostics/index";
import {
  CheckReportSchema,
  checkCommandContext,
  hookCheckSummary,
  renderCheckReport,
  structuralCheckRequest,
  validateCheckReport,
  verifyCheckSummary,
} from "@habitat/cli/service/model/check/index";
import { executeCommandRulesEffect } from "@habitat/cli/service/model/check/policy/structural/command-execution.policy";
import { ruleDiagnosticExecutionRecord } from "@habitat/cli/service/model/check/policy/structural/diagnostic-execution.policy";
import {
  rulesForExecution,
  selectorRefusalReportEffect,
} from "@habitat/cli/service/model/check/policy/structural/index";
import { createCheckReportEffect } from "@habitat/cli/service/model/check/policy/structural/report.policy";
import type {
  RuleCommandExecutionFacts,
  RuleDiagnosticFacts,
  RuleRegistryRecord,
} from "@habitat/cli/service/model/rules/index";
import { ruleFactsCatalog } from "@habitat/cli/service/model/rules/index";
import {
  type RuleSelection,
  selectRules,
} from "@habitat/cli/service/model/rules/policy/selection.policy";
import { stagedSourceCheckPaths } from "@habitat/cli/service/model/source-check/index";
import { Effect, Match } from "effect";
import { Value } from "typebox/value";
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

  test("renders invalid selectors as schemaVersion 2 failing CheckReports with typed refusal", () => {
    const report = Effect.runSync(
      selectorRefusalReportEffect(
        selectionFailure({ runner: "definitely-not-a-runner" }),
        structuralCheckRequest({
          command: checkCommandContext(["--json", "--runner", "definitely-not-a-runner"]),
          runner: "definitely-not-a-runner",
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
      disposition: {
        kind: "selector-refused",
        refusal: { reason: "unknown-selector" },
      },
    });
    expect(report.rules[0].diagnostics[0].message).toContain("Unknown Habitat runner id");
    expect(report.rules[0].remediate).toBe(
      "Use --owner for owner project ids, --rule for rule ids, --runner for top-level runner names: grit, habitat, or nx; or omit selectors to run all rules."
    );
  });

  test("rejects check reports whose ok flag contradicts failed rules", () => {
    const invalid = {
      schemaVersion: 2,
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
          disposition: { kind: "executed" },
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
      schemaVersion: 2,
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
        hookCheckFacts: [{ id: "hook", hookCheck: true }],
        staged: true,
        stagedPaths: ["packages/mapgen-core/src/core/index.ts"],
      }).map((rule) => rule.id)
    ).toEqual(["hook", "current-tree", "file-layer-rule"]);
  });

  test("hook-check execution excludes Grit rules not admitted to the hook lane", () => {
    const hookRule = fakeRule("hook", "grit", "@habitat/cli", { hookCheck: true });
    const currentTreeOnly = fakeRule("current-tree", "grit", "@habitat/cli");

    expect(
      rulesForExecution([hookRule, currentTreeOnly], {
        hookCheck: true,
        hookCheckFacts: [{ id: "hook", hookCheck: true }],
        staged: true,
        stagedPaths: ["packages/example/src/index.ts"],
      }).map((rule) => rule.id)
    ).toEqual(["hook"]);
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

  test("repeated explicit rule selectors preserve local and graph-backed rules", () => {
    const local = fakeRule("local-proof", "habitat", "@habitat/cli");
    const graph = fakeRule("graph-proof", "nx", "@habitat/cli");
    const unselected = fakeRule("unselected", "grit", "@habitat/cli");

    expect(
      rulesForExecution([local, graph, unselected], {
        selection: { rules: ["local-proof", "graph-proof"] },
      }).map((rule) => rule.id)
    ).toEqual(["local-proof", "graph-proof"]);
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
        hookCheckFacts: [{ id: "hook", hookCheck: true }],
        staged: true,
        stagedPaths: ["tools/habitat/src/service/modules/hook/router.ts"],
      }).map((rule) => rule.id)
    ).toEqual(["hook"]);
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

  test("Grit unmatched roots remain publicly not-applicable", () => {
    const rule = fakeSourceRuleFact("unmatched", ["packages"]);
    const record = ruleDiagnosticExecutionRecord(rule, {
      kind: "not-applicable",
      durationMs: 0,
      reason: "no-matched-scan-roots",
    });

    expect(record).toMatchObject({
      result: {
        exitCode: 0,
        diagnostics: [],
      },
      disposition: { kind: "not-applicable", reason: "no-matched-scan-roots" },
    });
  });

  test("Grit authority refusals become dependency refusals at the structural boundary", () => {
    const rule = fakeSourceRuleFact("refused", ["packages"]);
    const protectedOwner = {
      ownerId: "generated-output-owner",
      displayName: "Generated output owner",
      recoveryContact: "generated-output-owner",
    };
    const protectedRecovery = {
      ownerId: "generated-output-owner",
      actionKind: "select-approved-scan-root" as const,
      instruction: "Select an approved source root.",
    };
    const cases = [
      {
        decision: { kind: "refused" as const, reason: "empty" as const },
        detail: "Diagnostic scan roots are empty.",
      },
      {
        decision: {
          kind: "refused" as const,
          reason: "outside-repo" as const,
          root: "../outside",
        },
        detail: "Diagnostic scan root is outside the repo: ../outside.",
      },
      {
        decision: { kind: "refused" as const, reason: "missing" as const, root: "missing" },
        detail: "Diagnostic scan root does not exist: missing.",
      },
      {
        decision: {
          kind: "refused" as const,
          reason: "generated-output" as const,
          root: "dist",
          owner: protectedOwner,
          recovery: protectedRecovery,
        },
        detail: "Diagnostic scan root is generated output: dist.",
      },
      {
        decision: {
          kind: "refused" as const,
          reason: "protected-root" as const,
          root: "node_modules",
          owner: protectedOwner,
          recovery: protectedRecovery,
        },
        detail: "Diagnostic scan root is protected: node_modules.",
      },
      {
        decision: {
          kind: "refused" as const,
          reason: "not-approved" as const,
          root: "other",
        },
        detail: "Diagnostic scan root is not approved: other.",
      },
    ] as const;

    for (const fixture of cases) {
      const record = ruleDiagnosticExecutionRecord(rule, {
        kind: "refused",
        durationMs: 0,
        decision: fixture.decision,
        detail: fixture.detail,
      });
      expect(record).toMatchObject({
        result: {
          exitCode: 1,
          diagnostics: [
            {
              ruleId: "refused",
              message: `Dependency refused: ${fixture.detail}`,
              severity: "error",
              baselined: false,
            },
          ],
        },
        disposition: {
          kind: "dependency-refused",
          source: "diagnostic-scan-root",
          decision: fixture.decision,
          detail: fixture.detail,
        },
      });
    }
  });

  test("rule diagnostics preserve per-rule duration without false shared timing", () => {
    const rule = fakeSourceRuleFact("timed", ["packages"]);
    const record = ruleDiagnosticExecutionRecord(rule, {
      kind: "executed",
      result: { exitCode: 0, diagnostics: [] },
      durationMs: 7,
    });

    expect(record).toEqual({
      result: { exitCode: 0, diagnostics: [] },
      durationMs: 7,
      disposition: { kind: "executed", durationMs: 7 },
    });
  });

  test("diagnostic provider failures always carry a reportable diagnostic", () => {
    const rule = fakeSourceRuleFact("provider-contract", ["packages"]);
    const record = ruleDiagnosticExecutionRecord(rule, {
      kind: "failed",
      durationMs: 3,
      failure: "DiagnosticProviderContractViolation",
      detail: "Provider omitted the demanded row.",
      diagnostics: [
        {
          ruleId: "provider-contract",
          path: ".",
          message: "Provider omitted the demanded row.",
          severity: "error",
          baselined: false,
        },
      ],
    });

    expect(record).toMatchObject({
      result: {
        exitCode: 1,
        diagnostics: [
          {
            ruleId: "provider-contract",
            severity: "error",
            baselined: false,
            message: "Provider omitted the demanded row.",
          },
        ],
      },
      disposition: {
        kind: "execution-failed",
        source: "diagnostic-provider",
        failure: "DiagnosticProviderContractViolation",
      },
    });
  });

  test("roundtrips typed diagnostic states and fails closed on a missing demanded result", async () => {
    const baselineAuthority = {
      relative: ".habitat/fixtures/rules/advisory-provider/baseline.json",
      absolute: path.join(repoRoot, ".habitat/fixtures/rules/advisory-provider/baseline.json"),
      source: "[]",
    };
    const rules = ruleFactsCatalog({
      schemaVersion: 2,
      ownerRoots: { habitat: "tools/habitat" },
      rules: [
        {
          ...fakeRule("advisory-provider", "grit", "habitat"),
          lane: "advisory",
          runner: {
            name: "grit",
            files: {
              pattern:
                ".habitat/habitat/toolkit/_blueprints/grit-provider/prohibit_product_scan_roots_in_grit_provider/pattern.md",
            },
            patternName: "advisory_provider",
          },
          scanRoots: ["tools/habitat"],
          supportFiles: { baseline: baselineAuthority.relative },
        },
      ],
    });
    const baselineFileSystem = {
      isDirectory: () => Effect.succeed(false),
      isFile: (candidate: string) => Effect.succeed(candidate === baselineAuthority.absolute),
      makeDirectory: () => Effect.void,
      readDirectory: () => Effect.succeed([]),
      readText: (candidate: string) =>
        Match.value(candidate).pipe(
          Match.when(baselineAuthority.absolute, () => Effect.succeed(baselineAuthority.source)),
          Match.orElse((unexpected) => Effect.fail(new Error(`Unexpected read: ${unexpected}`)))
        ),
      writeText: () => Effect.void,
    };
    const protectedOwner = {
      ownerId: "generated-output-owner",
      displayName: "Generated output owner",
      recoveryContact: "generated-output-owner",
    };
    const protectedRecovery = {
      ownerId: "generated-output-owner",
      actionKind: "select-approved-scan-root" as const,
      instruction: "Select an approved source root.",
    };
    const dispositions = [
      {
        kind: "not-applicable" as const,
        reason: "no-matched-scan-roots" as const,
      },
      {
        kind: "refused" as const,
        decision: { kind: "refused" as const, reason: "empty" as const },
      },
      {
        kind: "refused" as const,
        decision: { kind: "refused" as const, reason: "outside-repo" as const, root: "../outside" },
      },
      {
        kind: "refused" as const,
        decision: { kind: "refused" as const, reason: "missing" as const, root: "missing" },
      },
      {
        kind: "refused" as const,
        decision: {
          kind: "refused" as const,
          reason: "generated-output" as const,
          root: "dist",
          owner: protectedOwner,
          recovery: protectedRecovery,
        },
      },
      {
        kind: "refused" as const,
        decision: {
          kind: "refused" as const,
          reason: "protected-root" as const,
          root: "node_modules",
          owner: protectedOwner,
          recovery: protectedRecovery,
        },
      },
      {
        kind: "refused" as const,
        decision: { kind: "refused" as const, reason: "not-approved" as const, root: "other" },
      },
      {
        kind: "failed" as const,
        failure: "DiagnosticCommandFailed" as const,
      },
    ];
    const unrelatedFailure = Effect.die(new Error("unrelated provider should not run"));
    const createDiagnosticReport = (runRules: RuleDiagnosticsService["runRules"]) =>
      createCheckReportEffect(
        { rule: "advisory-provider" },
        {
          baselineFileSystem,
          repoRoot,
          biome: { run: () => unrelatedFailure },
          command: { run: () => unrelatedFailure },
          git: {
            diffNameOnly: () => unrelatedFailure,
            diffNameStatus: () => unrelatedFailure,
            lsTreeNameOnly: () => Effect.succeed(null),
            mergeBase: () => Effect.succeed(null),
            show: () => Effect.succeed(null),
          },
          ruleDiagnostics: { runRules },
          nx: { runMany: () => unrelatedFailure, runTarget: () => unrelatedFailure },
          rules,
          structureFileSystem: baselineFileSystem,
        }
      );
    for (const disposition of dispositions) {
      const detail = Match.value(disposition).pipe(
        Match.when({ kind: "not-applicable" }, () => "not applicable"),
        Match.when({ kind: "failed" }, () => "provider unavailable"),
        Match.orElse(({ decision }) => `scan root refused: ${decision.reason}`)
      );
      const report = await Effect.runPromise(
        createDiagnosticReport(() =>
          Match.value(disposition).pipe(
            Match.when({ kind: "failed" }, (failed) =>
              Effect.succeed(
                new Map([
                  [
                    "advisory-provider",
                    {
                      kind: "failed" as const,
                      failure: failed.failure,
                      detail,
                      diagnostics: [
                        {
                          ruleId: "advisory-provider",
                          path: ".",
                          message: detail,
                          severity: "advisory" as const,
                          baselined: false,
                        },
                      ] as const,
                      durationMs: 1,
                    },
                  ],
                ])
              )
            ),
            Match.when({ kind: "not-applicable" }, (notApplicable) =>
              Effect.succeed(new Map([["advisory-provider", { ...notApplicable, durationMs: 1 }]]))
            ),
            Match.when({ kind: "refused" }, (refused) =>
              Effect.succeed(
                new Map([
                  [
                    "advisory-provider",
                    {
                      kind: "refused" as const,
                      decision: refused.decision,
                      detail,
                      durationMs: 1,
                    },
                  ],
                ])
              )
            ),
            Match.exhaustive
          )
        )
      );
      const parsed = Value.Parse(
        CheckReportSchema,
        JSON.parse(renderCheckReport(report, { json: true }))
      );
      const producedDisposition = parsed.rules[0]?.disposition;

      Match.value(disposition).pipe(
        Match.when({ kind: "not-applicable" }, (notApplicable) => {
          expect(report.ok).toBe(true);
          expect(report.rules[0]).toMatchObject({
            ruleId: "advisory-provider",
            lane: "advisory",
            status: "pass",
            disposition: notApplicable,
            diagnostics: [],
          });
          expect(producedDisposition).toEqual(notApplicable);
          expect(hookCheckSummary(parsed).kind).toBe("not-applicable");
          expect(verifyCheckSummary(parsed)).toMatchObject({
            refusedCount: 0,
            notApplicableCount: 1,
          });
        }),
        Match.when({ kind: "failed" }, (failed) => {
          expect(report.ok).toBe(false);
          expect(report.rules[0]).toMatchObject({
            ruleId: "advisory-provider",
            lane: "advisory",
            status: "fail",
          });
          expect(producedDisposition).toEqual({
            kind: "execution-failed",
            source: "diagnostic-provider",
            failure: failed.failure,
            detail: expect.any(String),
          });
          expect(hookCheckSummary(parsed).kind).toBe("diagnostic-unavailable");
          expect(verifyCheckSummary(parsed).refusedCount).toBe(1);
        }),
        Match.when({ kind: "refused" }, (refused) => {
          expect(report.ok).toBe(false);
          expect(report.rules[0]).toMatchObject({
            ruleId: "advisory-provider",
            lane: "advisory",
            status: "fail",
          });
          expect(producedDisposition).toEqual({
            kind: "dependency-refused",
            source: "diagnostic-scan-root",
            decision: refused.decision,
            detail,
          });
          expect(hookCheckSummary(parsed).kind).toBe("dependency-refused");
          expect(verifyCheckSummary(parsed).refusedCount).toBe(1);
        }),
        Match.exhaustive
      );
    }

    const missingReport = await Effect.runPromise(
      createDiagnosticReport(() => Effect.succeed(new Map()))
    );
    expect(missingReport.ok).toBe(false);
    expect(missingReport.rules[0]).toMatchObject({
      ruleId: "advisory-provider",
      status: "fail",
      disposition: {
        kind: "execution-failed",
        source: "diagnostic-provider",
        failure: "DiagnosticProviderContractViolation",
        detail: "RuleDiagnostics returned no result for demanded rule 'advisory-provider'.",
      },
      diagnostics: [
        {
          ruleId: "advisory-provider",
          severity: "advisory",
          message: expect.stringContaining("DiagnosticProviderContractViolation"),
        },
      ],
    });
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
    disposition: { kind: "executed" },
    diagnostics: [],
    message: "demo",
    remediate: null,
    ...overrides,
  };
}

function fakeSourceRuleFact(id: string, scanRoots: readonly string[]): RuleDiagnosticFacts {
  return {
    id,
    lane: "enforced",
    message: "test fixture",
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
