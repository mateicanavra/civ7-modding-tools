import { Value } from "typebox/value";
import { describe, expect, test } from "vitest";
import {
  LocalFeedbackCheckProjectionSchema,
  localFeedbackCheckProjection,
  VerifyCheckSummaryProjectionSchema,
  verifyCheckSummaryProjection,
} from "../../src/lib/check-report.js";
import type { CheckReport, RuleReport } from "../../src/lib/diagnostics.js";

describe("check projections", () => {
  test("projects Grit adapter failures as local diagnostic unavailability", () => {
    const projection = localFeedbackCheckProjection(
      report({
        ok: false,
        rules: [
          rule({
            ownerTool: "grit-check",
            status: "fail",
            diagnostics: [
              diagnostic(
                "Grit rule failed.\n--- grit adapter failure (GritMalformedJson) ---\nwrapped JSON"
              ),
            ],
          }),
        ],
      })
    );

    expect(projection.kind).toBe("diagnostic-unavailable");
    expect(projection.failedRuleIds).toEqual(["demo-rule"]);
    expect(Value.Check(LocalFeedbackCheckProjectionSchema, projection)).toBe(true);
  });

  test("projects verify handoff summary without treating built-in rows as real rule ids", () => {
    const projection = verifyCheckSummaryProjection(
      report({
        ok: false,
        rules: [
          rule({ ruleId: "workspace-entrypoints", status: "pass" }),
          rule({
            ruleId: "baseline-integrity",
            ownerTool: "habitat-native",
            status: "fail",
            detect: ["habitat", "check", "(built-in)"],
            diagnostics: [diagnostic("baseline contract refused")],
          }),
        ],
      }),
      { rule: "workspace-entrypoints" }
    );

    expect(projection.reportSchemaVersion).toBe(1);
    expect(projection.selectedRuleIds).toEqual(["workspace-entrypoints", "baseline-integrity"]);
    expect(projection.selectedRealRuleIds).toEqual(["workspace-entrypoints"]);
    expect(projection.builtInRuleIds).toEqual(["baseline-integrity"]);
    expect(projection.failingCount).toBe(1);
    expect(projection.refusedCount).toBe(1);
    expect(projection.allowsAffectedExecution).toBe(false);
    expect(projection.skippedAffectedReason).toBe("dependency-refused");
    expect(Value.Check(VerifyCheckSummaryProjectionSchema, projection)).toBe(true);
  });

  test("projects empty applicable rule sets as not applicable", () => {
    const localProjection = localFeedbackCheckProjection(report({ ok: true, rules: [] }));
    const verifyProjection = verifyCheckSummaryProjection(report({ ok: true, rules: [] }));

    expect(localProjection.kind).toBe("not-applicable");
    expect(verifyProjection.notApplicableCount).toBe(1);
    expect(verifyProjection.allowsAffectedExecution).toBe(true);
    expect(verifyProjection.skippedAffectedReason).toBeUndefined();
    expect(Value.Check(LocalFeedbackCheckProjectionSchema, localProjection)).toBe(true);
    expect(Value.Check(VerifyCheckSummaryProjectionSchema, verifyProjection)).toBe(true);
  });

  test("does not classify ordinary diagnostic prose as dependency refusal", () => {
    const projection = verifyCheckSummaryProjection(
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

    expect(projection.refusedCount).toBe(0);
    expect(projection.skippedAffectedReason).toBe("habitat-check-failed");
  });

  test("projects not-applicable diagnostics explicitly", () => {
    const projection = localFeedbackCheckProjection(
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

    expect(projection.kind).toBe("not-applicable");
    expect(Value.Check(LocalFeedbackCheckProjectionSchema, projection)).toBe(true);
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
    ownerTool: options.ownerTool ?? "habitat-native",
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
