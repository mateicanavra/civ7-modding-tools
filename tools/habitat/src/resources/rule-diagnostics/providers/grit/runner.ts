import path from "node:path";
import type {
  RuleDiagnosticExecutionResult,
  RuleDiagnosticExecutionTiming,
} from "@habitat/cli/resources/rule-diagnostics/resource";
import {
  diagnosticProviderFailureDiagnostic,
  renderDiagnosticScanRootRefusal,
} from "@habitat/cli/service/model/diagnostics/index";
import type { RuleGritFacts } from "@habitat/cli/service/model/rules/index";
import { Clock, Effect, Match, Option } from "effect";
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
import { type PlannedGritRule, planGritRuleRoots, sortedUnique } from "./scan-roots/index.js";

interface GritRunOptions {
  readonly repoRoot: string;
  readonly grit: GritCommandService;
  readonly scanRoots?: readonly string[];
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
  readonly rule: RuleGritFacts & { readonly diagnosticAcquisition: { readonly kind: "check" } };
};

type GritExecutionUnit =
  | { readonly kind: "check-group"; readonly plans: readonly [CheckGritPlan, ...CheckGritPlan[]] }
  | { readonly kind: "single"; readonly plan: PlannedGritRule };

const runGritDiagnosticExecutionsEffect = Effect.fn("grit.diagnosticExecutions.run")(function* (
  selectedRules: readonly RuleGritFacts[],
  options: GritRunOptions
) {
  const plans = yield* planGritRuleRoots(selectedRules, {
    repoRoot: options.repoRoot,
    scanRoots: options.scanRoots,
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
  const batch = yield* runGritCheckAcquisitionsEffect(
    checkGroupRules(plans),
    plans[0].roots,
    canonicalOptions
  ).pipe(Effect.scoped);
  const durationMs = Math.max(0, (yield* Clock.currentTimeMillis) - started);
  const admittedPlans = plans.filter((plan) => batch.admittedRuleIds.has(plan.rule.id));
  const timing = sharedCheckTiming(admittedPlans, durationMs);
  const observedRules = plans.flatMap((plan) =>
    observedCheckRuleEntry(plan, batch.acquisitions.get(plan.rule.id))
  );
  const projected = Option.match(Option.fromNullable(observedRules[0]), {
    onNone: () => new Map<string, DiagnosticRunOutcome>(),
    onSome: (firstObservation) =>
      gritDiagnosticOutcomesFromReport(
        observedRules.map(({ rule }) => rule),
        firstObservation.report,
        { repoRoot: canonicalOptions.repoRoot }
      ),
  });
  return plans.map((plan) =>
    checkGroupExecution(
      plan,
      batch.acquisitions,
      projected,
      canonicalOptions.repoRoot,
      durationMs,
      timing,
      batch.admittedRuleIds.has(plan.rule.id)
    )
  );
});

function sharedCheckTiming(
  plans: readonly CheckGritPlan[],
  durationMs: number
): RuleDiagnosticExecutionTiming | undefined {
  return Match.value(plans.length).pipe(
    Match.when(1, () => undefined),
    Match.orElse(() => ({
      kind: "shared" as const,
      groupId: `rule-diagnostics:${plans.map(({ rule }) => rule.id).join(",")}`,
      durationMs,
      ruleCount: plans.length,
    }))
  );
}

function checkGroupExecution(
  plan: CheckGritPlan,
  acquisitions: ReadonlyMap<string, GritDiagnosticAcquisition>,
  projected: ReadonlyMap<string, DiagnosticRunOutcome>,
  repoRoot: string,
  durationMs: number,
  timing: RuleDiagnosticExecutionTiming | undefined,
  admitted: boolean
): GritDiagnosticExecution {
  const fallback = Option.match(Option.fromNullable(acquisitions.get(plan.rule.id)), {
    onNone: () => missingOutcome(plan.rule),
    onSome: (acquisition) => outcomeFromAcquisition(plan.rule, acquisition, repoRoot),
  });
  const outcome = Option.getOrElse(
    Option.fromNullable(projected.get(plan.rule.id)),
    () => fallback
  );
  const measurement = Match.value(admitted).pipe(
    Match.when(true, () => ({ durationMs, ...optionalTiming(timing) })),
    Match.orElse(() => ({ durationMs: 0 }))
  );
  return { outcome, ...measurement };
}

function optionalTiming(timing: RuleDiagnosticExecutionTiming | undefined) {
  return Match.value(timing).pipe(
    Match.when(undefined, () => ({})),
    Match.orElse((shared) => ({ timing: shared }))
  );
}

function observedCheckRuleEntry(
  plan: CheckGritPlan,
  acquisition: GritDiagnosticAcquisition | undefined
) {
  return Match.value(acquisition).pipe(
    Match.when({ kind: "observed-complete", observation: { kind: "check" } }, ({ observation }) => [
      { rule: plan.rule, report: observation.report },
    ]),
    Match.orElse(() => [])
  );
}

function checkGroupRules(
  plans: readonly [CheckGritPlan, ...CheckGritPlan[]]
): readonly [RuleGritFacts, ...RuleGritFacts[]] {
  const [first, ...rest] = plans;
  return [first.rule, ...rest.map(({ rule }) => rule)];
}

function executionUnits(plans: readonly PlannedGritRule[]): readonly GritExecutionUnit[] {
  const checkPlans = plans.filter(isCheckPlan);
  const patternCounts = new Map<string, number>();
  for (const plan of checkPlans) {
    const key = plan.rule.patternName;
    patternCounts.set(key, (patternCounts.get(key) ?? 0) + 1);
  }
  const groups = new Map<string, CheckGritPlan[]>();
  for (const plan of checkPlans) {
    if ((patternCounts.get(plan.rule.patternName) ?? 0) > 1) continue;
    const key = rootsKey(plan.roots);
    groups.set(key, [...(groups.get(key) ?? []), plan]);
  }
  const emittedGroups = new Set<string>();
  return plans.flatMap((plan) => planExecutionUnits(plan, patternCounts, groups, emittedGroups));
}

function planExecutionUnits(
  plan: PlannedGritRule,
  patternCounts: ReadonlyMap<string, number>,
  groups: ReadonlyMap<string, readonly CheckGritPlan[]>,
  emittedGroups: Set<string>
): readonly GritExecutionUnit[] {
  return Option.match(Option.liftPredicate(plan, isCheckPlan), {
    onNone: () => singleExecutionUnit(plan),
    onSome: (checkPlan) => checkPlanExecutionUnits(checkPlan, patternCounts, groups, emittedGroups),
  });
}

function checkPlanExecutionUnits(
  plan: CheckGritPlan,
  patternCounts: ReadonlyMap<string, number>,
  groups: ReadonlyMap<string, readonly CheckGritPlan[]>,
  emittedGroups: Set<string>
): readonly GritExecutionUnit[] {
  const duplicatedPattern = (patternCounts.get(plan.rule.patternName) ?? 0) > 1;
  return Match.value(duplicatedPattern).pipe(
    Match.when(true, () => singleExecutionUnit(plan)),
    Match.orElse(() => groupedCheckExecutionUnits(plan, groups, emittedGroups))
  );
}

function groupedCheckExecutionUnits(
  plan: CheckGritPlan,
  groups: ReadonlyMap<string, readonly CheckGritPlan[]>,
  emittedGroups: Set<string>
): readonly GritExecutionUnit[] {
  const key = rootsKey(plan.roots);
  return Match.value(emittedGroups.has(key)).pipe(
    Match.when(true, () => []),
    Match.orElse(() => emitCheckGroupExecutionUnit(key, plan, groups, emittedGroups))
  );
}

function emitCheckGroupExecutionUnit(
  key: string,
  plan: CheckGritPlan,
  groups: ReadonlyMap<string, readonly CheckGritPlan[]>,
  emittedGroups: Set<string>
): readonly GritExecutionUnit[] {
  emittedGroups.add(key);
  const [first, ...rest] = groups.get(key) ?? [];
  return Option.match(Option.fromNullable(first), {
    onNone: () => singleExecutionUnit(plan),
    onSome: (head) => [{ kind: "check-group", plans: [head, ...rest] }],
  });
}

function singleExecutionUnit(plan: PlannedGritRule): readonly GritExecutionUnit[] {
  return [{ kind: "single", plan }];
}

function isCheckPlan(plan: PlannedGritRule): plan is CheckGritPlan {
  return plan.kind === "execute" && plan.rule.diagnosticAcquisition.kind === "check";
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
        kind: "scan-root-refused",
        ruleId: refused.rule.id,
        decision: refused.decision,
        detail: renderDiagnosticScanRootRefusal(refused.decision),
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
  return yield* Match.value(plan.rule.diagnosticAcquisition).pipe(
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
    Match.when({ kind: "scan-root-refused" }, ({ decision, detail }) => ({
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
