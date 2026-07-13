import type { RuleDiagnosticExecutionResult } from "@habitat/cli/resources/rule-diagnostics/index";
import {
  type CheckOptions,
  dependencyRefusalDiagnostic,
} from "@habitat/cli/service/model/check/index";
import { diagnosticProviderFailureDiagnostic } from "@habitat/cli/service/model/diagnostics/index";
import type { RuleDiagnosticFacts } from "@habitat/cli/service/model/rules/index";
import { Effect, Match } from "effect";
import type { RuleExecutionRecord, StructuralExecutionContext } from "./context.policy.js";
import type { currentStagedPathsEffect } from "./file-layer-execution.policy.js";

export function executeDiagnosticRulesEffect(
  diagnosticRules: readonly RuleDiagnosticFacts[],
  results: Map<string, RuleExecutionRecord>,
  options: Pick<CheckOptions, "staged" | "stagedPaths">,
  context: StructuralExecutionContext,
  currentStagedPaths: () => ReturnType<typeof currentStagedPathsEffect>
) {
  const [firstRule, ...remainingRules] = diagnosticRules;
  if (!firstRule) return Effect.void;
  return Effect.gen(function* () {
    let scope: Parameters<StructuralExecutionContext["ruleDiagnostics"]["runRules"]>[0]["scope"];
    if (options.staged) {
      scope = {
        kind: "paths",
        paths: options.stagedPaths ?? (yield* currentStagedPaths()),
      };
    } else {
      scope = { kind: "authored" };
    }
    const diagnosticResults = yield* context.ruleDiagnostics.runRules({
      ruleIds: [firstRule.id, ...remainingRules.map((rule) => rule.id)],
      scope,
    });
    for (const rule of diagnosticRules) {
      const execution =
        diagnosticResults.get(rule.id) ?? missingRuleDiagnosticExecutionResult(rule);
      results.set(rule.id, ruleDiagnosticExecutionRecord(rule, execution));
    }
  });
}

export function ruleDiagnosticExecutionRecord(
  rule: RuleDiagnosticFacts,
  execution: RuleDiagnosticExecutionResult
): RuleExecutionRecord {
  return Match.value(execution).pipe(
    Match.when({ kind: "executed" }, ({ result, durationMs }) => ({
      result,
      durationMs,
      disposition: { kind: "executed" as const, durationMs },
    })),
    Match.when({ kind: "not-applicable" }, ({ reason, durationMs }) => ({
      result: { exitCode: 0, diagnostics: [] },
      durationMs,
      disposition: { kind: "not-applicable" as const, reason },
    })),
    Match.when({ kind: "failed" }, ({ failure, detail, diagnostics, durationMs }) => ({
      result: { exitCode: 1, diagnostics: [...diagnostics] },
      durationMs,
      disposition: {
        kind: "execution-failed" as const,
        source: "diagnostic-provider" as const,
        failure,
        detail,
      },
    })),
    Match.when({ kind: "refused" }, ({ decision, detail, durationMs }) => ({
      result: { exitCode: 1, diagnostics: [dependencyRefusalDiagnostic(rule, detail)] },
      durationMs,
      disposition: {
        kind: "dependency-refused" as const,
        source: "diagnostic-scan-root" as const,
        decision,
        detail,
      },
    })),
    Match.exhaustive
  );
}

function missingRuleDiagnosticExecutionResult(
  rule: RuleDiagnosticFacts
): RuleDiagnosticExecutionResult {
  const failure = "DiagnosticProviderContractViolation" as const;
  const detail = `RuleDiagnostics returned no result for demanded rule '${rule.id}'.`;
  return {
    kind: "failed",
    failure,
    detail,
    diagnostics: [diagnosticProviderFailureDiagnostic(rule, failure, detail)],
    durationMs: 0,
  };
}
