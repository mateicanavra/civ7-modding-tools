import type { FileSystem } from "@effect/platform";
import type { CommandExecutor } from "@effect/platform/CommandExecutor";
import type { GitProviderRequirements } from "@internal/habitat-harness/providers/git/index";
import type {
  GritProvider,
  GritProviderRequirements,
} from "@internal/habitat-harness/providers/grit/index";
import { CommandRunner } from "@internal/habitat-harness/resources/command/index";
import type { HabitatConfig } from "@internal/habitat-harness/resources/config/index";
import { renderHabitatError } from "@internal/habitat-harness/resources/errors/index";
import {
  applyBaseline,
  type BaselineAuthorityContext,
  guardBaselineExpansionEffect,
  loadBaselineStateEffect,
  violationKey,
  writeBaselineEffect,
} from "@internal/habitat-harness/service/model/check/policy/baseline/index";
import {
  activeRuleBaselineFacts,
  activeRuleSelectorFacts,
  factsForRuleIds,
} from "@internal/habitat-harness/service/model/rules/policy/active-facts.policy";
import type { RuleSelection } from "@internal/habitat-harness/service/model/rules/policy/selection.policy";
import {
  type RuleSelectionResult,
  selectRules,
} from "@internal/habitat-harness/service/model/rules/policy/selection.policy";
import { Effect } from "effect";
import { executeSelectedRulesEffect, type StructuralExecutionContext } from "./execution.policy.js";

export type BaselineExpansionResult =
  | { ok: true; messages: string[] }
  | Extract<RuleSelectionResult, { ok: false }>
  | {
      ok: false;
      requested: RuleSelection;
      reason: "baseline-contract";
      message: string;
    };

export function expandBaselinesEffect(
  selection: RuleSelection = {},
  options: { base?: string; repoRoot: string },
  executionContext: StructuralExecutionContext
): Effect.Effect<
  BaselineExpansionResult,
  never,
  | CommandRunner
  | CommandExecutor
  | HabitatConfig
  | FileSystem.FileSystem
  | GitProviderRequirements
  | GritProvider
  | GritProviderRequirements
> {
  return Effect.gen(function* () {
    const selected = selectRules(selection);
    if (!selected.ok) return selected;

    const context = baselineContext(executionContext);
    const messages: string[] = [];
    const ruleResults = yield* executeSelectedRulesEffect(selected.rules, {}, executionContext);
    const baselinesByRuleId = factsByRuleId(
      baselineContractInputs(selected.rules.map((rule) => rule.id))
    );
    for (const rule of selected.rules) {
      const baselineFacts = baselinesByRuleId.get(rule.id);
      if (!baselineFacts)
        throw new Error(`habitat internal error: missing baseline facts for ${rule.id}`);
      const baseline = yield* loadBaselineStateEffect(baselineFacts, context);
      if (baseline.kind === "baseline-refusal") {
        return {
          ok: false,
          requested: selection,
          reason: "baseline-contract",
          message: baseline.message,
        };
      }
      const execution = ruleResults.get(rule.id);
      if (!execution) throw new Error(`habitat internal error: missing rule result for ${rule.id}`);
      const { diagnostics } = execution.result;
      const baselineResult = yield* Effect.sync(() => applyBaseline(diagnostics, baseline));
      if (baselineResult.status === "refused") {
        return {
          ok: false,
          requested: selection,
          reason: "baseline-contract",
          message: baselineResult.refusals.map((failure) => failure.message).join(" "),
        };
      }
      const keys = diagnostics
        .filter((diagnostic) => diagnostic.severity === "error" && !diagnostic.baselined)
        .map(violationKey);
      if (keys.length > 0) {
        const guard = yield* guardBaselineExpansionEffect(rule.id, keys, options.base ?? "main", {
          ...context,
          registry: baselineContractInputs(),
        });
        if (guard.status === "refused") {
          return {
            ok: false,
            requested: selection,
            reason: "baseline-contract",
            message: guard.message,
          };
        }
        const writeFailure = yield* writeBaselineEffect(rule.id, guard.keys, context).pipe(
          Effect.as(null),
          Effect.catchAll((error) => Effect.succeed(error))
        );
        if (writeFailure) {
          return {
            ok: false,
            requested: selection,
            reason: "baseline-contract",
            message: `Unable to write baseline for '${rule.id}': ${renderHabitatError(writeFailure)}`,
          };
        }
        messages.push(`baseline written: ${rule.id} (${keys.length} entries)`);
      }
    }
    return { ok: true, messages };
  });
}

function baselineContext(context: StructuralExecutionContext): BaselineAuthorityContext {
  return { git: context.git, repoRoot: context.repoRoot };
}

export function baselineContractInputs(ruleIds?: readonly string[]) {
  const baselineFacts = ruleIds
    ? factsForRuleIds(activeRuleBaselineFacts, ruleIds)
    : activeRuleBaselineFacts;
  const selectorsByRuleId = factsByRuleId(
    ruleIds ? factsForRuleIds(activeRuleSelectorFacts, ruleIds) : activeRuleSelectorFacts
  );
  return baselineFacts.map((fact) => {
    const selector = selectorsByRuleId.get(fact.id);
    return {
      ...fact,
      ...(selector
        ? {
            ownerProject: selector.ownerProject,
            ownerTool: selector.ownerTool,
          }
        : {}),
    };
  });
}

function factsByRuleId<T extends { id: string }>(facts: readonly T[]): Map<string, T> {
  return new Map(facts.map((fact) => [fact.id, fact]));
}
