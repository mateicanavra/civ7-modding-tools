import type { FileSystem } from "@effect/platform";
import type { CheckOptions } from "@habitat/cli/service/model/check/index";
import type { RuleHookCheckFacts, RuleSelectorFacts } from "@habitat/cli/service/model/rules/index";
import { factsForRuleIds } from "@habitat/cli/service/model/rules/policy/catalog.policy";
import type { RuleSelection } from "@habitat/cli/service/model/rules/policy/selection.policy";
import { runStructureRulesEffect } from "@habitat/cli/service/model/structure-check/index";
import { Clock, Effect, Match } from "effect";
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
  const rules = Match.value(shouldUseDefaultLocalLane(options)).pipe(
    Match.when(true, () =>
      explicitlySelectedRules.filter((rule) => defaultLocalRunners.has(rule.runner.name))
    ),
    Match.when(false, () => explicitlySelectedRules),
    Match.exhaustive
  );
  const hookRuleIds = new Set((options.hookCheckFacts ?? []).map((rule) => rule.id));
  return Match.value(options.hookCheck === true).pipe(
    Match.when(true, () =>
      rules.filter((rule) => rule.runner.name !== "grit" || hookRuleIds.has(rule.id))
    ),
    Match.when(false, () => rules),
    Match.exhaustive
  );
}

const defaultLocalRunners = new Set(["grit", "habitat"]);

function shouldUseDefaultLocalLane(options: { selection?: RuleSelection; staged?: boolean }) {
  const selection = options.selection ?? {};
  return (
    !options.staged &&
    !selection.owner &&
    !selection.rule &&
    (selection.rules?.length ?? 0) === 0 &&
    !selection.runner
  );
}

function applyExecutionSelection(
  rules: readonly RuleSelectorFacts[],
  selection: RuleSelection = {}
): RuleSelectorFacts[] {
  const requestedRules = new Set(
    [selection.rule, ...(selection.rules ?? [])].filter(
      (candidate): candidate is string => candidate !== undefined
    )
  );
  return rules.filter(
    (rule) =>
      (selection.owner === undefined || rule.ownerProject === selection.owner) &&
      (selection.runner === undefined || rule.runner.name === selection.runner) &&
      (requestedRules.size === 0 || requestedRules.has(rule.id))
  );
}

export const executeSelectedRulesEffect = Effect.fn("habitat.check.executeSelectedRules")(
  function* (
    selectedRules: readonly RuleSelectorFacts[],
    options: Pick<CheckOptions, "staged" | "stagedPaths">,
    context: StructuralExecutionContext
  ): Effect.fn.Return<Map<string, RuleExecutionRecord>, never, FileSystem.FileSystem> {
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
  }
);

const executeStructureRulesEffect = Effect.fn("habitat.check.executeStructureRules")(function* (
  structureRules: readonly StructureRuleFact[],
  results: Map<string, RuleExecutionRecord>,
  context: Pick<StructuralExecutionContext, "repoRoot" | "structureFileSystem">
): Effect.fn.Return<void, never, FileSystem.FileSystem> {
  const execution = executeNonEmptyStructureRulesEffect(structureRules, results, context);
  yield* execution.pipe(Effect.when(() => structureRules.length > 0));
});

const executeNonEmptyStructureRulesEffect = Effect.fn(
  "habitat.check.executeNonEmptyStructureRules"
)(function* (
  structureRules: readonly StructureRuleFact[],
  results: Map<string, RuleExecutionRecord>,
  context: Pick<StructuralExecutionContext, "repoRoot" | "structureFileSystem">
): Effect.fn.Return<void, never, FileSystem.FileSystem> {
  const started = yield* Clock.currentTimeMillis;
  const structureResults = yield* runStructureRulesEffect(structureRules, {
    repoRoot: context.repoRoot,
    fileSystem: context.structureFileSystem,
  });
  const durationMs = Math.max(0, (yield* Clock.currentTimeMillis) - started);
  const timing = structureExecutionTiming(structureRules, durationMs);
  const records = structureRules.flatMap((rule) =>
    Match.value(structureResults.get(rule.id)).pipe(
      Match.when(Match.undefined, () => []),
      Match.orElse((result) => [
        [
          rule.id,
          {
            result,
            durationMs,
            timing,
            disposition: { kind: "executed" as const, durationMs },
          } satisfies RuleExecutionRecord,
        ] as const,
      ])
    )
  );
  for (const [ruleId, record] of records) {
    results.set(ruleId, record);
  }
});

function structureExecutionTiming(
  structureRules: readonly StructureRuleFact[],
  durationMs: number
) {
  return Match.value(structureRules.length > 1).pipe(
    Match.when(true, () => ({
      kind: "shared" as const,
      groupId: "habitat:structure-rules",
      durationMs,
      ruleCount: structureRules.length,
    })),
    Match.when(false, () => undefined),
    Match.exhaustive
  );
}

type StructureRuleFact = StructuralExecutionContext["rules"]["structure"][number];
