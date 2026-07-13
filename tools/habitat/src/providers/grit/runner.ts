import path from "node:path";
import {
  type DiagnosticFinding,
  type DiagnosticRunOutcome,
  diagnosticCatalogEntryFromRuleSourceFacts,
  renderDiagnosticScanRootRefusal,
  renderUnexpectedObservedGritIdentity,
} from "@habitat/cli/service/model/diagnostics/index";
import type { RuleDiagnosticExecutionResult } from "@habitat/cli/service/model/diagnostics/policy/rule-runtime/architecture.policy";
import type { RuleSourceFacts } from "@habitat/cli/service/model/rules/index";
import { Clock, Effect, Match, Option } from "effect";
import { runGritApplyDryRunAcquisitionEffect } from "./apply-dry-run.js";
import { runGritCheckAcquisitionEffect } from "./check.js";
import {
  gritDiagnosticOutcomesFromReport,
  ruleRunResultFromDiagnosticOutcome,
} from "./diagnostics.js";
import { type GritDiagnosticAcquisition, preCommandFailure } from "./output.js";
import type { GritProviderService } from "./resource.js";
import { type PlannedGritRule, planGritRuleRoots, sortedUnique } from "./scan-roots/index.js";

interface GritRunOptions {
  readonly repoRoot: string;
  readonly grit: GritProviderService;
  readonly scanRoots?: readonly string[];
}

export const runGritRulesEffect = Effect.fn("grit.rules.run")(function* (
  selectedRules: readonly RuleSourceFacts[],
  options: GritRunOptions
) {
  const executions = yield* runGritDiagnosticExecutionsEffect(selectedRules, options);
  return new Map(selectedRules.map((rule) => gritRuleExecutionEntry(rule, executions)));
});

export const runGritDiagnosticOutcomesEffect = Effect.fn("grit.diagnosticOutcomes.run")(function* (
  selectedRules: readonly RuleSourceFacts[],
  options: GritRunOptions
) {
  const executions = yield* runGritDiagnosticExecutionsEffect(selectedRules, options);
  return new Map(
    [...executions].map(([ruleId, execution]) => [ruleId, execution.outcome] as const)
  );
});

interface GritDiagnosticExecution {
  readonly outcome: DiagnosticRunOutcome;
  readonly durationMs: number;
}

