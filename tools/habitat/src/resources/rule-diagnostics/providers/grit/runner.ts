import { Buffer } from "node:buffer";
import path from "node:path";
import type {
  RuleDiagnosticExecutionResult,
  RuleDiagnosticExecutionTiming,
} from "@habitat/cli/resources/rule-diagnostics/resource";
import {
  diagnosticProviderFailureDiagnostic,
  renderDiagnosticAcquisitionRootRefusal,
} from "@habitat/cli/service/model/diagnostics/index";
import type { RuleGritFacts } from "@habitat/cli/service/model/rules/index";
import { Clock, Effect, Match, Option } from "effect";
import {
  type PlannedGritRule,
  planGritRuleAcquisitions,
  sortedUnique,
} from "./acquisition-roots/index.js";
import { runGritApplyDryRunAcquisitionEffect } from "./apply-dry-run.js";
import { runGritCheckAcquisitionEffect, runGritCheckAcquisitionsEffect } from "./check.js";
import type { GritCommandService } from "./command.js";
import {
  gritDiagnosticOutcomesFromReport,
  ruleRunResultFromDiagnosticOutcome,
} from "./diagnostics.js";
import { renderUnexpectedObservedGritIdentity } from "./identity.js";
import type { DiagnosticFinding, DiagnosticRunOutcome } from "./outcome.js";
import {
  type GritApplyFindingEvidence,
  type GritDiagnosticAcquisition,
  preCommandFailure,
} from "./output.js";

interface GritRunOptions {
  readonly repoRoot: string;
  readonly grit: GritCommandService;
  readonly acquisitionRoots?: readonly string[];
}

export const runGritRulesEffect = Effect.fn("grit.rules.run")(function* (
  selectedRules: readonly RuleGritFacts[],
  options: GritRunOptions
) {
  const executions = yield* runGritDiagnosticExecutionsEffect(selectedRules, options);
  return new Map(selectedRules.map((rule) => gritRuleExecutionEntry(rule, executions)));
});

export const runGritDiagnosticOutcomesEffect = Effect.fn("grit.diagnosticOutcomes.run")(function* (
  selectedRules: readonly RuleGritFacts[],
  options: GritRunOptions
) {
  const executions = yield* runGritDiagnosticExecutionsEffect(selectedRules, options);
  return new Map(
    selectedRules.map((rule) => [rule.id, executions.get(rule.id)?.outcome ?? missingOutcome(rule)])
  );
});

interface GritDiagnosticExecution {
  readonly outcome: DiagnosticRunOutcome;
  readonly durationMs: number;
  readonly timing?: RuleDiagnosticExecutionTiming;
}

function selectedRuleExecutionEntry(
  rule: RuleGritFacts,
  executions: ReadonlyMap<string, GritDiagnosticExecution>
): readonly [string, GritDiagnosticExecution] {
  const execution = Option.getOrElse(Option.fromNullable(executions.get(rule.id)), () => ({
    outcome: missingOutcome(rule),
    durationMs: 0,
  }));
  return [rule.id, execution];
}

type ExecuteGritPlan = Extract<PlannedGritRule, { kind: "execute" }>;
type CheckGritPlan = ExecuteGritPlan & {
  readonly rule: RuleGritFacts & {
    readonly runner: RuleGritFacts["runner"] & {
      readonly acquisition: { readonly kind: "check"; readonly roots: readonly string[] };
    };
  };
};

type GritExecutionUnit =
  | { readonly kind: "check-group"; readonly plans: readonly [CheckGritPlan, ...CheckGritPlan[]] }
  | { readonly kind: "single"; readonly plan: PlannedGritRule };

interface ExactCheckGroup {
  readonly plans: CheckGritPlan[];
}

/** Caps pattern-by-root expansion while still amortizing native Grit startup. */
const maximumExactBatchWorkExpansion = 2;

