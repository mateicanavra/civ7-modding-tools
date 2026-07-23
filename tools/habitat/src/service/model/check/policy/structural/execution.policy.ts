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

export function executeSelectedRulesEffect<R>(
  selectedRules: readonly RuleSelectorFacts[],
  options: Pick<CheckOptions, "staged" | "stagedPaths">,
  context: StructuralExecutionContext<R>
): Effect.Effect<Map<string, RuleExecutionRecord>, never, R> {
  return Effect.gen(function* () {
    const results = new Map<string, RuleExecutionRecord>();
    const selectedRuleIds = selectedRules.map((rule) => rule.id);
    const diagnosticRules = factsForRuleIds(context.rules.diagnostic, selectedRuleIds);
    yield* executeDiagnosticRulesEffect<R>(diagnosticRules, results, options, context, () =>
      currentStagedPathsEffect<R>(context)
    );

    yield* executeStructureRulesEffect<R>(
      factsForRuleIds(context.rules.structure, selectedRuleIds),
      results,
      context
    );

    const commandRules = factsForRuleIds(context.rules.commandExecution, selectedRuleIds);
    yield* executeGraphBackedCommandRulesEffect<R>(
      factsForRuleIds(context.rules.graph, selectedRuleIds).filter(
        (rule) => rule.alias.kind === "depends-on"
      ),
      results,
      context
    );
    yield* executeCommandRulesEffect<R>(commandRules, results, context);
    yield* executeFileLayerRulesEffect<R>(
      factsForRuleIds(context.rules.fileLayer, selectedRuleIds),
      results,
      options,
      context
    );

    return results;
  });
}

function executeStructureRulesEffect<R>(
  structureRules: readonly StructureRuleFact[],
  results: Map<string, RuleExecutionRecord>,
  context: Pick<StructuralExecutionContext<R>, "git" | "repoRoot" | "structureFileSystem">
): Effect.Effect<void, never, R> {
  if (structureRules.length === 0) return Effect.void;
  return Effect.gen(function* () {
    const started = yield* Clock.currentTimeMillis;
    const inventory = yield* context.git.visiblePathInventory({
      cwd: context.repoRoot,
    });
    if (inventory === null) {
      const durationMs = Math.max(0, (yield* Clock.currentTimeMillis) - started);
      for (const rule of structureRules) {
        const detail =
          "Git could not provide the complete visible path inventory required for bounded structure evaluation.";
        results.set(rule.id, {
          result: {
            exitCode: 1,
            diagnostics: [
              {
                ruleId: rule.id,
                path: ".",
                message: `Git visible-path inventory unavailable: ${detail}`,
                severity: rule.lane === "advisory" ? "advisory" : "error",
                baselined: false,
              },
            ],
          },
          durationMs,
          timing: sharedStructureTiming(structureRules.length, durationMs),
          disposition: {
            kind: "execution-failed",
            source: "git-provider",
            failure: "GitVisiblePathInventoryUnavailable",
            detail,
          },
        });
      }
      return;
    }
    const structureResults = yield* runStructureRulesEffect<R>(structureRules, {
      repoRoot: context.repoRoot,
      fileSystem: context.structureFileSystem,
      visibleFiles: inventory.paths,
      trackedNonFilePaths: inventory.trackedNonFilePaths,
    });
    const durationMs = Math.max(0, (yield* Clock.currentTimeMillis) - started);
    for (const rule of structureRules) {
      const result = structureResults.get(rule.id);
      if (result) {
        results.set(rule.id, {
          result,
          durationMs,
          timing: sharedStructureTiming(structureRules.length, durationMs),
          disposition: { kind: "executed", durationMs },
        });
      }
    }
  });
}

type StructureRuleFact = StructuralExecutionContext["rules"]["structure"][number];

function sharedStructureTiming(ruleCount: number, durationMs: number) {
  return ruleCount > 1
    ? {
        kind: "shared" as const,
        groupId: "habitat:structure-rules",
        durationMs,
        ruleCount,
      }
    : undefined;
}

function factsByRuleId<T extends { id: string }>(facts: readonly T[]): Map<string, T> {
  return new Map(facts.map((fact) => [fact.id, fact]));
}
