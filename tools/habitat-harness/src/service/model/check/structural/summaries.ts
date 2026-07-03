import { isDiagnosticProviderFailureKind } from "@internal/habitat-harness/service/model/check/diagnostics/index";
import { Value } from "typebox/value";
import {
  isDependencyRefusalDiagnostic,
  isNotApplicableDiagnostic,
} from "./disposition-diagnostics.js";
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
} from "./schema.js";

export function checkOutcomeFromReport(report: CheckReport): CheckOutcome {
  const failingReports = report.rules.filter((rule) => rule.status === "fail");
  const notApplicableReports = report.rules.filter(hasNotApplicableDiagnostic);
  if (isNotApplicableOutcome(report, notApplicableReports)) {
    return Value.Parse(CheckOutcomeSchema, {
      kind: "no-applicable-rules",
      reports: notApplicableReports,
    });
  }
  if (isSelectorRefusalReport(report)) {
    return Value.Parse(CheckOutcomeSchema, {
      kind: "selector-refused",
      report: report.rules[0],
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
  const failedRuleIds = failedRules(report).map((rule) => rule.ruleId);
  const advisoryRuleIds = report.rules
    .filter((rule) => rule.status === "advisory-findings")
    .map((rule) => rule.ruleId);
  return Value.Parse(HookCheckSummarySchema, {
    kind: hookCheckKind(report, outcome),
    selectedRuleIds: selectedRuleIds(report),
    failedRuleIds,
    advisoryRuleIds,
  });
}

export function verifyCheckSummary(
  report: CheckReport,
  requestedSelectors: SelectorRequest = {}
): VerifyCheckSummary {
  const builtInRuleIds = builtInRules(report).map((rule) => rule.ruleId);
  const selectedIds = selectedRuleIds(report);
  const outcome = checkOutcomeFromReport(report);
  const failingCount = failedRules(report).length;
  const notApplicableCount =
    report.rules.length === 0 && outcome.kind === "no-applicable-rules"
      ? 1
      : report.rules.filter(hasNotApplicableDiagnostic).length;
  return Value.Parse(VerifyCheckSummarySchema, {
    reportSchemaVersion: report.schemaVersion,
    requestedSelectors,
    selectedRuleIds: selectedIds,
    selectedRealRuleIds: selectedIds.filter((ruleId) => !builtInRuleIds.includes(ruleId)),
    builtInRuleIds,
    statusCounts: countRuleStatuses(report.rules),
    advisoryCount: advisoryRuleIds(report).length,
    failingCount,
    refusedCount: refusedCount(report),
    notApplicableCount,
    allowsAffectedExecution: report.ok,
    ...(!report.ok ? { skippedAffectedReason: skippedAffectedReason(outcome) } : {}),
  });
}

export function isDiagnosticUnavailableSummary(summary: HookCheckSummary): boolean {
  return summary.kind === "diagnostic-unavailable";
}

function hookCheckKind(report: CheckReport, outcome: CheckOutcome): HookCheckSummary["kind"] {
  if (outcome.kind === "selector-refused") return "selector-refused";
  if (hasGritProviderFailure(report)) return "diagnostic-unavailable";
  if (hasBaselineRefusal(report)) return "baseline-refused";
  if (outcome.kind === "dependency-refused") return "dependency-refused";
  if (outcome.kind === "no-applicable-rules") return "not-applicable";
  if (outcome.kind === "advisory-only") return "advisory-only";
  return outcome.kind === "passed" ? "pass" : "fail";
}

function skippedAffectedReason(outcome: CheckOutcome): string {
  if (outcome.kind === "selector-refused") return "selector-refused";
  if (outcome.kind === "dependency-refused") return "dependency-refused";
  if (outcome.kind === "no-applicable-rules") return "not-applicable";
  return "habitat-check-failed";
}

function selectedRuleIds(report: CheckReport): string[] {
  return report.rules.map((rule) => rule.ruleId);
}

function builtInRules(report: CheckReport): RuleReport[] {
  return report.rules.filter(
    (rule) => rule.ownerTool === "habitat-builtin" && rule.detect.includes("(built-in)")
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
  for (const report of reports) {
    counts[report.status] = (counts[report.status] ?? 0) + 1;
  }
  return counts;
}

function refusedCount(report: CheckReport): number {
  return report.rules.filter(isRefusedReport).length;
}

function reportContainsDependencyRefusal(report: CheckReport): boolean {
  return report.rules.some(
    (rule) =>
      (rule.ruleId === "baseline-integrity" && rule.status === "fail") ||
      rule.diagnostics.some(isDependencyRefusalDiagnostic)
  );
}

function isSelectorRefusalReport(report: CheckReport): boolean {
  return report.rules.length === 1 && report.rules[0]?.ruleId === "rule-selection-integrity";
}

function hasBaselineRefusal(report: CheckReport): boolean {
  return report.rules.some(
    (rule) => rule.ruleId === "baseline-integrity" && rule.status === "fail"
  );
}

function hasGritProviderFailure(report: CheckReport): boolean {
  return report.rules.some(
    (rule) =>
      (rule.ownerTool === "source-check" || rule.ownerTool === "grit-check") &&
      rule.diagnostics.some(
        (diagnostic) => parseGritProviderFailureKind(diagnostic.message) !== null
      )
  );
}

function hasNotApplicableDiagnostic(report: RuleReport): boolean {
  return report.diagnostics.some(isNotApplicableDiagnostic);
}

function isNotApplicableOutcome(
  report: CheckReport,
  notApplicableReports: readonly RuleReport[]
): boolean {
  if (notApplicableReports.length === 0) return false;
  const notApplicableRuleIds = new Set(notApplicableReports.map((rule) => rule.ruleId));
  return report.rules
    .filter((rule) => rule.ruleId !== "baseline-integrity")
    .every((rule) => notApplicableRuleIds.has(rule.ruleId) || rule.status === "pass");
}

function isRefusedReport(rule: RuleReport): boolean {
  return (
    (rule.ruleId === "baseline-integrity" && rule.status === "fail") ||
    rule.diagnostics.some(isDependencyRefusalDiagnostic) ||
    rule.diagnostics.some((diagnostic) => parseGritProviderFailureKind(diagnostic.message) !== null)
  );
}

function parseGritProviderFailureKind(message: string): string | null {
  const marker = "--- grit provider failure (";
  const line = message.split("\n").find((candidate) => candidate.startsWith(marker));
  if (!line) return null;
  const closing = line.indexOf(")", marker.length);
  if (closing === -1) return null;
  const kind = line.slice(marker.length, closing);
  return isDiagnosticProviderFailureKind(kind) ? kind : null;
}
