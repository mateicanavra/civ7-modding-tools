import path from "node:path";
import { validateScanRoots } from "../../adapters/grit/index.js";
import { executeRule, type RuleRunResult } from "../../rules/architecture.js";
import {
  activeRuleCommandExecutionFacts,
  activeRuleFileLayerFacts,
  activeRuleGritFacts,
  activeRuleLocalFeedbackFacts,
  factsForRuleIds,
} from "../../rules/facts.js";
import type {
  RuleCommandExecutionFacts,
  RuleFileLayerFacts,
  RuleGritFacts,
  RuleLocalFeedbackFacts,
  RuleSelectorFacts,
} from "../../rules/registry/index.js";
import { runGeneratedZoneRule } from "../generated-zones.js";
import { repoRoot, toRepoRelative } from "../paths.js";
import { run } from "../spawn.js";
import type { CheckOptions } from "./request.js";

export function rulesForExecution(
  selectedRules: readonly RuleSelectorFacts[],
  options: {
    gritFacts?: readonly RuleGritFacts[];
    localFeedbackFacts?: readonly RuleLocalFeedbackFacts[];
    staged?: boolean;
    stagedPaths?: readonly string[];
  } = {}
): RuleSelectorFacts[] {
  if (!options.staged) return [...selectedRules];
  if (!selectedRules.some((rule) => rule.ownerTool === "grit-check")) return [...selectedRules];
  const selectedGritFacts = factsForRuleIds(
    options.gritFacts ?? activeRuleGritFacts,
    selectedRules.map((rule) => rule.id)
  );
  const hasStagedGritRoots =
    selectedGritFacts.length > 0 &&
    stagedGritScanRoots(
      options.stagedPaths ?? currentStagedPaths(),
      approvedScanRootsForRules(selectedGritFacts)
    ).length > 0;
  const stagedEligible = localFeedbackEligibleRuleIds(
    factsForRuleIds(
      options.localFeedbackFacts ?? activeRuleLocalFeedbackFacts,
      selectedRules.map((rule) => rule.id)
    )
  );
  return selectedRules.filter(
    (rule) => rule.ownerTool !== "grit-check" || (stagedEligible.has(rule.id) && hasStagedGritRoots)
  );
}

export function stagedGritScanRoots(
  stagedPaths: readonly string[],
  approvedScanRoots: readonly string[] = approvedScanRootsForRules(activeRuleGritFacts)
): string[] {
  const candidates = sortedUnique(
    stagedPaths
      .map((candidate) => toRepoRelative(candidate))
      .filter((candidate) => gritCandidateExtensions.has(path.extname(candidate)))
  );
  return candidates.filter(
    (candidate) =>
      validateScanRoots([candidate], {
        requireExisting: false,
        approvedScanRoots,
      }) === null
  );
}

export async function executeSelectedRules(
  selectedRules: readonly RuleSelectorFacts[],
  options: Pick<CheckOptions, "staged" | "stagedPaths"> = {}
): Promise<Map<string, { result: RuleRunResult; durationMs: number }>> {
  const results = new Map<string, { result: RuleRunResult; durationMs: number }>();
  const selectedRuleIds = selectedRules.map((rule) => rule.id);
  const gritRules = factsForRuleIds(activeRuleGritFacts, selectedRuleIds);
  if (gritRules.length > 0) {
    const { runGritRules } = await import("../../adapters/grit/index.js");
    const started = Date.now();
    const scanRoots = options.staged
      ? stagedGritScanRoots(
          options.stagedPaths ?? currentStagedPaths(),
          approvedScanRootsForRules(gritRules)
        )
      : undefined;
    const gritResults = await runGritRules(gritRules, scanRoots ? { scanRoots } : {});
    const durationMs = Date.now() - started;
    for (const rule of gritRules) {
      const result = gritResults.get(rule.id);
      if (result) results.set(rule.id, { result, durationMs });
    }
  }

  await executeCommandRules(
    factsForRuleIds(activeRuleCommandExecutionFacts, selectedRuleIds),
    results
  );
  executeFileLayerRules(
    factsForRuleIds(activeRuleFileLayerFacts, selectedRuleIds),
    results,
    options
  );

  return results;
}

function approvedScanRootsForRules(rules: readonly RuleGritFacts[]): string[] {
  return [...new Set(rules.flatMap((rule) => rule.scanRoots).map(toRepoRelative))];
}

async function executeCommandRules(
  commandRules: readonly RuleCommandExecutionFacts[],
  results: Map<string, { result: RuleRunResult; durationMs: number }>
): Promise<void> {
  for (const rule of commandRules) {
    const started = Date.now();
    const result = await executeRule(rule);
    results.set(rule.id, { result, durationMs: Date.now() - started });
  }
}

function executeFileLayerRules(
  fileLayerRules: readonly RuleFileLayerFacts[],
  results: Map<string, { result: RuleRunResult; durationMs: number }>,
  options: Pick<CheckOptions, "staged">
): void {
  for (const rule of fileLayerRules) {
    const started = Date.now();
    const result = runGeneratedZoneRule(rule, { staged: options.staged });
    results.set(rule.id, { result, durationMs: Date.now() - started });
  }
}

function currentStagedPaths(): string[] {
  const result = run(["git", "diff", "--cached", "--name-only", "-z"], { cwd: repoRoot });
  if (result.exitCode !== 0 || !result.stdout) return [];
  return result.stdout.split("\0").filter(Boolean).map(toRepoRelative);
}

function localFeedbackEligibleRuleIds(facts: readonly RuleLocalFeedbackFacts[]): Set<string> {
  return new Set(facts.map((fact) => fact.id));
}

function sortedUnique(values: readonly string[]): string[] {
  return [...new Set(values)].sort();
}

const gritCandidateExtensions = new Set([
  ".cjs",
  ".cts",
  ".js",
  ".jsx",
  ".mjs",
  ".mts",
  ".ts",
  ".tsx",
]);
