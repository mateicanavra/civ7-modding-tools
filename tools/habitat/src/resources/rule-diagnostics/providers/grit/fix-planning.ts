import type {
  RuleDiagnosticExecutionResult,
  RuleDiagnosticsService,
} from "@habitat/cli/resources/rule-diagnostics/index";
import type {
  RuleFixPlanningResult,
  RuleFixPlanningRuleResult,
  RuleFixPlanningService,
} from "@habitat/cli/resources/rule-fix-planning/index";
import type {
  RuleFactsCatalog,
  RuleFixFacts,
  RuleGritFacts,
} from "@habitat/cli/service/model/rules/index";
import { Effect, Match, Option } from "effect";

type RunGritRules = (
  selectedRules: readonly RuleGritFacts[]
) => ReturnType<RuleDiagnosticsService["runRules"]>;

export function makeGritRuleFixPlanningService(
  facts: RuleFactsCatalog,
  runGritRules: RunGritRules
): RuleFixPlanningService {
  const registeredRuleIds = new Set(facts.selector.map(({ id }) => id));
  const admittedById = new Map(facts.fix.map((fact) => [fact.id, fact]));

  return {
    plan: (demand) =>
      Match.value(selectRules(demand.ruleIds, facts.fix, registeredRuleIds, admittedById)).pipe(
        Match.when({ kind: "selection-refused" }, (refusal) => Effect.succeed(refusal)),
        Match.when({ kind: "selected" }, ({ rules }) => planRules(rules, runGritRules)),
        Match.exhaustive
      ),
  };
}

function planRules(rules: readonly RuleFixFacts[], runGritRules: RunGritRules) {
  return Effect.forEach(rules, (rule) => planRule(rule, runGritRules), {
    concurrency: 1,
  }).pipe(Effect.map((results) => ({ kind: "completed" as const, results })));
}

type RuleFixSelection =
  | Extract<RuleFixPlanningResult, { kind: "selection-refused" }>
  | { readonly kind: "selected"; readonly rules: readonly RuleFixFacts[] };

function selectRules(
  demandedRuleIds: readonly [string, ...string[]] | undefined,
  defaultRules: readonly RuleFixFacts[],
  registeredRuleIds: ReadonlySet<string>,
  admittedById: ReadonlyMap<string, RuleFixFacts>
): RuleFixSelection {
  return Option.match(Option.fromNullable(demandedRuleIds), {
    onNone: () => ({ kind: "selected", rules: [...defaultRules] }),
    onSome: (ids) => selectExplicitRules(unique(ids), registeredRuleIds, admittedById),
  });
}

function selectExplicitRules(
  ruleIds: readonly string[],
  registeredRuleIds: ReadonlySet<string>,
  admittedById: ReadonlyMap<string, RuleFixFacts>
): RuleFixSelection {
  const unknownRuleIds = ruleIds.filter((id) => !registeredRuleIds.has(id));
  const unadmittedRuleIds = ruleIds.filter(
    (id) => registeredRuleIds.has(id) && !admittedById.has(id)
  );
  return Match.value(unknownRuleIds.length + unadmittedRuleIds.length).pipe(
    Match.when(0, () => ({
      kind: "selected" as const,
      rules: ruleIds.flatMap((id) => Option.toArray(Option.fromNullable(admittedById.get(id)))),
    })),
    Match.orElse(() => ({
      kind: "selection-refused" as const,
      unknownRuleIds,
      unadmittedRuleIds,
    }))
  );
}

function planRule(rule: RuleFixFacts, runGritRules: RunGritRules) {
  return runGritRules([gritFactsForFix(rule)]).pipe(
    Effect.map((results) =>
      Option.match(Option.fromNullable(results.get(rule.id)), {
        onNone: () => missingProviderResult(rule.id),
        onSome: (result) => executionResult(rule.id, result),
      })
    )
  );
}

function gritFactsForFix(rule: RuleFixFacts): RuleGritFacts {
  return {
    id: rule.id,
    lane: rule.lane,
    message: rule.message,
    pathCoverage: rule.pathCoverage.map(clonePathCoverage),
    scanRoots: [...rule.scanRoots],
    runner: {
      name: "grit",
      files: { pattern: rule.fix.pattern },
      patternName: rule.patternName,
    },
    patternName: rule.patternName,
    diagnosticAcquisition: { kind: "apply-dry-run" },
  };
}

function clonePathCoverage(coverage: RuleFixFacts["pathCoverage"][number]) {
  return Match.value(coverage).pipe(
    Match.when({ kind: "exact-path" }, ({ kind, patterns }) => ({
      kind,
      patterns: [...patterns],
    })),
    Match.orElse((other) => ({ ...other }))
  );
}

function executionResult(
  ruleId: string,
  result: RuleDiagnosticExecutionResult
): RuleFixPlanningRuleResult {
  return Match.value(result).pipe(
    Match.when({ kind: "executed" }, ({ result: observed }) => ({
      kind: "observed" as const,
      ruleId,
      affectedPaths: [...new Set(observed.diagnostics.map(({ path }) => path))].sort(),
    })),
    Match.when({ kind: "not-applicable" }, ({ reason }) => ({
      kind: "not-applicable" as const,
      ruleId,
      reason,
    })),
    Match.when({ kind: "failed" }, ({ failure, detail }) => ({
      kind: "provider-failed" as const,
      ruleId,
      failure,
      detail,
    })),
    Match.when({ kind: "refused" }, ({ decision, detail }) => ({
      kind: "scope-refused" as const,
      ruleId,
      decision,
      detail,
    })),
    Match.exhaustive
  );
}

function missingProviderResult(ruleId: string): RuleFixPlanningRuleResult {
  return {
    kind: "provider-failed",
    ruleId,
    failure: "DiagnosticProviderContractViolation",
    detail: `Fix planning provider returned no result for rule '${ruleId}'.`,
  };
}

function unique(values: readonly string[]): string[] {
  return [...new Set(values)];
}
