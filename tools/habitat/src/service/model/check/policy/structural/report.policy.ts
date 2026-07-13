import type { FileSystem } from "@effect/platform";
import {
  applyBaseline,
  type BaselineApplicationResult,
  type BaselineAuthorityContext,
  baselineContractInputs,
  baselineFailureDiagnostic,
  baselineIntegrityFindingsEffect,
  checkBaselineIntegrityEffect,
  isBaselineLocked,
  loadBaselineStateEffect,
} from "@habitat/cli/service/model/baseline/index";
import type {
  CheckReport,
  RuleExecutionDisposition,
  RuleReport,
  RuleReportDisposition,
} from "@habitat/cli/service/model/check/index";
import {
  type CheckOptions,
  deriveRuleReportStatus,
  structuralCheckRequest,
} from "@habitat/cli/service/model/check/index";
import type { RuleReportFacts } from "@habitat/cli/service/model/rules/index";
import { factsForRuleIds } from "@habitat/cli/service/model/rules/policy/catalog.policy";
import { selectRules } from "@habitat/cli/service/model/rules/policy/selection.policy";
import { Clock, Effect, Match } from "effect";
import { Value } from "typebox/value";
import type { RuleExecutionRecord, StructuralExecutionContext } from "./context.policy.js";
import { executeSelectedRulesEffect, rulesForExecution } from "./execution.policy.js";
import { constructCheckReportEffect, selectorRefusalReportEffect } from "./selection.policy.js";
import {
  BaselineApplicationOutcomeSchema,
  DiagnosticConsumptionOutcomeSchema,
  RuleExecutionPlanSchema,
  RuleSelectionOutcomeSchema,
  StructuralRuleOutcomeSchema,
} from "./state.policy.js";