const runGritDiagnosticExecutionsEffect = Effect.fn("grit.diagnosticExecutions.run")(function* (
  selectedRules: readonly RuleSourceFacts[],
  options: GritRunOptions
) {
  const plans = yield* planGritRuleRoots(selectedRules, {
    repoRoot: options.repoRoot,
    scanRoots: options.scanRoots,
  });
  const executions = yield* Effect.forEach(plans, (plan) => executeTimedPlanEffect(plan, options), {
    concurrency: 2,
  });
  return new Map(executions.map((execution) => [execution.outcome.entry.ruleId, execution]));
});

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
        entry: diagnosticCatalogEntryFromRuleSourceFacts(notApplicable.rule),
        reason: notApplicable.reason,
      } as const)
    ),
    Match.when({ kind: "refused" }, (refused) =>
      Effect.succeed({
        kind: "scan-root-refused",
        entry: diagnosticCatalogEntryFromRuleSourceFacts(refused.rule),
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
  const acquisitions = yield* Effect.forEach(
    plan.roots,
    (root) => runGritApplyDryRunAcquisitionEffect(plan.rule, root, options).pipe(Effect.scoped),
    { concurrency: 1 }
  );
  return outcomeFromApplyAcquisitions(plan.rule, acquisitions, options.repoRoot);
});

function outcomeFromApplyAcquisitions(
  rule: RuleSourceFacts,
  acquisitions: readonly GritDiagnosticAcquisition[],
  repoRoot: string
): DiagnosticRunOutcome {
  const blocking = acquisitions.find((acquisition) => acquisition.kind !== "observed-complete");
  return Match.value(blocking).pipe(
    Match.when(undefined, () => completeApplyOutcome(rule, acquisitions, repoRoot)),
    Match.orElse((failed) => outcomeFromAcquisition(rule, failed, repoRoot))
  );
}

function completeApplyOutcome(
  rule: RuleSourceFacts,
  acquisitions: readonly GritDiagnosticAcquisition[],
  repoRoot: string
): DiagnosticRunOutcome {
  const observations = acquisitions.flatMap(applyObservationFromAcquisition);
  return Match.value(observations.length === acquisitions.length).pipe(
    Match.when(false, () =>
      providerFailure(
        rule,
        "GritProviderInternalContractViolation",
        "Apply dry-run acquisition returned a non-apply complete observation."
      )
    ),
    Match.orElse(() => completeApplyObservationsOutcome(rule, observations, repoRoot))
  );
}

function applyObservationFromAcquisition(
  acquisition: GritDiagnosticAcquisition
): readonly Extract<
  Extract<GritDiagnosticAcquisition, { kind: "observed-complete" }>["observation"],
  { kind: "apply-dry-run" }
>[] {
  return Match.value(acquisition).pipe(
    Match.when({ kind: "pre-command-failed" }, () => []),
    Match.when({ kind: "command-failed" }, () => []),
    Match.when({ kind: "evidence-mismatch" }, () => []),
    Match.when({ kind: "parse-failed" }, () => []),
    Match.when({ kind: "parsed-incomplete" }, () => []),
    Match.when({ kind: "observed-complete" }, ({ observation }) =>
      applyObservationFromCompleteObservation(observation)
    ),
    Match.exhaustive
  );
}

function applyObservationFromCompleteObservation(
  observation: Extract<GritDiagnosticAcquisition, { kind: "observed-complete" }>["observation"]
) {
  return Match.value(observation).pipe(
    Match.when({ kind: "check" }, () => []),
    Match.when({ kind: "apply-dry-run" }, (apply) => [apply]),
    Match.exhaustive
  );
}

function completeApplyObservationsOutcome(
  rule: RuleSourceFacts,
  observations: readonly Extract<
    Extract<GritDiagnosticAcquisition, { kind: "observed-complete" }>["observation"],
    { kind: "apply-dry-run" }
  >[],
  repoRoot: string
): DiagnosticRunOutcome {
  const paths = sortedUnique(
    observations.flatMap((observation) =>
      observation.findingPaths.map((findingPath) => path.relative(repoRoot, findingPath))
    )
  );
  const entry = diagnosticCatalogEntryFromRuleSourceFacts(rule);
  const diagnostics = paths.map((findingPath) => diagnosticFromApplyPath(rule, findingPath));
  const [first, ...rest] = diagnostics;
  return Match.value(Option.fromNullable(first)).pipe(
    Match.when(
      { _tag: "None" },
      (): DiagnosticRunOutcome => ({ kind: "clean", entry, diagnostics: [] })
    ),
    Match.orElse(({ value: finding }) => ({
      kind: "findings" as const,
      entry,
      diagnostics: [finding, ...rest],
    }))
  );
}

function outcomeFromAcquisition(
  rule: RuleSourceFacts,
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
  rule: RuleSourceFacts,
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
  rule: RuleSourceFacts,
  report: import("./types.js").GritReport,
  repoRoot: string
): DiagnosticRunOutcome {
  const outcomes = gritDiagnosticOutcomesFromReport([rule], report, { repoRoot });
  return outcomes.get(rule.id) ?? missingOutcome(rule);
}

function diagnosticFromApplyPath(rule: RuleSourceFacts, findingPath: string): DiagnosticFinding {
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
  rule: RuleSourceFacts,
  failure: Extract<DiagnosticRunOutcome, { kind: "provider-failed" }>["failure"],
  detail: string
): DiagnosticRunOutcome {
  return {
    kind: "provider-failed",
    entry: diagnosticCatalogEntryFromRuleSourceFacts(rule),
    failure,
    detail,
  };
}

function missingOutcome(rule: RuleSourceFacts): DiagnosticRunOutcome {
  return providerFailure(
    rule,
    "GritProviderInternalContractViolation",
    "Selected Grit rule received no terminal outcome."
  );
}

function dispositionFromOutcome(
  outcome: DiagnosticRunOutcome
): RuleDiagnosticExecutionResult["disposition"] {
  return Match.value(outcome).pipe(
    Match.when({ kind: "not-applicable" }, ({ reason }) => ({
      kind: "not-applicable" as const,
      reason,
    })),
    Match.when({ kind: "scan-root-refused" }, ({ decision, detail }) => ({
      kind: "refused" as const,
      decision,
      detail,
    })),
    Match.when({ kind: "provider-failed" }, ({ failure, detail }) => ({
      kind: "failed" as const,
      failure,
      detail,
    })),
    Match.when({ kind: "unexpected-diagnostic-identity" }, ({ unexpectedIdentity }) => ({
      kind: "failed" as const,
      failure: "GritUnexpectedDiagnosticIdentity" as const,
      detail: renderUnexpectedObservedGritIdentity(unexpectedIdentity),
    })),
    Match.when({ kind: "clean" }, () => ({ kind: "executed" as const })),
    Match.when({ kind: "findings" }, () => ({ kind: "executed" as const })),
    Match.exhaustive
  );
}

function gritRuleExecutionEntry(
  rule: RuleSourceFacts,
  executions: ReadonlyMap<string, GritDiagnosticExecution>
): readonly [string, RuleDiagnosticExecutionResult] {
  const execution = executions.get(rule.id) ?? {
    outcome: missingOutcome(rule),
    durationMs: 0,
  };
  return [
    rule.id,
    {
      result: ruleRunResultFromDiagnosticOutcome(rule, execution.outcome),
      durationMs: execution.durationMs,
      disposition: dispositionFromOutcome(execution.outcome),
    },
  ];
}