const runGritDiagnosticExecutionsEffect = Effect.fn("grit.diagnosticExecutions.run")(function* (
  selectedRules: readonly RuleGritFacts[],
  options: GritRunOptions
) {
  const plans = yield* planGritRuleAcquisitions(selectedRules, {
    repoRoot: options.repoRoot,
    acquisitionRoots: options.acquisitionRoots,
  });
  const executions = yield* Effect.forEach(
    executionUnits(plans),
    (unit) => executeUnitEffect(unit, options),
    { concurrency: 1 }
  );
  const executionByRuleId = new Map(
    executions.flat().map((execution) => [execution.outcome.ruleId, execution])
  );
  return new Map(selectedRules.map((rule) => selectedRuleExecutionEntry(rule, executionByRuleId)));
});

const executeUnitEffect = Effect.fn("grit.executionUnit.execute")(function* (
  unit: GritExecutionUnit,
  options: GritRunOptions
) {
  return yield* Match.value(unit).pipe(
    Match.when({ kind: "check-group" }, ({ plans }) =>
      executeTimedCheckGroupEffect(plans, options)
    ),
    Match.when({ kind: "single" }, ({ plan }) => executeSingleUnitEffect(plan, options)),
    Match.exhaustive
  );
});

const executeSingleUnitEffect = Effect.fn("grit.singleExecutionUnit.execute")(function* (
  plan: PlannedGritRule,
  options: GritRunOptions
) {
  const execution = yield* executeTimedPlanEffect(plan, options);
  return [execution];
});

const executeTimedCheckGroupEffect = Effect.fn("grit.checkGroup.executeTimed")(function* (
  plans: readonly [CheckGritPlan, ...CheckGritPlan[]],
  options: GritRunOptions
) {
  const started = yield* Clock.currentTimeMillis;
  const canonicalOptions = { ...options, repoRoot: plans[0].repoRoot };
  const [firstPlan, ...remainingPlans] = plans;
  const batch = yield* runGritCheckAcquisitionsEffect(
    [
      { rule: firstPlan.rule, roots: firstPlan.roots },
      ...remainingPlans.map(({ rule, roots }) => ({ rule, roots })),
    ],
    canonicalOptions
  ).pipe(Effect.scoped);
  const durationMs = Math.max(0, (yield* Clock.currentTimeMillis) - started);
  const participants = plans.filter(({ rule }) => batch.participantRuleIds.has(rule.id));
  const timing = sharedCheckTiming(participants, durationMs);
  return plans.map((plan) =>
    checkGroupExecution(
      plan,
      batch.acquisitions,
      canonicalOptions.repoRoot,
      batch.participantRuleIds.has(plan.rule.id) ? durationMs : 0,
      batch.participantRuleIds.has(plan.rule.id) ? timing : undefined
    )
  );
});

function sharedCheckTiming(
  plans: readonly CheckGritPlan[],
  durationMs: number
): RuleDiagnosticExecutionTiming | undefined {
  if (plans.length <= 1) return undefined;
  return {
    kind: "shared",
    groupId: `rule-diagnostics:${plans.map(({ rule }) => rule.id).join(",")}`,
    durationMs,
    ruleCount: plans.length,
  };
}

function checkGroupExecution(
  plan: CheckGritPlan,
  acquisitions: ReadonlyMap<string, GritDiagnosticAcquisition>,
  repoRoot: string,
  durationMs: number,
  timing: RuleDiagnosticExecutionTiming | undefined
): GritDiagnosticExecution {
  const outcome = Option.match(Option.fromNullable(acquisitions.get(plan.rule.id)), {
    onNone: () => missingOutcome(plan.rule),
    onSome: (acquisition) => outcomeFromAcquisition(plan.rule, acquisition, repoRoot),
  });
  return { outcome, durationMs, ...optionalTiming(timing) };
}

function optionalTiming(timing: RuleDiagnosticExecutionTiming | undefined) {
  return Match.value(timing).pipe(
    Match.when(undefined, () => ({})),
    Match.orElse((shared) => ({ timing: shared }))
  );
}

