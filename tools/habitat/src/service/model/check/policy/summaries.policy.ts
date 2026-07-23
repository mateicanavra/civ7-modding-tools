import { Value } from "typebox/value";
import {
  type CheckOutcome,
  CheckOutcomeSchema,
  type CheckReport,
  type HookCheckSummary,
  HookCheckSummarySchema,
  type RuleReport,
  type SelectorRequest,
  type VerifyCheckSummary,
  VerifyCheckSummarySchema,
} from "../dto/check.schema.js";

export function checkOutcomeFromReport(report: CheckReport): CheckOutcome {
  const failingReports = report.rules.filter((rule) => rule.status === "fail");
  const notApplicableReports = report.rules.filter(isNotApplicableReport);
  if (isNotApplicableOutcome(report)) {
    return Value.Parse(CheckOutcomeSchema, {
      kind: "no-applicable-rules",
      reports: notApplicableReports,
    });
  }
  const selectorRefusal = report.rules.find(isSelectorRefusalReport);
  if (selectorRefusal) {
    return Value.Parse(CheckOutcomeSchema, {
      kind: "selector-refused",
      report: selectorRefusal,
    });
  }
  if (failingReports.length > 0) {
    return Value.Parse(CheckOutcomeSchema, {
      kind: reportContainsDependencyRefusal(report) ? "dependency-refused" : "failed",
      reports: failingReports,
    });
  }
  const advisoryReports = report.rules.filter((rule) => rule.status === "advisory-findings");
  if (advisoryReports.length > 0) {
    return Value.Parse(CheckOutcomeSchema, {
      kind: "advisory-only",
      reports: advisoryReports,
    });
  }
  if (report.rules.length === 0) {
    return Value.Parse(CheckOutcomeSchema, { kind: "no-applicable-rules", reports: [] });
  }
  return Value.Parse(CheckOutcomeSchema, { kind: "passed", reports: report.rules });
}

export function hookCheckSummary(report: CheckReport): HookCheckSummary {
  const outcome = checkOutcomeFromReport(report);
  return Value.Parse(HookCheckSummarySchema, {
    kind: hookCheckKind(report, outcome),
    selectedRuleIds: selectedRuleIds(report),
    failedRuleIds: failedRules(report).map((rule) => rule.ruleId),
    advisoryRuleIds: advisoryRuleIds(report),
  });
}

export function verifyCheckSummary(
  report: CheckReport,
  requestedSelectors: SelectorRequest = {}
): VerifyCheckSummary {
  const builtInRuleIds = builtInRules(report).map((rule) => rule.ruleId);
  const selectedIds = selectedRuleIds(report);
  const outcome = checkOutcomeFromReport(report);
  const notApplicableCount =
    report.rules.length === 0 && outcome.kind === "no-applicable-rules"
      ? 1
      : report.rules.filter(isNotApplicableReport).length;
  return Value.Parse(VerifyCheckSummarySchema, {
    reportSchemaVersion: report.schemaVersion,
    requestedSelectors,
    selectedRuleIds: selectedIds,
    selectedRealRuleIds: selectedIds.filter((ruleId) => !builtInRuleIds.includes(ruleId)),
    builtInRuleIds,
    statusCounts: countRuleStatuses(report.rules),
    advisoryCount: advisoryRuleIds(report).length,
    failingCount: failedRules(report).length,
    refusedCount: refusedCount(report),
    notApplicableCount,
    allowsAffectedExecution: report.ok,
    ...(!report.ok ? { skippedAffectedReason: skippedAffectedReason(report, outcome) } : {}),
  });
}

export function isDiagnosticUnavailableSummary(summary: HookCheckSummary): boolean {
  return summary.kind === "diagnostic-unavailable";
}

