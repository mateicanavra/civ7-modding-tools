import type { FileSystem } from "@effect/platform";
import {
  applyBaseline,
  type BaselineApplicationResult,
  type BaselineAuthorityContext,
  type BaselineRuleContractInput,
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
import type { RuleReportFacts, RuleSelectorFacts } from "@habitat/cli/service/model/rules/index";
import { factsForRuleIds } from "@habitat/cli/service/model/rules/policy/catalog.policy";
import { selectRules } from "@habitat/cli/service/model/rules/policy/selection.policy";
import { Clock, Effect, Match, Option } from "effect";
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

export const createCheckReportEffect = Effect.fn("habitat.check.createReport")(function* (
  options: CheckOptions = {},
  context: StructuralExecutionContext
): Effect.fn.Return<CheckReport, never, FileSystem.FileSystem> {
  const request = structuralCheckRequest(options);
  const selection = selectRules(request.selectors, context.rules.selector);
  return yield* Match.value(selection).pipe(
    Match.when({ ok: false }, (refusal) => selectorRefusalReportEffect(refusal, request)),
    Match.when({ ok: true }, ({ rules }) =>
      createSelectedCheckReportEffect(rules, request, options, context)
    ),
    Match.exhaustive
  );
});

const createSelectedCheckReportEffect = Effect.fn("habitat.check.createSelectedReport")(function* (
  selectionRules: readonly RuleSelectorFacts[],
  request: ReturnType<typeof structuralCheckRequest>,
  options: CheckOptions,
  context: StructuralExecutionContext
): Effect.fn.Return<CheckReport, never, FileSystem.FileSystem> {
  Value.Parse(RuleSelectionOutcomeSchema, {
    kind: "selected",
    selector: request.selectors,
    selectedRuleIds: selectionRules.map((rule) => rule.id),
  });
  const selectedRules = rulesForExecution(selectionRules, {
    selection: request.selectors,
    hookCheck: options.hookCheck,
    hookCheckFacts: context.rules.hookCheck,
    staged: options.staged,
    stagedPaths: options.stagedPaths,
  });
  const selectedRuleIds = selectedRules.map((rule) => rule.id);
  const reportsByRuleId = factsByRuleId(factsForRuleIds(context.rules.report, selectedRuleIds));
  const baselineInputsByRuleId = factsByRuleId(
    baselineContractInputs(context.rules, selectedRuleIds)
  );
  const ruleResults = yield* executeSelectedRulesEffect(selectedRules, options, context);
  const reports = yield* Effect.forEach(selectedRules, (rule) =>
    createRuleReportEffect(
      rule,
      requireMapValue(reportsByRuleId, rule.id, "report facts"),
      requireMapValue(baselineInputsByRuleId, rule.id, "baseline facts"),
      requireMapValue(ruleResults, rule.id, "rule result"),
      context
    )
  );
  const integrityReports = yield* Effect.if(options.baselineIntegrity === true, {
    onTrue: () =>
      baselineIntegrityReportEffect(options.base ?? "main", context).pipe(Effect.map(Array.of)),
    onFalse: () => Effect.succeed([]),
  });
  return yield* constructCheckReportEffect({
    command: request.command.serialized,
    reports: [...reports, ...integrityReports],
  });
});

const createRuleReportEffect = Effect.fn("habitat.check.createRuleReport")(function* (
  rule: RuleSelectorFacts,
  reportFacts: RuleReportFacts,
  baselineFacts: BaselineRuleContractInput,
  execution: RuleExecutionRecord,
  context: StructuralExecutionContext
): Effect.fn.Return<RuleReport, never, FileSystem.FileSystem> {
  const baseline = yield* loadBaselineStateEffect(baselineFacts, baselineContext(context));
  Value.Parse(RuleExecutionPlanSchema, {
    ruleId: rule.id,
    runner: rule.runner.name,
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
    timing: execution.timing,
    diagnostics,
    disposition: execution.disposition,
  });
  structuralRuleOutcome(report, execution.disposition);
  return report;
});

function diagnosticConsumptionOutcome(
  disposition: RuleExecutionDisposition,
  diagnostics: RuleReport["diagnostics"]
) {
  const outcome = Match.value(disposition).pipe(
    Match.when({ kind: "dependency-refused" }, () => ({
      kind: "diagnostic-refused" as const,
      diagnostic: diagnostics[0],
    })),
    Match.when({ kind: "execution-failed" }, () => ({
      kind: "diagnostic-refused" as const,
      diagnostic: diagnostics[0],
    })),
    Match.orElse(() => diagnosticFindingsOutcome(diagnostics))
  );
  return Value.Parse(DiagnosticConsumptionOutcomeSchema, outcome);
}

function diagnosticFindingsOutcome(diagnostics: RuleReport["diagnostics"]) {
  return Match.value(diagnostics.length === 0).pipe(
    Match.when(true, () => ({ kind: "clean" as const, diagnostics: [] })),
    Match.when(false, () => ({ kind: "findings" as const, diagnostics })),
    Match.exhaustive
  );
}

function baselineApplicationOutcome(
  ruleId: string,
  baselineResult: BaselineApplicationResult,
  locked: boolean,
  diagnostics: RuleReport["diagnostics"]
) {
  const outcome = Match.value(baselineResult.refusals.length > 0).pipe(
    Match.when(true, () => ({
      kind: "baseline-refused" as const,
      diagnostic: {
        ruleId,
        path: ".",
        message: baselineResult.refusals[0]?.message ?? "Baseline application refused.",
        severity: "error" as const,
        baselined: false,
      },
    })),
    Match.when(false, () => ({
      kind: "baseline-applied" as const,
      locked,
      diagnostics,
    })),
    Match.exhaustive
  );
  return Value.Parse(BaselineApplicationOutcomeSchema, outcome);
}

function structuralRuleOutcome(report: RuleReport, disposition: RuleExecutionDisposition) {
  const outcome = Match.value(disposition).pipe(
    Match.when({ kind: "not-applicable" }, () => ({
      kind: "rule-not-applicable" as const,
      lane: report.lane,
      report,
    })),
    Match.when({ kind: "dependency-refused" }, () => ({
      kind: "rule-refused" as const,
      lane: report.lane,
      report,
    })),
    Match.when({ kind: "execution-failed" }, () => ({
      kind: "rule-refused" as const,
      lane: report.lane,
      report,
    })),
    Match.orElse(() => structuralExecutedRuleOutcome(report))
  );
  return Value.Parse(StructuralRuleOutcomeSchema, outcome);
}

function structuralExecutedRuleOutcome(report: RuleReport) {
  return Match.value(report.status).pipe(
    Match.when("advisory-findings", () => ({
      kind: "rule-advisory-findings" as const,
      lane: "advisory" as const,
      report,
    })),
    Match.when("fail", () => ({ kind: "rule-failed" as const, lane: report.lane, report })),
    Match.orElse(() => ({ kind: "rule-passed" as const, lane: report.lane, report }))
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

const baselineIntegrityReportEffect = Effect.fn("habitat.check.baselineIntegrityReport")(function* (
  base: string,
  context: StructuralExecutionContext
): Effect.fn.Return<RuleReport, never, FileSystem.FileSystem> {
  const integrityStarted = yield* Clock.currentTimeMillis;
  const authorityContext = baselineContext(context);
  const integrity = yield* checkBaselineIntegrityEffect(base, {
    fileSystem: authorityContext.fileSystem,
    git: authorityContext.git,
    repoRoot: authorityContext.repoRoot,
    registry: baselineContractInputs(context.rules),
  });
  const integrityFindings = yield* baselineIntegrityFindingsEffect(integrity);
  const integrityState = Match.value(integrity.status).pipe(
    Match.when("refused", () => "refused" as const),
    Match.orElse(() => "passed" as const)
  );
  const disposition: RuleReportDisposition = {
    kind: "baseline-integrity",
    state: integrityState,
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
    lane: "enforced" as const,
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

function ruleReportDisposition(disposition: RuleExecutionDisposition): RuleReportDisposition {
  return Match.value(disposition).pipe(
    Match.when({ kind: "executed" }, () => ({ kind: "executed" as const })),
    Match.when({ kind: "not-applicable" }, ({ reason }) => ({
      kind: "not-applicable" as const,
      reason,
    })),
    Match.when(
      { kind: "dependency-refused", source: "diagnostic-scan-root" },
      ({ source, decision, detail }) => ({
        kind: "dependency-refused" as const,
        source,
        decision,
        detail,
      })
    ),
    Match.when(
      { kind: "execution-failed", source: "diagnostic-provider" },
      ({ source, failure, detail }) => ({
        kind: "execution-failed" as const,
        source,
        failure,
        detail,
      })
    ),
    Match.when(
      { kind: "execution-failed", source: "git-provider" },
      ({ source, failure, detail }) => ({
        kind: "execution-failed" as const,
        source,
        failure,
        detail,
      })
    ),
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

function requireMapValue<T extends object>(
  map: ReadonlyMap<string, T>,
  ruleId: string,
  factKind: string
): T {
  return Option.fromNullable(map.get(ruleId)).pipe(
    Option.getOrThrowWith(
      () => new Error(`habitat internal error: missing ${factKind} for ${ruleId}`)
    )
  );
}
