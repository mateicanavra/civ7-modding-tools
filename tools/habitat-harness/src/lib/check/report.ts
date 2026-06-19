import { Value } from "typebox/value";
import { activeRuleReportFacts, factsForRuleIds } from "../../rules/facts.js";
import type { RuleReportFacts } from "../../rules/registry/index.js";
import {
  applyBaseline,
  baselineFailureDiagnostic,
  baselineIntegrityFindings,
  checkBaselineIntegrity,
  isBaselineLocked,
  loadBaselineState,
} from "../baseline.js";
import { selectRules } from "../rule-selection.js";
import { baselineContractInputs } from "./baseline.js";
import { executeSelectedRules, type RuleExecutionRecord, rulesForExecution } from "./execution.js";
import { type CheckOptions, structuralCheckRequest } from "./request.js";
import type { CheckReport, RuleExecutionDisposition, RuleReport } from "./schema.js";
import { constructCheckReport, selectorRefusalReport } from "./selection.js";
import {
  BaselineApplicationOutcomeSchema,
  DiagnosticConsumptionOutcomeSchema,
  RuleExecutionPlanSchema,
  RuleSelectionOutcomeSchema,
  StructuralRuleOutcomeSchema,
} from "./state.js";

export async function createCheckReport(options: CheckOptions = {}): Promise<CheckReport> {
  const request = structuralCheckRequest(options);
  const selection = selectRules(request.selectors);
  if (!selection.ok) return selectorRefusalReport(selection, request);
  Value.Parse(RuleSelectionOutcomeSchema, {
    kind: "selected",
    selector: request.selectors,
    selectedRuleIds: selection.rules.map((rule) => rule.id),
  });

  const selectedRules = rulesForExecution(selection.rules, options);
  const selectedRuleIds = selectedRules.map((rule) => rule.id);
  const reportsByRuleId = factsByRuleId(factsForRuleIds(activeRuleReportFacts, selectedRuleIds));
  const baselineInputsByRuleId = factsByRuleId(baselineContractInputs(selectedRuleIds));
  const reports: RuleReport[] = [];
  const ruleResults = await executeSelectedRules(selectedRules, options);
  for (const rule of selectedRules) {
    const reportFacts = reportsByRuleId.get(rule.id);
    if (!reportFacts)
      throw new Error(`habitat internal error: missing report facts for ${rule.id}`);
    const baselineFacts = baselineInputsByRuleId.get(rule.id);
    if (!baselineFacts)
      throw new Error(`habitat internal error: missing baseline facts for ${rule.id}`);
    const baseline = loadBaselineState(baselineFacts);
    const execution = ruleResults.get(rule.id);
    if (!execution) throw new Error(`habitat internal error: missing rule result for ${rule.id}`);
    Value.Parse(RuleExecutionPlanSchema, {
      ruleId: rule.id,
      ownerTool: rule.ownerTool,
      lane: reportFacts.lane,
      disposition: execution.disposition,
    });
    const executionDiagnostics = execution.result.diagnostics;
    diagnosticConsumptionOutcome(execution.disposition, executionDiagnostics);
    const baselineResult = applyBaseline(executionDiagnostics, baseline);
    const locked = isBaselineLocked(baseline);
    baselineApplicationOutcome(rule.id, baselineResult, locked, executionDiagnostics);
    const diagnostics = [
      ...executionDiagnostics,
      ...baselineResult.refusals.map((failure) => baselineFailureDiagnostic(rule.id, failure)),
    ];
    const report = ruleReportFromDiagnostics({
      ruleId: rule.id,
      reportFacts,
      locked,
      durationMs: execution.durationMs,
      diagnostics,
    });
    structuralRuleOutcome(report, execution.disposition);
    reports.push(report);
  }

  reports.push(baselineIntegrityReport(options.base ?? "main"));
  return constructCheckReport({ command: request.command.serialized, reports });
}

function diagnosticConsumptionOutcome(
  disposition: RuleExecutionDisposition,
  diagnostics: RuleReport["diagnostics"]
) {
  return Value.Parse(
    DiagnosticConsumptionOutcomeSchema,
    disposition.kind === "dependency-refused" || disposition.kind === "execution-failed"
      ? { kind: "diagnostic-refused", diagnostic: diagnostics[0] }
      : diagnostics.length === 0
        ? { kind: "clean", diagnostics: [] }
        : { kind: "findings", diagnostics }
  );
}

function baselineApplicationOutcome(
  ruleId: string,
  baselineResult: ReturnType<typeof applyBaseline>,
  locked: boolean,
  diagnostics: RuleReport["diagnostics"]
) {
  return Value.Parse(
    BaselineApplicationOutcomeSchema,
    baselineResult.refusals.length > 0
      ? {
          kind: "baseline-refused",
          diagnostic: baselineFailureDiagnostic(ruleId, baselineResult.refusals[0]),
        }
      : {
          kind: "baseline-applied",
          locked,
          diagnostics,
        }
  );
}

function structuralRuleOutcome(report: RuleReport, disposition: RuleExecutionDisposition) {
  return Value.Parse(
    StructuralRuleOutcomeSchema,
    disposition.kind === "not-applicable"
      ? { kind: "rule-not-applicable", lane: report.lane, report }
      : disposition.kind === "dependency-refused" || disposition.kind === "execution-failed"
        ? { kind: "rule-refused", lane: report.lane, report }
        : report.status === "advisory-findings"
          ? { kind: "rule-advisory-findings", lane: "advisory", report }
          : report.status === "fail"
            ? { kind: "rule-failed", lane: report.lane, report }
            : { kind: "rule-passed", lane: report.lane, report }
  );
}

function ruleReportFromDiagnostics(input: {
  ruleId: string;
  reportFacts: RuleReportFacts;
  locked: boolean;
  durationMs: number;
  diagnostics: RuleReport["diagnostics"];
}): RuleReport {
  const newViolations = input.diagnostics.filter(
    (diagnostic) => !diagnostic.baselined && diagnostic.severity === "error"
  );
  const status: RuleReport["status"] =
    input.reportFacts.lane === "advisory"
      ? input.diagnostics.length > 0
        ? "advisory-findings"
        : "pass"
      : newViolations.length > 0
        ? "fail"
        : "pass";
  return {
    ruleId: input.ruleId,
    ownerTool: input.reportFacts.ownerTool,
    lane: input.reportFacts.lane,
    status,
    locked: input.locked,
    durationMs: input.durationMs,
    diagnostics: input.diagnostics,
    detect: input.reportFacts.detect,
    message: input.reportFacts.message,
    remediate: input.reportFacts.remediate,
  };
}

function baselineIntegrityReport(base: string): RuleReport {
  const integrityStarted = Date.now();
  const integrity = checkBaselineIntegrity(base, {
    registry: baselineContractInputs(),
  });
  const integrityFindings = baselineIntegrityFindings(integrity);
  return {
    ruleId: "baseline-integrity",
    ownerTool: "habitat-builtin",
    lane: "enforced",
    status: integrity.status === "refused" ? "fail" : "pass",
    locked: true,
    durationMs: Date.now() - integrityStarted,
    diagnostics: integrityFindings.map((finding) => ({
      ruleId: "baseline-integrity",
      path: finding.file,
      message: finding.reason,
      severity: "error" as const,
      baselined: false,
    })),
    detect: ["habitat", "check", "(built-in)"],
    message:
      "Baselines are shrink-only; additions are valid only in the change that introduces the rule itself.",
    remediate: null,
  };
}

function factsByRuleId<T extends { id: string }>(facts: readonly T[]): Map<string, T> {
  return new Map(facts.map((fact) => [fact.id, fact]));
}
