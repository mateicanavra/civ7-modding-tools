import type { CommandExecutor } from "@effect/platform/CommandExecutor";
import { Effect } from "effect";
import type { HabitatConfig } from "../../../config/index.js";
import {
  applyBaseline,
  guardBaselineExpansion,
  loadBaselineState,
  violationKey,
  writeBaseline,
} from "../../../lib/baseline.js";
import type { RuleSelection } from "../../../lib/rule-selection.js";
import { type RuleSelectionResult, selectRules } from "../../../lib/rule-selection.js";
import { CommandRunner } from "../../../providers/command/index.js";
import { GritProvider, type GritProviderRequirements } from "../../../providers/grit/index.js";
import { HabitatClock } from "../../../resources/index.js";
import {
  activeRuleBaselineFacts,
  activeRuleSelectorFacts,
  factsForRuleIds,
} from "../../../rules/facts.js";
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
  | CommandRunner
  | CommandExecutor
  | GritProvider
  | GritProviderRequirements
  | HabitatConfig
  | HabitatClock
> {
  return Effect.gen(function* () {
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
      const baseline = loadBaselineState(baselineFacts);
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
      const baselineResult = applyBaseline(diagnostics, baseline);
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
        const guard = guardBaselineExpansion(rule.id, keys, options.base ?? "main", {
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
        writeBaseline(rule.id, guard.keys);
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
