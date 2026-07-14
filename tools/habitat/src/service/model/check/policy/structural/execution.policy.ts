import type { CheckOptions } from "@habitat/cli/service/model/check/index";
import type { RuleHookCheckFacts, RuleSelectorFacts } from "@habitat/cli/service/model/rules/index";
import { factsForRuleIds } from "@habitat/cli/service/model/rules/policy/catalog.policy";
import type { RuleSelection } from "@habitat/cli/service/model/rules/policy/selection.policy";
import { runStructureRulesEffect } from "@habitat/cli/service/model/structure-check/index";
import { Clock, Effect } from "effect";
import {
  executeCommandRulesEffect,
  executeGraphBackedCommandRulesEffect,
} from "./command-execution.policy.js";
import type { RuleExecutionRecord, StructuralExecutionContext } from "./context.policy.js";
import { executeDiagnosticRulesEffect } from "./diagnostic-execution.policy.js";
import {
  currentStagedPathsEffect,
  executeFileLayerRulesEffect,
} from "./file-layer-execution.policy.js";

export function rulesForExecution(
  selectedRules: readonly RuleSelectorFacts[],
  options: {
    selection?: RuleSelection;
    hookCheck?: boolean;
    hookCheckFacts?: readonly RuleHookCheckFacts[];
    staged?: boolean;
    stagedPaths?: readonly string[];
  } = {}
): RuleSelectorFacts[] {
  const explicitlySelectedRules = applyExecutionSelection(selectedRules, options.selection);
  const rules = shouldUseDefaultLocalLane(options)
    ? explicitlySelectedRules.filter((rule) => defaultLocalRunners.has(rule.runner.name))
    : explicitlySelectedRules;
  if (!options.hookCheck) return rules;
  const hookRuleIds = new Set((options.hookCheckFacts ?? []).map((rule) => rule.id));
  return rules.filter((rule) => rule.runner.name !== "grit" || hookRuleIds.has(rule.id));
}

const defaultLocalRunners = new Set(["grit", "habitat"]);

function shouldUseDefaultLocalLane(options: { selection?: RuleSelection; staged?: boolean }) {
  if (options.staged) return false;
  const selection = options.selection ?? {};
  return (
    !selection.owner && !selection.rule && (selection.rules?.length ?? 0) === 0 && !selection.runner
  );
}

function applyExecutionSelection(
  rules: readonly RuleSelectorFacts[],
  selection: RuleSelection = {}
): RuleSelectorFacts[] {
  return rules.filter((rule) => {
    if (selection.owner && rule.ownerProject !== selection.owner) return false;
    if (selection.runner && rule.runner.name !== selection.runner) return false;
    const requestedRules = new Set([
      ...(selection.rule ? [selection.rule] : []),
      ...(selection.rules ?? []),
    ]);
    return requestedRules.size === 0 || requestedRules.has(rule.id);
  });
}

export function executeSelectedRulesEffect(
  selectedRules: readonly RuleSelectorFacts[],
  options: Pick<CheckOptions, "staged" | "stagedPaths">,
  context: StructuralExecutionContext
): Effect.Effect<Map<string, RuleExecutionRecord>, never, any> {
  return Effect.gen(function* () {
    const results = new Map<string, RuleExecutionRecord>();
    const selectedRuleIds = selectedRules.map((rule) => rule.id);
    const diagnosticRules = factsForRuleIds(context.rules.diagnostic, selectedRuleIds);
    yield* executeDiagnosticRulesEffect(diagnosticRules, results, options, context, () =>
      currentStagedPathsEffect(context)
    );

    yield* executeStructureRulesEffect(
      factsForRuleIds(context.rules.structure, selectedRuleIds),
      results,
      context
    );

    const commandRules = factsForRuleIds(context.rules.commandExecution, selectedRuleIds);
    yield* executeGraphBackedCommandRulesEffect(
      factsForRuleIds(context.rules.graph, selectedRuleIds).filter(
        (rule) => rule.alias.kind === "depends-on"
      ),
      results,
      context
    );
    yield* executeCommandRulesEffect(commandRules, results, context);
    yield* executeFileLayerRulesEffect(
      factsForRuleIds(context.rules.fileLayer, selectedRuleIds),
      results,
      options,
      context
    );

    return results;
  });
}

function executeStructureRulesEffect(
  structureRules: readonly StructureRuleFact[],
  results: Map<string, RuleExecutionRecord>,
  context: StructuralExecutionContext
): Effect.Effect<void, never, any> {
  if (structureRules.length === 0) return Effect.void;
  return Effect.gen(function* () {
    const started = yield* Clock.currentTimeMillis;
    const structureResults = yield* runStructureRulesEffect(structureRules, {
      repoRoot: context.repoRoot,
      fileSystem: context.structureFileSystem,
    });
    const durationMs = Math.max(0, (yield* Clock.currentTimeMillis) - started);
    for (const rule of structureRules) {
      const result = structureResults.get(rule.id);
      if (result) {
        results.set(rule.id, {
          result,
          durationMs,
          timing:
            structureRules.length > 1
              ? {
                  kind: "shared",
                  groupId: "habitat:structure-rules",
                  durationMs,
                  ruleCount: structureRules.length,
                }
              : undefined,
          disposition: { kind: "executed", durationMs },
        });
      }
    }
  });
}

type StructureRuleFact = StructuralExecutionContext["rules"]["structure"][number];

function factsByRuleId<T extends { id: string }>(facts: readonly T[]): Map<string, T> {
  return new Map(facts.map((fact) => [fact.id, fact]));
}
