import type { FileSystem } from "@effect/platform";
import type { CommandExecutor } from "@effect/platform/CommandExecutor";
import {
  BaselineAuthority,
  violationKey,
} from "@internal/habitat-harness/service/model/check/policy/baseline/index";
import { SourceCheck } from "@internal/habitat-harness/service/model/check/policy/source/index";
import {
  activeRuleBaselineFacts,
  activeRuleSelectorFacts,
  factsForRuleIds,
} from "@internal/habitat-harness/service/model/rules/registry/active-facts";
import type { RuleSelection } from "@internal/habitat-harness/service/model/rules/policy/selection.policy";
import {
  type RuleSelectionResult,
  selectRules,
} from "@internal/habitat-harness/service/model/rules/policy/selection.policy";
import type { BiomeProvider } from "@internal/habitat-harness/providers/biome/index";
import { CommandRunner } from "@internal/habitat-harness/resources/command/index";
import type { HabitatConfig } from "@internal/habitat-harness/resources/config/index";
import { renderHabitatError } from "@internal/habitat-harness/resources/errors/index";
import type {
  GitProvider,
  GitProviderRequirements,
} from "@internal/habitat-harness/providers/git/index";
import type {
  GritProvider,
  GritProviderRequirements,
} from "@internal/habitat-harness/providers/grit/index";
import type { NxProvider } from "@internal/habitat-harness/providers/nx/index";
import { Effect } from "effect";
import { executeSelectedRulesEffect } from "./execution.js";

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
  options: { base?: string } = {}
): Effect.Effect<
  BaselineExpansionResult,
  never,
  | BaselineAuthority
  | BiomeProvider
  | CommandRunner
  | NxProvider
  | CommandExecutor
  | SourceCheck
  | HabitatConfig
  | FileSystem.FileSystem
  | GitProvider
  | GitProviderRequirements
  | GritProvider
  | GritProviderRequirements
> {
  return Effect.gen(function* () {
    const baselineAuthority = yield* BaselineAuthority;
    const selected = selectRules(selection);
    if (!selected.ok) return selected;

    const messages: string[] = [];
    const ruleResults = yield* executeSelectedRulesEffect(selected.rules);
    const baselinesByRuleId = factsByRuleId(
      baselineContractInputs(selected.rules.map((rule) => rule.id))
    );
    for (const rule of selected.rules) {
      const baselineFacts = baselinesByRuleId.get(rule.id);
      if (!baselineFacts)
        throw new Error(`habitat internal error: missing baseline facts for ${rule.id}`);
      const baseline = yield* baselineAuthority.loadState(baselineFacts);
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
      const baselineResult = yield* baselineAuthority.apply(diagnostics, baseline);
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
        const guard = yield* baselineAuthority.guardExpansion(
          rule.id,
          keys,
          options.base ?? "main",
          {
            registry: baselineContractInputs(),
          }
        );
        if (guard.status === "refused") {
          return {
            ok: false,
            requested: selection,
            reason: "baseline-contract",
            message: guard.message,
          };
        }
        const writeFailure = yield* baselineAuthority.write(rule.id, guard.keys).pipe(
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
