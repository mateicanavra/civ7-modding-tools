import type { CheckOptions } from "@habitat/cli/service/model/check/index";
import type {
  RuleCommandExecutionFacts,
  RuleGraphFacts,
  RuleHookCheckFacts,
  RuleSelectorFacts,
  RuleSourceFacts,
} from "@habitat/cli/service/model/rules/index";
import { factsForRuleIds } from "@habitat/cli/service/model/rules/policy/catalog.policy";
import type { RuleSelection } from "@habitat/cli/service/model/rules/policy/selection.policy";
import { runStructureRulesEffect } from "@habitat/cli/service/model/structure-check/index";
import { Clock, Effect } from "effect";
import {
  executeCommandRulesEffect,
  executeFormatRulesEffect,
  executeGraphBackedCommandRulesEffect,
} from "./command-execution.policy.js";
import type { RuleExecutionRecord, StructuralExecutionContext } from "./context.policy.js";
import {
  currentStagedPathsEffect,
  executeFileLayerRulesEffect,
} from "./file-layer-execution.policy.js";
import {
  executeGritSourceRulesEffect,
  executeNativeSourceRulesEffect,
} from "./source-execution.policy.js";

export function rulesForExecution(
  selectedRules: readonly RuleSelectorFacts[],
  options: {
    selection?: RuleSelection;
    hookCheck?: boolean;
    hookCheckFacts?: readonly RuleHookCheckFacts[];
    sourceRuleFacts?: readonly RuleSourceFacts[];
    staged?: boolean;
    stagedPaths?: readonly string[];
  } = {}
): RuleSelectorFacts[] {
  const rules = shouldUseDefaultLocalLane(options)
    ? selectedRules.filter((rule) => defaultLocalRuleTools.has(rule.ownerTool))
    : [...selectedRules];
  if (!options.hookCheck) return rules;
  const hookRuleIds = new Set((options.hookCheckFacts ?? []).map((rule) => rule.id));
  return rules.filter(
    (rule) =>
      (rule.ownerTool !== "source-check" && rule.ownerTool !== "grit-check") ||
      hookRuleIds.has(rule.id)
  );
}

const defaultLocalRuleTools = new Set([
  "command-check",
  "file-layer",
  "grit-check",
  "habitat",
  "source-check",
  "structure-check",
]);

function shouldUseDefaultLocalLane(options: { selection?: RuleSelection; staged?: boolean }) {
  if (options.staged) return false;
  const selection = options.selection ?? {};
  return !selection.owner && !selection.rule && !selection.tool;
}

export function executeSelectedRulesEffect(
  selectedRules: readonly RuleSelectorFacts[],
  options: Pick<CheckOptions, "staged" | "stagedPaths">,
  context: StructuralExecutionContext
): Effect.Effect<Map<string, RuleExecutionRecord>, never, any> {
  return Effect.gen(function* () {
    const results = new Map<string, RuleExecutionRecord>();
    const selectedRuleIds = selectedRules.map((rule) => rule.id);
    const sourceRules = factsForRuleIds(context.rules.source, selectedRuleIds);
    yield* executeNativeSourceRulesEffect(sourceRules, results, options, context, () =>
      currentStagedPathsEffect(context)
    );

    const gritRules = factsForRuleIds(context.rules.grit, selectedRuleIds);
    yield* executeGritSourceRulesEffect(gritRules, results, options, context, () =>
      currentStagedPathsEffect(context)
    );

    yield* executeStructureRulesEffect(
      factsForRuleIds(context.rules.structure, selectedRuleIds),
      results,
      context
    );

    const commandRules = factsForRuleIds(context.rules.commandExecution, selectedRuleIds);
    const graphRulesById = factsByRuleId(
      factsForRuleIds(
        context.rules.graph,
        commandRules.map((rule) => rule.id)
      )
    );
    yield* executeFormatRulesEffect(
      commandRules.filter((rule) => rule.ownerTool === "format-check"),
      results,
      context
    );
    const remainingCommandRules = commandRules.filter((rule) => rule.ownerTool !== "format-check");
    const graphBackedRules = remainingCommandRules.filter((rule) =>
      isGraphBackedCommandRule(rule, graphRulesById)
    );
    yield* executeGraphBackedCommandRulesEffect(graphBackedRules, graphRulesById, results, context);
    yield* executeCommandRulesEffect(
      remainingCommandRules.filter((rule) => !isGraphBackedCommandRule(rule, graphRulesById)),
      results,
      context
    );
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
                  groupId: "structure-check:rules",
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

function isGraphBackedCommandRule(
  rule: RuleCommandExecutionFacts,
  graphRulesById: ReadonlyMap<string, RuleGraphFacts>
): boolean {
  return graphRulesById.get(rule.id)?.alias.kind === "depends-on";
}

function factsByRuleId<T extends { id: string }>(facts: readonly T[]): Map<string, T> {
  return new Map(facts.map((fact) => [fact.id, fact]));
}