function executionUnits(plans: readonly PlannedGritRule[]): readonly GritExecutionUnit[] {
  const occurrenceByPattern = new Map<string, number>();
  const exactGroupByPlan = new Map<CheckGritPlan, ExactCheckGroup>();
  const exactGroupsByOccurrence = new Map<number, ExactCheckGroup[]>();
  const otherCheckPlans = plans.filter(
    (plan): plan is CheckGritPlan => isCheckPlan(plan) && !hasExactPathCoverage(plan)
  );
  const otherPatternCounts = new Map<string, number>();
  const otherRootGroups = new Map<string, CheckGritPlan[]>();
  for (const plan of plans) {
    if (!isCheckPlan(plan) || !hasExactPathCoverage(plan)) continue;
    const occurrence = occurrenceByPattern.get(plan.rule.patternName) ?? 0;
    occurrenceByPattern.set(plan.rule.patternName, occurrence + 1);
    const groups = exactGroupsByOccurrence.get(occurrence) ?? [];
    const group = groups.find(({ plans: peers }) => canShareExactCheckGroup(peers, plan)) ?? {
      plans: [],
    };
    if (!groups.includes(group)) exactGroupsByOccurrence.set(occurrence, [...groups, group]);
    group.plans.push(plan);
    exactGroupByPlan.set(plan, group);
  }
  for (const plan of otherCheckPlans) {
    otherPatternCounts.set(
      plan.rule.patternName,
      (otherPatternCounts.get(plan.rule.patternName) ?? 0) + 1
    );
  }
  for (const plan of otherCheckPlans) {
    if ((otherPatternCounts.get(plan.rule.patternName) ?? 0) > 1) continue;
    const key = rootsKey(plan.roots);
    otherRootGroups.set(key, [...(otherRootGroups.get(key) ?? []), plan]);
  }

  const emittedExactGroups = new Set<ExactCheckGroup>();
  const emittedOtherGroups = new Set<string>();
  return plans.flatMap((plan) => {
    if (!isCheckPlan(plan)) return singleExecutionUnit(plan);
    if (hasExactPathCoverage(plan)) {
      const group = exactGroupByPlan.get(plan);
      if (group === undefined || emittedExactGroups.has(group)) return [];
      emittedExactGroups.add(group);
      return checkGroupUnit(group.plans, plan);
    }
    if ((otherPatternCounts.get(plan.rule.patternName) ?? 0) > 1) {
      return singleExecutionUnit(plan);
    }
    const key = rootsKey(plan.roots);
    if (emittedOtherGroups.has(key)) return [];
    emittedOtherGroups.add(key);
    return checkGroupUnit(otherRootGroups.get(key), plan);
  });
}

function canShareExactCheckGroup(
  current: readonly CheckGritPlan[],
  candidate: CheckGritPlan
): boolean {
  if (current.length === 0) return true;
  const plans = [...current, candidate];
  const union = uniquePlanRoots(plans);
  const independentWork = plans.reduce((total, plan) => total + plan.roots.length, 0);
  const batchedWork = plans.length * union.length;
  const largestExistingArgv = Math.max(...plans.map(({ roots }) => rootArgumentBytes(roots)));
  return (
    rootArgumentBytes(union) <= largestExistingArgv &&
    batchedWork <= independentWork * maximumExactBatchWorkExpansion
  );
}

function uniquePlanRoots(plans: readonly CheckGritPlan[]): readonly string[] {
  return [...new Set(plans.flatMap(({ roots }) => roots))];
}

function rootArgumentBytes(roots: readonly string[]): number {
  return roots.reduce((total, root) => total + Buffer.byteLength(root) + 1, 0);
}

function checkGroupUnit(
  plans: readonly CheckGritPlan[] | undefined,
  fallback: CheckGritPlan
): readonly GritExecutionUnit[] {
  const [first, ...rest] = plans ?? [];
  return first === undefined
    ? singleExecutionUnit(fallback)
    : [{ kind: "check-group", plans: [first, ...rest] }];
}

