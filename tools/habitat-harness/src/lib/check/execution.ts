import path from "node:path";
import { validateScanRoots } from "../../adapters/grit/index.js";
import { executeRule, type RuleRunResult } from "../../rules/architecture.js";
import {
  activeRuleCommandExecutionFacts,
  activeRuleFileLayerFacts,
  activeRuleGraphFacts,
  activeRuleGritFacts,
  factsForRuleIds,
} from "../../rules/facts.js";
import type {
  RuleCommandExecutionFacts,
  RuleFileLayerFacts,
  RuleGritFacts,
  RuleSelectorFacts,
} from "../../rules/registry/index.js";
import type { HabitatDiagnostic } from "../diagnostics.js";
import { repoRoot, toRepoRelative } from "../paths.js";
import {
  modifiedStagedPaths,
  runFileLayerProtectedMutationRule,
  stagedPathsFromNameStatus,
  type StagedMutationPath,
} from "../protected-zone-authority/index.js";
import { run } from "../spawn.js";
import { readWorkspaceGraph, ruleAliasTargetState } from "../workspace-graph/index.js";
import { dependencyRefusalDiagnostic, notApplicableDiagnostic } from "./disposition-diagnostics.js";
import type { CheckOptions } from "./request.js";
import type { RuleExecutionDisposition } from "./schema.js";

export interface RuleExecutionRecord {
  result: RuleRunResult;
  durationMs: number;
  disposition: RuleExecutionDisposition;
}

export function rulesForExecution(
  selectedRules: readonly RuleSelectorFacts[],
  _options: {
    gritFacts?: readonly RuleGritFacts[];
    staged?: boolean;
    stagedPaths?: readonly string[];
  } = {}
): RuleSelectorFacts[] {
  return [...selectedRules];
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
): Promise<Map<string, RuleExecutionRecord>> {
  const results = new Map<string, RuleExecutionRecord>();
  const selectedRuleIds = selectedRules.map((rule) => rule.id);
  const gritRules = factsForRuleIds(activeRuleGritFacts, selectedRuleIds);
  if (gritRules.length > 0) {
    const scanRoots = options.staged
      ? stagedGritScanRoots(
          options.stagedPaths ?? currentStagedPaths(),
          approvedScanRootsForRules(gritRules)
        )
      : undefined;
    if (options.staged && scanRoots?.length === 0) {
      for (const rule of gritRules) {
        results.set(rule.id, {
          result: {
            exitCode: 1,
            diagnostics: [notApplicableDiagnostic(rule, "staged-scope-no-approved-roots")],
          },
          durationMs: 0,
          disposition: { kind: "not-applicable", reason: "staged-scope-no-approved-roots" },
        });
      }
    } else {
      const { runGritRules } = await import("../../adapters/grit/index.js");
      const started = Date.now();
      const gritResults = await runGritRules(gritRules, scanRoots ? { scanRoots } : {});
      const durationMs = Date.now() - started;
      for (const rule of gritRules) {
        const result = gritResults.get(rule.id);
        if (result) {
          results.set(rule.id, {
            result,
            durationMs,
            disposition: { kind: "executed", durationMs },
          });
        }
      }
    }
  }

  const commandRules = factsForRuleIds(activeRuleCommandExecutionFacts, selectedRuleIds);
  const graphRefusals = await graphDependencyRefusals(commandRules);
  for (const rule of commandRules) {
    const refusal = graphRefusals.get(rule.id);
    if (refusal) {
      results.set(rule.id, {
        result: {
          exitCode: 1,
          diagnostics: [dependencyRefusalDiagnostic(rule, refusal)],
        },
        durationMs: 0,
        disposition: { kind: "dependency-refused", owner: "D3", reason: refusal },
      });
    }
  }
  await executeCommandRules(
    commandRules.filter((rule) => !graphRefusals.has(rule.id)),
    results
  );
  executeFileLayerRules(
    factsForRuleIds(activeRuleFileLayerFacts, selectedRuleIds),
    results,
    options
  );

  return results;
}