function hookCheckKind(report: CheckReport, outcome: CheckOutcome): HookCheckSummary["kind"] {
  if (outcome.kind === "selector-refused") return "selector-refused";
  if (report.rules.some(isNonDiagnosticExecutionFailureReport)) return "execution-failed";
  if (report.rules.some(isDiagnosticExecutionFailureReport)) return "diagnostic-unavailable";
  if (report.rules.some(isBaselineRefusalReport)) return "baseline-refused";
  if (outcome.kind === "dependency-refused") return "dependency-refused";
  if (outcome.kind === "no-applicable-rules") return "not-applicable";
  if (outcome.kind === "advisory-only") return "advisory-only";
  return outcome.kind === "passed" ? "pass" : "fail";
}

function skippedAffectedReason(report: CheckReport, outcome: CheckOutcome): string {
  if (outcome.kind === "selector-refused") return "selector-refused";
  if (report.rules.some(isNonDiagnosticExecutionFailureReport)) return "execution-failed";
  if (report.rules.some(isDiagnosticExecutionFailureReport)) return "diagnostic-unavailable";
  if (report.rules.some(isBaselineRefusalReport)) return "baseline-refused";
  if (outcome.kind === "dependency-refused") return "dependency-refused";
  if (outcome.kind === "no-applicable-rules") return "not-applicable";
  return "habitat-check-failed";
}

function selectedRuleIds(report: CheckReport): string[] {
  return report.rules.map((rule) => rule.ruleId);
}

function builtInRules(report: CheckReport): RuleReport[] {
  return report.rules.filter(
    (rule) =>
      rule.disposition.kind === "selector-refused" || rule.disposition.kind === "baseline-integrity"
  );
}

function failedRules(report: CheckReport): RuleReport[] {
  return report.rules.filter((rule) => rule.status === "fail");
}

function advisoryRuleIds(report: CheckReport): string[] {
  return report.rules
    .filter((rule) => rule.status === "advisory-findings")
    .map((rule) => rule.ruleId);
}

function countRuleStatuses(reports: readonly RuleReport[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const report of reports) counts[report.status] = (counts[report.status] ?? 0) + 1;
  return counts;
}

function refusedCount(report: CheckReport): number {
  return report.rules.filter((rule) => {
    switch (rule.disposition.kind) {
      case "dependency-refused":
      case "execution-failed":
      case "selector-refused":
        return true;
      case "baseline-integrity":
        return rule.disposition.state === "refused";
      case "executed":
      case "not-applicable":
        return false;
    }
  }).length;
}

function reportContainsDependencyRefusal(report: CheckReport): boolean {
  return report.rules.some(
    (rule) => rule.disposition.kind === "dependency-refused" || isBaselineRefusalReport(rule)
  );
}

function isSelectorRefusalReport(rule: RuleReport): boolean {
  return rule.disposition.kind === "selector-refused";
}

function isBaselineRefusalReport(rule: RuleReport): boolean {
  return rule.disposition.kind === "baseline-integrity" && rule.disposition.state === "refused";
}

function isExecutionFailureReport(rule: RuleReport): boolean {
  return rule.disposition.kind === "execution-failed";
}

function isDiagnosticExecutionFailureReport(rule: RuleReport): boolean {
  return (
    rule.disposition.kind === "execution-failed" &&
    rule.disposition.source === "diagnostic-provider"
  );
}

function isNonDiagnosticExecutionFailureReport(rule: RuleReport): boolean {
  return isExecutionFailureReport(rule) && !isDiagnosticExecutionFailureReport(rule);
}

function isNotApplicableReport(rule: RuleReport): boolean {
  return rule.disposition.kind === "not-applicable";
}

function isNotApplicableOutcome(report: CheckReport): boolean {
  let realRuleCount = 0;
  for (const rule of report.rules) {
    if (rule.status !== "pass") return false;
    switch (rule.disposition.kind) {
      case "not-applicable":
        realRuleCount += 1;
        break;
      case "baseline-integrity":
        if (rule.disposition.state !== "passed") return false;
        break;
      case "executed":
      case "dependency-refused":
      case "execution-failed":
      case "selector-refused":
        return false;
    }
  }
  return realRuleCount > 0;
}
