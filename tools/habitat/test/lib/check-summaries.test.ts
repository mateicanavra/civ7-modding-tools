import {
  type CheckReport,
  CheckReportSchema,
  HookCheckSummarySchema,
  hookCheckSummary,
  type RuleReport,
  VerifyCheckSummarySchema,
  validateCheckReport,
  verifyCheckSummary,
} from "@habitat/cli/service/model/check/index";
import {
  type DiagnosticScanRootRefusal,
  DiagnosticScanRootRefusalSchema,
  diagnosticProviderFailureKinds,
  renderDiagnosticProviderFailure,
  renderDiagnosticScanRootRefusal,
} from "@habitat/cli/service/model/diagnostics/index";
import { Value } from "typebox/value";
import { describe, expect, test } from "vitest";

describe("check summaries", () => {
  test("projects typed provider failures as diagnostic unavailability", () => {
    const original = report({
      ok: false,
      rules: [
        rule({
          status: "fail",
          disposition: {
            kind: "execution-failed",
            source: "diagnostic-provider",
            failure: "DiagnosticOutputMalformed",
            detail: "wrapped JSON",
          },
          diagnostics: [diagnostic(renderDiagnosticProviderFailure("DiagnosticOutputMalformed"))],
        }),
      ],
    });
    const parsed = Value.Parse(CheckReportSchema, JSON.parse(JSON.stringify(original)));
    const hookSummary = hookCheckSummary(parsed);
    const verifySummary = verifyCheckSummary(parsed);

    expect(parsed.rules[0]?.disposition).toEqual(original.rules[0]?.disposition);
    expect(hookSummary.kind).toBe("diagnostic-unavailable");
    expect(hookSummary.failedRuleIds).toEqual(["demo-rule"]);
    expect(verifySummary.refusedCount).toBe(1);
    expect(verifySummary.skippedAffectedReason).toBe("diagnostic-unavailable");
    expect(Value.Check(HookCheckSummarySchema, hookSummary)).toBe(true);
  });

  test.each(scanRootRefusals)("roundtrips typed scan-root refusal $reason", (decision) => {
    const original = report({
      ok: false,
      rules: [
        rule({
          status: "fail",
          disposition: {
            kind: "dependency-refused",
            source: "diagnostic-scan-root",
            decision,
            detail: `refused ${decision.reason}`,
          },
          diagnostics: [diagnostic(`Dependency refused: refused ${decision.reason}`)],
        }),
      ],
    });
    const parsed = Value.Parse(CheckReportSchema, JSON.parse(JSON.stringify(original)));
    const hookSummary = hookCheckSummary(parsed);
    const verifySummary = verifyCheckSummary(parsed);

    expect(parsed.rules[0]?.disposition).toEqual(original.rules[0]?.disposition);
    expect(hookSummary.kind).toBe("dependency-refused");
    expect(verifySummary.refusedCount).toBe(1);
    expect(verifySummary.skippedAffectedReason).toBe("dependency-refused");
    expect(renderDiagnosticScanRootRefusal(decision)).not.toContain("undefined");
  });

  test("classifies selector and baseline built-ins only from disposition", () => {
    const selector = rule({
      ruleId: "ordinary-looking-id",
      status: "fail",
      disposition: {
        kind: "selector-refused",
        refusal: { reason: "unknown-selector", message: "unknown" },
      },
    });
    expect(hookCheckSummary(report({ ok: false, rules: [selector] })).kind).toBe(
      "selector-refused"
    );

    const summary = verifyCheckSummary(
      report({
        ok: false,
        rules: [
          rule({ ruleId: "baseline-integrity", status: "pass" }),
          rule({
            ruleId: "another-ordinary-id",
            status: "fail",
            disposition: { kind: "baseline-integrity", state: "refused" },
          }),
        ],
      })
    );

    expect(summary.reportSchemaVersion).toBe(2);
    expect(summary.selectedRealRuleIds).toEqual(["baseline-integrity"]);
    expect(summary.builtInRuleIds).toEqual(["another-ordinary-id"]);
    expect(summary.refusedCount).toBe(1);
    expect(summary.skippedAffectedReason).toBe("baseline-refused");
    expect(Value.Check(VerifyCheckSummarySchema, summary)).toBe(true);
  });

  test("projects empty and typed not-applicable rule sets explicitly", () => {
    const emptyHook = hookCheckSummary(report({ ok: true, rules: [] }));
    const emptyVerify = verifyCheckSummary(report({ ok: true, rules: [] }));
    const typedHook = hookCheckSummary(
      report({
        ok: true,
        rules: [
          rule({
            status: "pass",
            disposition: {
              kind: "not-applicable",
              reason: "no-matched-scan-roots",
            },
          }),
        ],
      })
    );

    expect(emptyHook.kind).toBe("not-applicable");
    expect(emptyVerify.notApplicableCount).toBe(1);
    expect(typedHook.kind).toBe("not-applicable");

    const withPassedBaseline = hookCheckSummary(
      report({
        ok: true,
        rules: [
          rule({
            status: "pass",
            disposition: {
              kind: "not-applicable",
              reason: "no-matched-scan-roots",
            },
          }),
          rule({
            ruleId: "baseline-integrity",
            status: "pass",
            disposition: { kind: "baseline-integrity", state: "passed" },
          }),
        ],
      })
    );
    expect(withPassedBaseline.kind).toBe("not-applicable");
  });

  test("preserves failing and advisory not-applicable outcomes", () => {
    const failing = hookCheckSummary(
      report({
        ok: false,
        rules: [
          rule({
            status: "fail",
            disposition: { kind: "not-applicable", reason: "no-matched-scan-roots" },
            diagnostics: [diagnostic("enforced finding")],
          }),
        ],
      })
    );
    const advisory = hookCheckSummary(
      report({
        ok: true,
        rules: [
          rule({
            lane: "advisory",
            status: "advisory-findings",
            disposition: { kind: "not-applicable", reason: "no-matched-scan-roots" },
            diagnostics: [{ ...diagnostic("advisory finding"), severity: "advisory" }],
          }),
        ],
      })
    );

    expect(failing.kind).toBe("fail");
    expect(advisory.kind).toBe("advisory-only");
  });

  test("does not let a not-applicable row erase a real or stronger state", () => {
    const notApplicable = rule({
      ruleId: "not-applicable-rule",
      status: "pass",
      disposition: { kind: "not-applicable", reason: "no-matched-scan-roots" },
    });

    expect(
      hookCheckSummary(
        report({ ok: true, rules: [notApplicable, rule({ ruleId: "executed-rule" })] })
      ).kind
    ).toBe("pass");
    expect(
      hookCheckSummary(
        report({
          ok: true,
          rules: [notApplicable, rule({ ruleId: "advisory-rule", status: "advisory-findings" })],
        })
      ).kind
    ).toBe("advisory-only");
    expect(
      hookCheckSummary(
        report({
          ok: false,
          rules: [
            notApplicable,
            rule({
              ruleId: "failed-rule",
              status: "fail",
              disposition: {
                kind: "execution-failed",
                source: "diagnostic-provider",
                failure: "DiagnosticOutputMalformed",
                detail: "bad wire",
              },
            }),
          ],
        })
      ).kind
    ).toBe("diagnostic-unavailable");
    expect(
      hookCheckSummary(
        report({
          ok: false,
          rules: [
            notApplicable,
            rule({
              ruleId: "baseline-integrity",
              status: "fail",
              disposition: { kind: "baseline-integrity", state: "refused" },
            }),
          ],
        })
      ).kind
    ).toBe("baseline-refused");
  });

  test.each([
    "Rule not applicable: ordinary rule prose",
    "Dependency refused: ordinary rule prose",
    ...diagnosticProviderFailureKinds.map((kind) => renderDiagnosticProviderFailure(kind)),
  ])("keeps executed diagnostic collision as an ordinary finding: %s", (message) => {
    const collisionReport = report({
      ok: false,
      rules: [rule({ status: "fail", diagnostics: [diagnostic(message)] })],
    });
    const hookSummary = hookCheckSummary(collisionReport);
    const verifySummary = verifyCheckSummary(collisionReport);

    expect(hookSummary.kind).toBe("fail");
    expect(verifySummary.refusedCount).toBe(0);
    expect(verifySummary.notApplicableCount).toBe(0);
    expect(verifySummary.skippedAffectedReason).toBe("habitat-check-failed");
  });

  test("rejects stale, incomplete, and disposition-status contradictory reports", () => {
    const valid = report({ ok: true, rules: [rule()] });
    expect(validateCheckReport(valid)).toEqual([]);
    expect(validateCheckReport({ ...valid, schemaVersion: 1 })).not.toEqual([]);
    const { disposition: _disposition, ...missingDisposition } = valid.rules[0]!;
    expect(validateCheckReport({ ...valid, rules: [missingDisposition] })).not.toEqual([]);
    expect(
      validateCheckReport({
        ...valid,
        ok: false,
        rules: [
          rule({
            status: "fail",
            disposition: { kind: "baseline-integrity", state: "passed" },
          }),
        ],
      })
    ).toContain("/rules/0/status: baseline-integrity disposition requires status pass");

    const finding = diagnostic("finding");
    const advisoryFinding = { ...finding, severity: "advisory" as const };
    expect(
      validateCheckReport(
        report({
          ok: true,
          rules: [rule({ lane: "enforced", status: "pass", diagnostics: [finding] })],
        })
      )
    ).toContain("/rules/0/status: executed disposition requires status fail");
    expect(
      validateCheckReport(
        report({
          ok: true,
          rules: [rule({ lane: "enforced", status: "pass", diagnostics: [advisoryFinding] })],
        })
      )
    ).toContain("/rules/0/status: executed disposition requires status fail");
    expect(
      validateCheckReport(
        report({
          ok: true,
          rules: [
            rule({
              lane: "advisory",
              status: "pass",
              disposition: { kind: "not-applicable", reason: "no-matched-scan-roots" },
              diagnostics: [finding],
            }),
          ],
        })
      )
    ).toContain("/rules/0/status: not-applicable disposition requires status advisory-findings");
  });

  test("rejects a passed baseline-integrity row with an unbaselined enforced diagnostic", () => {
    const contradictory = report({
      ok: true,
      rules: [
        rule({
          lane: "enforced",
          status: "pass",
          disposition: { kind: "baseline-integrity", state: "passed" },
          diagnostics: [{ ...diagnostic("baseline finding"), severity: "advisory" }],
        }),
      ],
    });

    expect(Value.Check(CheckReportSchema, contradictory)).toBe(true);
    expect(validateCheckReport(contradictory)).toContain(
      "/rules/0/status: baseline-integrity disposition requires status fail"
    );
  });

  test("rejects baseline-integrity outside the enforced lane", () => {
    const contradictory = report({
      ok: true,
      rules: [
        rule({
          lane: "advisory",
          status: "pass",
          disposition: { kind: "baseline-integrity", state: "passed" },
        }),
      ],
    });

    expect(Value.Check(CheckReportSchema, contradictory)).toBe(true);
    expect(validateCheckReport(contradictory)).toEqual([
      "/rules/0/lane: baseline-integrity disposition requires lane enforced",
    ]);
  });

  test.each([
    { kind: "refused", reason: "empty", root: "." },
    { kind: "refused", reason: "outside-repo" },
    { kind: "refused", reason: "missing" },
    { kind: "refused", reason: "not-approved" },
  ])("rejects contradictory scan-root refusal $reason", (decision) => {
    expect(Value.Check(DiagnosticScanRootRefusalSchema, decision)).toBe(false);
    expect(
      validateCheckReport({
        ...report({ ok: false, rules: [] }),
        rules: [
          {
            ...rule({ status: "fail" }),
            disposition: {
              kind: "dependency-refused",
              source: "diagnostic-scan-root",
              decision,
              detail: "invalid scan-root refusal",
            },
          },
        ],
      })
    ).not.toEqual([]);
  });

  test("requires selector refusal to be the sole report row", () => {
    const selector = rule({
      ruleId: "rule-selection-integrity",
      status: "fail",
      disposition: {
        kind: "selector-refused",
        refusal: { reason: "unknown-selector", message: "unknown" },
      },
    });
    const selectorError = "/rules: selector-refused disposition must be the sole report row";

    expect(validateCheckReport(report({ ok: false, rules: [selector] }))).toEqual([]);
    expect(
      validateCheckReport(
        report({ ok: false, rules: [selector, rule({ ruleId: "executed-rule" })] })
      )
    ).toContain(selectorError);
    expect(
      validateCheckReport(
        report({
          ok: false,
          rules: [
            selector,
            rule({
              ruleId: "provider-failure",
              status: "fail",
              disposition: {
                kind: "execution-failed",
                source: "diagnostic-provider",
                failure: "DiagnosticOutputMalformed",
                detail: "bad wire",
              },
            }),
          ],
        })
      )
    ).toContain(selectorError);
    expect(
      validateCheckReport(
        report({
          ok: false,
          rules: [selector, { ...selector, ruleId: "second-selector-refusal" }],
        })
      )
    ).toContain(selectorError);
  });
});