function singleExecutionUnit(plan: PlannedGritRule): readonly GritExecutionUnit[] {
  return [{ kind: "single", plan }];
}

function isCheckPlan(plan: PlannedGritRule): plan is CheckGritPlan {
  return plan.kind === "execute" && plan.rule.runner.acquisition.kind === "check";
}

function hasExactPathCoverage(plan: CheckGritPlan): boolean {
  return plan.rule.pathCoverage.every(({ kind }) => kind === "exact-path");
}

function rootsKey(roots: readonly string[]): string {
  return roots.join("\u0000");
}

const executeTimedPlanEffect = Effect.fn("grit.plan.executeTimed")(function* (
  plan: PlannedGritRule,
  options: GritRunOptions
) {
  return yield* Match.value(plan).pipe(
    Match.when({ kind: "execute" }, (execute) =>
      Effect.gen(function* () {
        const started = yield* Clock.currentTimeMillis;
        const outcome = yield* executePlanEffect(execute, {
          ...options,
          repoRoot: execute.repoRoot,
        });
        return {
          outcome,
          durationMs: Math.max(0, (yield* Clock.currentTimeMillis) - started),
        } satisfies GritDiagnosticExecution;
      })
    ),
    Match.when({ kind: "not-applicable" }, (notApplicable) =>
      executeUntimedPlanEffect(notApplicable, options)
    ),
    Match.when({ kind: "refused" }, (refused) => executeUntimedPlanEffect(refused, options)),
    Match.when({ kind: "failed" }, (failed) => executeUntimedPlanEffect(failed, options)),
    Match.exhaustive
  );
});

const executeUntimedPlanEffect = Effect.fn("grit.plan.executeUntimed")(function* (
  plan: Exclude<PlannedGritRule, { kind: "execute" }>,
  options: GritRunOptions
) {
  const outcome = yield* executePlanEffect(plan, options);
  return { outcome, durationMs: 0 } satisfies GritDiagnosticExecution;
});

const executePlanEffect = Effect.fn("grit.plan.execute")(function* (
  plan: PlannedGritRule,
  options: GritRunOptions
) {
  const execution = Match.value(plan).pipe(
    Match.when({ kind: "not-applicable" }, (notApplicable) =>
      Effect.succeed({
        kind: "not-applicable",
        ruleId: notApplicable.rule.id,
        reason: notApplicable.reason,
      } as const)
    ),
    Match.when({ kind: "refused" }, (refused) =>
      Effect.succeed({
        kind: "acquisition-root-refused",
        ruleId: refused.rule.id,
        decision: refused.decision,
        detail: renderDiagnosticAcquisitionRootRefusal(refused.decision),
      } as const)
    ),
    Match.when({ kind: "failed" }, (failed) =>
      Effect.succeed(
        outcomeFromAcquisition(
          failed.rule,
          preCommandFailure(failed.failure, failed.detail),
          options.repoRoot
        )
      )
    ),
    Match.when({ kind: "execute" }, (execute) => executeAcquisitionPolicyEffect(execute, options)),
    Match.exhaustive
  );
  return yield* execution;
});

const executeAcquisitionPolicyEffect = Effect.fn("grit.acquisitionPolicy.execute")(function* (
  plan: Extract<PlannedGritRule, { kind: "execute" }>,
  options: GritRunOptions
) {
  return yield* Match.value(plan.rule.runner.acquisition).pipe(
    Match.when({ kind: "check" }, () => executeCheckPolicyEffect(plan, options)),
    Match.when({ kind: "apply-dry-run" }, () => executeApplyPolicyEffect(plan, options)),
    Match.exhaustive
  );
});

const executeCheckPolicyEffect = Effect.fn("grit.checkPolicy.execute")(function* (
  plan: Extract<PlannedGritRule, { kind: "execute" }>,
  options: GritRunOptions
) {
  const acquisition = yield* runGritCheckAcquisitionEffect(plan.rule, plan.roots, options).pipe(
    Effect.scoped
  );
  return outcomeFromAcquisition(plan.rule, acquisition, options.repoRoot);
});