async function graphDependencyRefusals(
  commandRules: readonly RuleCommandExecutionFacts[]
): Promise<Map<string, string>> {
  const graphRules = factsForRuleIds(
    activeRuleGraphFacts,
    commandRules.map((rule) => rule.id)
  ).filter((rule) => rule.alias.kind !== "direct-rule-check");
  if (graphRules.length === 0) return new Map();

  const graph = await readWorkspaceGraph();
  if (graph.kind !== "graph-ready") {
    return new Map(graphRules.map((rule) => [rule.id, graph.message]));
  }

  const refusals = new Map<string, string>();
  for (const rule of graphRules) {
    const state = ruleAliasTargetState({ projects: graph.snapshot.projects, rule });
    if (state?.kind === "graph-refusal") refusals.set(rule.id, state.message);
  }
  return refusals;
}

function approvedScanRootsForRules(rules: readonly RuleGritFacts[]): string[] {
  return [...new Set(rules.flatMap((rule) => rule.scanRoots).map(toRepoRelative))];
}

async function executeCommandRules(
  commandRules: readonly RuleCommandExecutionFacts[],
  results: Map<string, RuleExecutionRecord>
): Promise<void> {
  for (const rule of commandRules) {
    const started = Date.now();
    const result = await executeRule(rule);
    const durationMs = Date.now() - started;
    results.set(rule.id, { result, durationMs, disposition: { kind: "executed", durationMs } });
  }
}

function executeFileLayerRules(
  fileLayerRules: readonly RuleFileLayerFacts[],
  results: Map<string, RuleExecutionRecord>,
  options: Pick<CheckOptions, "staged" | "stagedPaths">
): void {
  const stagedPathsResult =
    options.staged && options.stagedPaths
      ? modifiedStagedPaths(options.stagedPaths)
      : options.staged
        ? currentStagedPathActions()
        : undefined;
  for (const rule of fileLayerRules) {
    const started = Date.now();
    if (isStagedPathReadFailure(stagedPathsResult)) {
      const durationMs = Date.now() - started;
      results.set(rule.id, {
        result: {
          exitCode: 1,
          diagnostics: [stagedPathReadFailureDiagnostic(rule, stagedPathsResult.message)],
        },
        durationMs,
        disposition: { kind: "executed", durationMs },
      });
      continue;
    }
    const stagedPaths = stagedPathsResult ? stagedPathsResult : undefined;
    const result = runFileLayerProtectedMutationRule(rule, {
      staged: options.staged,
      ...(stagedPaths ? { stagedPaths } : {}),
    });
    const durationMs = Date.now() - started;
    results.set(rule.id, { result, durationMs, disposition: { kind: "executed", durationMs } });
  }
}

type StagedPathActionReadResult =
  | StagedMutationPath[]
  | { ok: false; message: string };

function isStagedPathReadFailure(
  result: StagedPathActionReadResult | undefined
): result is { ok: false; message: string } {
  return Boolean(result && "ok" in result && !result.ok);
}

function currentStagedPathActions(): StagedPathActionReadResult {
  const result = run(["git", "diff", "--cached", "--name-status", "-z"], { cwd: repoRoot });
  if (result.exitCode !== 0) {
    return {
      ok: false,
      message:
        result.stderr.trim() ||
        `Unable to read staged path actions with git diff --cached --name-status -z (exit ${result.exitCode}).`,
    };
  }
  if (!result.stdout) return [];
  return stagedPathsFromNameStatus(result.stdout);
}

function stagedPathReadFailureDiagnostic(
  rule: RuleFileLayerFacts,
  detail: string
): HabitatDiagnostic {
  return {
    ruleId: rule.id,
    path: ".",
    message: `Unable to read staged path actions for protected-zone checks. ${detail}`,
    severity: "error",
    baselined: false,
  };
}

function currentStagedPaths(): string[] {
  const result = run(["git", "diff", "--cached", "--name-only", "-z"], { cwd: repoRoot });
  if (result.exitCode !== 0 || !result.stdout) return [];
  return result.stdout.split("\0").filter(Boolean).map(toRepoRelative);
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
