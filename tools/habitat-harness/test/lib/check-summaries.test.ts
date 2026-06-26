import {
  HookCheckSummarySchema,
  hookCheckSummary,
  VerifyCheckSummarySchema,
  verifyCheckSummary,
} from "@internal/habitat-harness/service/model/check/structural/index";
import type {
  CheckReport,
  RuleReport,
} from "@internal/habitat-harness/service/model/check/structural/schema";
import { Value } from "typebox/value";
import { describe, expect, test } from "vitest";

describe("check summaries", () => {
  test("projects Grit provider failures as hook diagnostic unavailability", () => {
    const summary = hookCheckSummary(
      report({
        ok: false,
        rules: [
          rule({
            ownerTool: "source-check",
            status: "fail",
            diagnostics: [
              diagnostic(
                "Grit rule failed.\n--- grit provider failure (GritMalformedJson) ---\nwrapped JSON"
              ),
            ],
          }),
        ],
      })
    );

    expect(summary.kind).toBe("diagnostic-unavailable");
    expect(summary.failedRuleIds).toEqual(["demo-rule"]);
    expect(Value.Check(HookCheckSummarySchema, summary)).toBe(true);
  });

  test("projects verify handoff summary without treating built-in rows as real rule ids", () => {
    const summary = verifyCheckSummary(
      report({
        ok: false,
        rules: [
          rule({ ruleId: "adapter-boundary", ownerTool: "command-check", status: "pass" }),
          rule({
            ruleId: "baseline-integrity",
            ownerTool: "habitat-builtin",
            status: "fail",
            detect: ["habitat", "check", "(built-in)"],
            diagnostics: [diagnostic("baseline contract refused")],
          }),
        ],
      }),
      { rule: "adapter-boundary" }
    );

    expect(summary.reportSchemaVersion).toBe(1);
    expect(summary.selectedRuleIds).toEqual(["adapter-boundary", "baseline-integrity"]);
    expect(summary.selectedRealRuleIds).toEqual(["adapter-boundary"]);
    expect(summary.builtInRuleIds).toEqual(["baseline-integrity"]);
    expect(summary.failingCount).toBe(1);
    expect(summary.refusedCount).toBe(1);
    expect(summary.allowsAffectedExecution).toBe(false);
    expect(summary.skippedAffectedReason).toBe("dependency-refused");
    expect(Value.Check(VerifyCheckSummarySchema, summary)).toBe(true);
  });

  test("projects empty applicable rule sets as not applicable", () => {
    const hookSummary = hookCheckSummary(report({ ok: true, rules: [] }));
    const verifySummary = verifyCheckSummary(report({ ok: true, rules: [] }));

    expect(hookSummary.kind).toBe("not-applicable");
    expect(verifySummary.notApplicableCount).toBe(1);
    expect(verifySummary.allowsAffectedExecution).toBe(true);
    expect(verifySummary.skippedAffectedReason).toBeUndefined();
    expect(Value.Check(HookCheckSummarySchema, hookSummary)).toBe(true);
    expect(Value.Check(VerifyCheckSummarySchema, verifySummary)).toBe(true);
  });

  test("does not classify ordinary diagnostic prose as dependency refusal", () => {
    const summary = verifyCheckSummary(
      report({
        ok: false,
        rules: [
          rule({
            status: "fail",
            diagnostics: [diagnostic("ordinary rule failed: could not parse a fixture")],
          }),
        ],
      })
    );

    expect(summary.refusedCount).toBe(0);
    expect(summary.skippedAffectedReason).toBe("habitat-check-failed");
  });

  test("projects not-applicable diagnostics explicitly", () => {
    const summary = hookCheckSummary(
      report({
        ok: false,
        rules: [
          rule({
            status: "fail",
            diagnostics: [
              diagnostic(
                "Rule not applicable: staged scope contains no approved roots for this rule."
              ),
            ],
          }),
        ],
      })
    );

    expect(summary.kind).toBe("not-applicable");
    expect(Value.Check(HookCheckSummarySchema, summary)).toBe(true);
  });
});

function report(options: { ok: boolean; rules: RuleReport[] }): CheckReport {
  return {
    schemaVersion: 1,
    command: "habitat check --json",
    startedAt: "2026-06-19T00:00:00.000Z",
    ok: options.ok,
    rules: options.rules,
  };
}

function rule(options: Partial<RuleReport> = {}): RuleReport {
  return {
    ruleId: options.ruleId ?? "demo-rule",
    ownerTool: options.ownerTool ?? "command-check",
    lane: options.lane ?? "enforced",
    status: options.status ?? "pass",
    locked: options.locked ?? true,
    durationMs: options.durationMs ?? 1,
    diagnostics: options.diagnostics ?? [],
    detect: options.detect ?? ["habitat", "check"],
    message: options.message ?? "demo rule",
    remediate: options.remediate ?? null,
  };
}

function diagnostic(message: string): RuleReport["diagnostics"][number] {
  return {
    ruleId: "demo-rule",
    path: ".",
    message,
    severity: "error",
    baselined: false,
  };
}