const executeApplyPolicyEffect = Effect.fn("grit.applyPolicy.execute")(function* (
  plan: Extract<PlannedGritRule, { kind: "execute" }>,
  options: GritRunOptions
) {
  const acquisition = yield* runGritApplyDryRunAcquisitionEffect(
    plan.rule,
    plan.roots,
    options
  ).pipe(Effect.scoped);
  return outcomeFromAcquisition(plan.rule, acquisition, options.repoRoot);
});

function completeApplyObservationsOutcome(
  rule: RuleGritFacts,
  observations: readonly Extract<
    Extract<GritDiagnosticAcquisition, { kind: "observed-complete" }>["observation"],
    { kind: "apply-dry-run" }
  >[],
  repoRoot: string
): DiagnosticRunOutcome {
  const paths = sortedUnique(
    observations.flatMap((observation) =>
      observation.findings
        .flatMap(applyFindingPaths)
        .map((findingPath) => path.relative(repoRoot, findingPath))
    )
  );
  const diagnostics = paths.map((findingPath) => diagnosticFromApplyPath(rule, findingPath));
  const [first, ...rest] = diagnostics;
  return Match.value(Option.fromNullable(first)).pipe(
    Match.when(
      { _tag: "None" },
      (): DiagnosticRunOutcome => ({ kind: "clean", ruleId: rule.id, diagnostics: [] })
    ),
    Match.orElse(
      ({ value: finding }): DiagnosticRunOutcome => ({
        kind: "findings" as const,
        ruleId: rule.id,
        diagnostics: [finding, ...rest],
      })
    )
  );
}

function applyFindingPaths(finding: GritApplyFindingEvidence): readonly string[] {
  return Match.value(finding).pipe(
    Match.when({ kind: "rewrite" }, ({ originalPath, rewrittenPath }) => [
      originalPath,
      rewrittenPath,
    ]),
    Match.when({ kind: "match" }, ({ path: findingPath }) => [findingPath]),
    Match.when({ kind: "create-file" }, ({ path: findingPath }) => [findingPath]),
    Match.when({ kind: "remove-file" }, ({ path: findingPath }) => [findingPath]),
    Match.exhaustive
  );
}

function outcomeFromAcquisition(
  rule: RuleGritFacts,
  acquisition: GritDiagnosticAcquisition,
  repoRoot: string
): DiagnosticRunOutcome {
  return Match.value(acquisition).pipe(
    Match.when({ kind: "pre-command-failed" }, ({ failure, detail }) =>
      providerFailure(rule, failure, detail)
    ),
    Match.when({ kind: "command-failed" }, ({ failure, detail }) =>
      providerFailure(rule, failure, detail)
    ),
    Match.when({ kind: "evidence-mismatch" }, ({ failure, detail }) =>
      providerFailure(rule, failure, detail)
    ),
    Match.when({ kind: "parse-failed" }, ({ failure, detail }) =>
      providerFailure(rule, failure, detail)
    ),
    Match.when({ kind: "parsed-incomplete" }, ({ failure, detail }) =>
      providerFailure(rule, failure, detail)
    ),
    Match.when({ kind: "observed-complete" }, ({ observation }) =>
      outcomeFromCompleteObservation(rule, observation, repoRoot)
    ),
    Match.exhaustive
  );
}

function outcomeFromCompleteObservation(
  rule: RuleGritFacts,
  observation: Extract<GritDiagnosticAcquisition, { kind: "observed-complete" }>["observation"],
  repoRoot: string
): DiagnosticRunOutcome {
  return Match.value(observation).pipe(
    Match.when({ kind: "check" }, ({ report }) => observedCheckOutcome(rule, report, repoRoot)),
    Match.when({ kind: "apply-dry-run" }, (apply) =>
      completeApplyObservationsOutcome(rule, [apply], repoRoot)
    ),
    Match.exhaustive
  );
}