const protectedOwner = {
  ownerId: "generated-artifacts",
  displayName: "Generated artifacts",
  recoveryContact: "Run the owning generator.",
};
const protectedRecovery = {
  ownerId: "generated-artifacts",
  actionKind: "select-approved-scan-root" as const,
  instruction: "Select a source root.",
};
const scanRootRefusals: DiagnosticScanRootRefusal[] = [
  { kind: "refused", reason: "empty" },
  { kind: "refused", reason: "outside-repo", root: "../outside" },
  { kind: "refused", reason: "missing", root: "missing" },
  {
    kind: "refused",
    reason: "generated-output",
    root: "dist",
    owner: protectedOwner,
    recovery: protectedRecovery,
  },
  {
    kind: "refused",
    reason: "protected-root",
    root: ".habitat",
    owner: protectedOwner,
    recovery: protectedRecovery,
  },
  { kind: "refused", reason: "not-approved", root: "other" },
];

function report(options: { ok: boolean; rules: RuleReport[] }): CheckReport {
  return {
    schemaVersion: 2,
    command: "habitat check --json",
    startedAt: "2026-06-19T00:00:00.000Z",
    ok: options.ok,
    rules: options.rules,
  };
}

function rule(options: Partial<RuleReport> = {}): RuleReport {
  return {
    ruleId: options.ruleId ?? "demo-rule",
    runner: options.runner ?? "habitat",
    lane: options.lane ?? "enforced",
    status: options.status ?? "pass",
    locked: options.locked ?? true,
    durationMs: options.durationMs ?? 1,
    disposition: options.disposition ?? { kind: "executed" },
    diagnostics: options.diagnostics ?? [],
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
