import { diagnosticProviderFailureDiagnostic } from "@habitat/cli/service/model/diagnostics/index";
import {
  type RuleDiagnosticFacts,
  type RuleFactsCatalog,
  type RuleGritFacts,
} from "@habitat/cli/service/model/rules/index";
import { Effect, Match, Option } from "effect";
import {
  type RuleDiagnosticDemand,
  type RuleDiagnosticExecutionResult,
  type RuleDiagnosticsService,
} from "../../resource.js";

export function makeRuleDiagnosticsService(
  repoRoot: string,
  facts: RuleFactsCatalog,
  runGritRules: (
    selectedRules: readonly RuleGritFacts[],
    options: { readonly repoRoot: string; readonly scanRoots?: readonly string[] }
  ) => ReturnType<RuleDiagnosticsService["runRules"]>
): RuleDiagnosticsService {
  const diagnosticFactsById = new Map(facts.diagnostic.map((fact) => [fact.id, fact]));
  const gritFactsById = new Map(facts.grit.map((fact) => [fact.id, fact]));
  return {
    runRules: (demand) => {
      const { ruleIds: demandedRuleIds, scope: demandedScope } = demand;
      const [firstRuleId, ...remainingRuleIds] = demandedRuleIds;
      const ruleIds: RuleDiagnosticDemand["ruleIds"] = [
        firstRuleId,
        ...new Set(remainingRuleIds.filter((id) => id !== firstRuleId)),
      ];
      const scope: RuleDiagnosticDemand["scope"] = Match.value(demandedScope).pipe(
        Match.when({ kind: "authored" }, () => ({ kind: "authored" as const })),
        Match.when({ kind: "paths" }, ({ paths }) => ({
          kind: "paths" as const,
          paths: [...paths],
        })),
        Match.exhaustive
      );
      const selected = ruleIds.flatMap((id) =>
        Option.toArray(Option.fromNullable(gritFactsById.get(id)))
      );
      const runOptions = Match.value(scope).pipe(
        Match.when({ kind: "authored" }, () => ({ repoRoot })),
        Match.when({ kind: "paths" }, ({ paths }) => ({ repoRoot, scanRoots: paths })),
        Match.exhaustive
      );
      const providerResults = Match.value(selected.length).pipe(
        Match.when(0, () => Effect.succeed(new Map<string, RuleDiagnosticExecutionResult>())),
        Match.orElse(() => runGritRules(selected, runOptions))
      );
      return providerResults.pipe(
        Effect.map(
          (results) =>
            new Map(
              ruleIds.map((id): readonly [string, RuleDiagnosticExecutionResult] => [
                id,
                Option.getOrElse(
                  Option.flatMap(Option.fromNullable(gritFactsById.get(id)), () =>
                    Option.fromNullable(results.get(id))
                  ),
                  () => missingRuleDiagnosticExecution(id, diagnosticFactsById, gritFactsById)
                ),
              ])
            )
        )
      );
    },
  };
}

function missingRuleDiagnosticExecution(
  id: string,
  diagnosticFactsById: ReadonlyMap<string, RuleDiagnosticFacts>,
  gritFactsById: ReadonlyMap<string, RuleGritFacts>
): RuleDiagnosticExecutionResult {
  const detail = Match.value(gritFactsById.has(id)).pipe(
    Match.when(false, () => `Diagnostic rule '${id}' has no provider binding.`),
    Match.orElse(() => `Diagnostic provider returned no result for rule '${id}'.`)
  );
  const rule = Option.getOrElse(Option.fromNullable(diagnosticFactsById.get(id)), () => ({
    id,
    lane: "enforced" as const,
    message: `Diagnostic rule '${id}' could not run.`,
  }));
  return {
    kind: "failed",
    failure: "DiagnosticProviderContractViolation",
    detail,
    diagnostics: [
      diagnosticProviderFailureDiagnostic(rule, "DiagnosticProviderContractViolation", detail),
    ],
    durationMs: 0,
  };
}