function observedCheckOutcome(
  rule: RuleGritFacts,
  report: import("./types.js").GritReport,
  repoRoot: string
): DiagnosticRunOutcome {
  const outcomes = gritDiagnosticOutcomesFromReport([rule], report, { repoRoot });
  return outcomes.get(rule.id) ?? missingOutcome(rule);
}

function diagnosticFromApplyPath(rule: RuleGritFacts, findingPath: string): DiagnosticFinding {
  const severity = Match.value(rule.lane).pipe(
    Match.when("advisory", () => "advisory" as const),
    Match.orElse(() => "error" as const)
  );
  return {
    kind: "diagnostic-finding",
    ruleId: rule.id,
    path: findingPath.replace(/\\/g, "/"),
    message: rule.message,
    severity,
    baselineState: "unbaselined",
  };
}

function providerFailure(
  rule: RuleGritFacts,
  failure: Extract<DiagnosticRunOutcome, { kind: "provider-failed" }>["failure"],
  detail: string
): DiagnosticRunOutcome {
  return {
    kind: "provider-failed",
    ruleId: rule.id,
    failure,
    detail,
  };
}

function missingOutcome(rule: RuleGritFacts): DiagnosticRunOutcome {
  return providerFailure(
    rule,
    "DiagnosticProviderContractViolation",
    "Selected Grit rule received no terminal outcome."
  );
}

function gritRuleExecutionEntry(
  rule: RuleGritFacts,
  executions: ReadonlyMap<string, GritDiagnosticExecution>
): readonly [string, RuleDiagnosticExecutionResult] {
  const execution = executions.get(rule.id) ?? {
    outcome: missingOutcome(rule),
    durationMs: 0,
  };
  return [rule.id, ruleDiagnosticExecutionFromOutcome(rule, execution)];
}

function ruleDiagnosticExecutionFromOutcome(
  rule: RuleGritFacts,
  execution: GritDiagnosticExecution
): RuleDiagnosticExecutionResult {
  const { outcome } = execution;
  const measurement = diagnosticExecutionMeasurement(execution);
  return Match.value(outcome).pipe(
    Match.when({ kind: "not-applicable" }, ({ reason }) => ({
      kind: "not-applicable" as const,
      reason,
      ...measurement,
    })),
    Match.when({ kind: "acquisition-root-refused" }, ({ decision, detail }) => ({
      kind: "refused" as const,
      decision,
      detail,
      ...measurement,
    })),
    Match.when({ kind: "provider-failed" }, ({ failure, detail }) =>
      failedRuleDiagnosticExecution(rule, failure, detail, execution)
    ),
    Match.when({ kind: "unexpected-diagnostic-identity" }, ({ unexpectedIdentity }) =>
      failedRuleDiagnosticExecution(
        rule,
        "DiagnosticUnexpectedIdentity",
        renderUnexpectedObservedGritIdentity(unexpectedIdentity),
        execution
      )
    ),
    Match.when({ kind: "clean" }, () => ({
      kind: "executed" as const,
      result: ruleRunResultFromDiagnosticOutcome(rule, outcome),
      ...measurement,
    })),
    Match.when({ kind: "findings" }, () => ({
      kind: "executed" as const,
      result: ruleRunResultFromDiagnosticOutcome(rule, outcome),
      ...measurement,
    })),
    Match.exhaustive
  );
}

function diagnosticExecutionMeasurement(execution: GritDiagnosticExecution) {
  return {
    durationMs: execution.durationMs,
    ...optionalTiming(execution.timing),
  };
}

function failedRuleDiagnosticExecution(
  rule: RuleGritFacts,
  failure: Extract<RuleDiagnosticExecutionResult, { kind: "failed" }>["failure"],
  detail: string,
  execution: GritDiagnosticExecution
): Extract<RuleDiagnosticExecutionResult, { kind: "failed" }> {
  return {
    kind: "failed",
    failure,
    detail,
    diagnostics: [diagnosticProviderFailureDiagnostic(rule, failure, detail)],
    ...diagnosticExecutionMeasurement(execution),
  };
}