export function createCheckReportEffect(
  options: CheckOptions = {},
  context: StructuralExecutionContext
): Effect.Effect<CheckReport, never, any> {
  return Effect.gen(function* () {
    const request = structuralCheckRequest(options);
    const selection = selectRules(request.selectors, context.rules.selector);
    if (!selection.ok) return yield* selectorRefusalReportEffect(selection, request);
    Value.Parse(RuleSelectionOutcomeSchema, {
      kind: "selected",
      selector: request.selectors,
      selectedRuleIds: selection.rules.map((rule) => rule.id),
    });

    const selectedRules = rulesForExecution(selection.rules, {
      ...options,
      selection: request.selectors,
      hookCheckFacts: context.rules.hookCheck,
    });
    const selectedRuleIds = selectedRules.map((rule) => rule.id);
    const reportsByRuleId = factsByRuleId(factsForRuleIds(context.rules.report, selectedRuleIds));
    const baselineInputsByRuleId = factsByRuleId(
      baselineContractInputs(context.rules, selectedRuleIds)
    );
    const reports: RuleReport[] = [];
    const ruleResults = yield* executeSelectedRulesEffect(selectedRules, options, context);
    for (const rule of selectedRules) {
      const reportFacts = reportsByRuleId.get(rule.id);
      if (!reportFacts)
        throw new Error(`habitat internal error: missing report facts for ${rule.id}`);
      const baselineFacts = baselineInputsByRuleId.get(rule.id);
      if (!baselineFacts)
        throw new Error(`habitat internal error: missing baseline facts for ${rule.id}`);
      const baseline = yield* loadBaselineStateEffect(baselineFacts, baselineContext(context));
      const execution = ruleResults.get(rule.id);
      if (!execution) throw new Error(`habitat internal error: missing rule result for ${rule.id}`);
      Value.Parse(RuleExecutionPlanSchema, {
        ruleId: rule.id,
        runner: rule.runner.name,
        lane: reportFacts.lane,
        disposition: execution.disposition,
      });
      const executionDiagnostics = execution.result.diagnostics;
      diagnosticConsumptionOutcome(execution.disposition, executionDiagnostics);
      const baselineResult = yield* Effect.sync(() =>
        applyBaseline(executionDiagnostics, baseline)
      );
      const locked = yield* Effect.sync(() => isBaselineLocked(baseline));
      baselineApplicationOutcome(rule.id, baselineResult, locked, executionDiagnostics);
      const diagnostics = [
        ...executionDiagnostics,
        ...(yield* Effect.all(
          baselineResult.refusals.map((failure) =>
            Effect.sync(() => baselineFailureDiagnostic(rule.id, failure))
          )
        )),
      ];
      const report = ruleReportFromDiagnostics({
        ruleId: rule.id,
        reportFacts,
        locked,
        durationMs: execution.durationMs,
        timing: execution.timing,
        diagnostics,
        disposition: execution.disposition,
      });
      structuralRuleOutcome(report, execution.disposition);
      reports.push(report);
    }

    if (options.baselineIntegrity)
      reports.push(yield* baselineIntegrityReportEffect(options.base ?? "main", context));
    return yield* constructCheckReportEffect({ command: request.command.serialized, reports });
  });
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
  baselineResult: BaselineApplicationResult,
  locked: boolean,
  diagnostics: RuleReport["diagnostics"]
) {
  return Value.Parse(
    BaselineApplicationOutcomeSchema,
    baselineResult.refusals.length > 0
      ? {
          kind: "baseline-refused",
          diagnostic: {
            ruleId,
            path: ".",
            message: baselineResult.refusals[0]?.message ?? "Baseline application refused.",
            severity: "error",
            baselined: false,
          },
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
  timing?: RuleReport["timing"];
  diagnostics: RuleReport["diagnostics"];
  disposition: RuleExecutionDisposition;
}): RuleReport {
  const disposition = ruleReportDisposition(input.disposition);
  const status = deriveRuleReportStatus({
    lane: input.reportFacts.lane,
    disposition,
    diagnostics: input.diagnostics,
  });
  return {
    ruleId: input.ruleId,
    runner: input.reportFacts.runner.name,
    lane: input.reportFacts.lane,
    status,
    locked: input.locked,
    durationMs: input.durationMs,
    timing: input.timing,
    disposition,
    diagnostics: input.diagnostics,
    message: input.reportFacts.message,
    remediate: input.reportFacts.remediate,
  };
}

function baselineIntegrityReportEffect(
  base: string,
  context: StructuralExecutionContext
): Effect.Effect<RuleReport, never, any> {
  return Effect.gen(function* () {
    const integrityStarted = yield* Clock.currentTimeMillis;
    const integrity = yield* checkBaselineIntegrityEffect(base, {
      ...baselineContext(context),
      registry: baselineContractInputs(context.rules),
    });
    const integrityFindings = yield* baselineIntegrityFindingsEffect(integrity);
    const disposition: RuleReportDisposition = {
      kind: "baseline-integrity",
      state: integrity.status === "refused" ? "refused" : "passed",
    };
    const diagnostics = integrityFindings.map((finding) => ({
      ruleId: "baseline-integrity",
      path: finding.file,
      message: finding.reason,
      severity: "error" as const,
      baselined: false,
    }));
    return {
      ruleId: "baseline-integrity",
      runner: "habitat",
      lane: "enforced",
      status: deriveRuleReportStatus({ lane: "enforced", disposition, diagnostics }),
      locked: true,
      durationMs: Math.max(0, (yield* Clock.currentTimeMillis) - integrityStarted),
      disposition,
      diagnostics,
      message:
        "Baselines are shrink-only; additions are valid only in the change that introduces the rule itself.",
      remediate: null,
    };
  });
}

function ruleReportDisposition(disposition: RuleExecutionDisposition): RuleReportDisposition {
  return Match.value(disposition).pipe(
    Match.when({ kind: "executed" }, () => ({ kind: "executed" as const })),
    Match.when({ kind: "not-applicable" }, ({ reason }) => ({
      kind: "not-applicable" as const,
      reason,
    })),
    Match.when({ kind: "dependency-refused" }, ({ source, decision, detail }) => ({
      kind: "dependency-refused" as const,
      source,
      decision,
      detail,
    })),
    Match.when({ kind: "execution-failed" }, ({ source, failure, detail }) => ({
      kind: "execution-failed" as const,
      source,
      failure,
      detail,
    })),
    Match.exhaustive
  );
}

function baselineContext(context: StructuralExecutionContext): BaselineAuthorityContext {
  return {
    fileSystem: context.baselineFileSystem,
    git: context.git,
    repoRoot: context.repoRoot,
  };
}

function factsByRuleId<T extends { id: string }>(facts: readonly T[]): Map<string, T> {
  return new Map(facts.map((fact) => [fact.id, fact]));
}
