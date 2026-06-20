import type { CommandExecutor } from "@effect/platform/CommandExecutor";
import { Effect } from "effect";
import { runGritRulesEffect, validateScanRoots } from "../../adapters/grit/index.js";
import type { HabitatConfig } from "../../config/index.js";
import {
  activeRuleCommandExecutionFacts,
  activeRuleFileLayerFacts,
  activeRuleGraphFacts,
  activeRulePatternFacts,
  factsForRuleIds,
} from "../../domains/rule-registry/active-facts.js";
import type {
  RuleCommandExecutionFacts,
  RuleFileLayerFacts,
  RulePatternFacts,
  RuleSelectorFacts,
} from "../../domains/rule-registry/index.js";
import { type HabitatError, renderHabitatError } from "../../errors/index.js";
import type { HabitatDiagnostic } from "../../lib/diagnostics.js";
import { repoRoot, toRepoRelative } from "../../lib/paths.js";
import {
  modifiedStagedPaths,
  runFileLayerProtectedMutationRule,
  type StagedMutationPath,
  stagedPathsFromNameStatus,
} from "../../lib/protected-zones/index.js";
import { readWorkspaceGraph, ruleAliasTargetState } from "../../lib/workspace-graph/index.js";
import {
  CommandRunner,
  type HabitatCommandResult,
  runSyncSpawnCommand,
} from "../../providers/command/index.js";
import { GritProvider, type GritProviderRequirements } from "../../providers/grit/index.js";
import { HabitatClock } from "../../resources/index.js";
import { type RuleRunResult, ruleDiagnosticsFromCommandResult } from "../../rules/architecture.js";
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
    gritFacts?: readonly RulePatternFacts[];
    staged?: boolean;
    stagedPaths?: readonly string[];
  } = {}
): RuleSelectorFacts[] {
  return [...selectedRules];
}

export function stagedPatternScanRoots(
  stagedPaths: readonly string[],
  approvedScanRoots: readonly string[] = approvedScanRootsForRules(activeRulePatternFacts)
): string[] {
  const candidates = sortedUnique(
    stagedPaths
      .map((candidate) => toRepoRelative(candidate))
      .filter((candidate) => gritCandidateExtensions.has(pathExt(candidate)))
  );
  return candidates.filter(
    (candidate) =>
      validateScanRoots([candidate], {
        requireExisting: false,
        approvedScanRoots,
      }) === null
  );
}

export function approvedScanRootsForRules(rules: readonly RulePatternFacts[]): string[] {
  return [...new Set(rules.flatMap((rule) => rule.scanRoots).map(toRepoRelative))];
}

export function executeSelectedRulesEffect(
  selectedRules: readonly RuleSelectorFacts[],
  options: Pick<CheckOptions, "staged" | "stagedPaths"> = {}
): Effect.Effect<
  Map<string, RuleExecutionRecord>,
  never,
  | CommandRunner
  | CommandExecutor
  | GritProvider
  | GritProviderRequirements
  | HabitatConfig
  | HabitatClock
> {
  return Effect.gen(function* () {
    const results = new Map<string, RuleExecutionRecord>();
    const selectedRuleIds = selectedRules.map((rule) => rule.id);
    const gritRules = factsForRuleIds(activeRulePatternFacts, selectedRuleIds);
    if (gritRules.length > 0) {
      const scanRoots = options.staged
        ? stagedPatternScanRoots(
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
        const clock = yield* HabitatClock;
        const started = yield* clock.currentTimeMillis;
        const gritResults = yield* runGritRulesEffect(gritRules, scanRoots ? { scanRoots } : {});
        const durationMs = Math.max(0, (yield* clock.currentTimeMillis) - started);
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
    const graphRefusals = yield* Effect.promise(() => graphDependencyRefusals(commandRules));
    for (const rule of commandRules) {
      const refusal = graphRefusals.get(rule.id);
      if (refusal) {
        results.set(rule.id, {
          result: {
            exitCode: 1,
            diagnostics: [dependencyRefusalDiagnostic(rule, refusal)],
          },
          durationMs: 0,
          disposition: { kind: "dependency-refused", owner: "workspace-graph", reason: refusal },
        });
      }
    }
    yield* executeCommandRulesEffect(
      commandRules.filter((rule) => !graphRefusals.has(rule.id)),
      results
    );
    executeFileLayerRules(
      factsForRuleIds(activeRuleFileLayerFacts, selectedRuleIds),
      results,
      options
    );

    return results;
  });
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

function executeCommandRulesEffect(
  commandRules: readonly RuleCommandExecutionFacts[],
  results: Map<string, RuleExecutionRecord>
): Effect.Effect<void, never, CommandRunner | CommandExecutor | HabitatConfig | HabitatClock> {
  return Effect.gen(function* () {
    const records = yield* Effect.all(commandRules.map(executeCommandRuleEffect), {
      concurrency: "unbounded",
    });
    for (const [ruleId, record] of records) results.set(ruleId, record);
  });
}

function executeCommandRuleEffect(
  rule: RuleCommandExecutionFacts
): Effect.Effect<
  [string, RuleExecutionRecord],
  never,
  CommandRunner | CommandExecutor | HabitatConfig | HabitatClock
> {
  return Effect.gen(function* () {
    const clock = yield* HabitatClock;
    const runner = yield* CommandRunner;
    const started = yield* clock.currentTimeMillis;
    const result = yield* runner
      .run({
        commandId: rule.id,
        kind: "workspace-tool",
        executable: rule.detect[0] ?? "",
        argv: rule.detect.slice(1),
        cwd: repoRoot,
        captureGitState: false,
      })
      .pipe(
        Effect.match({
          onFailure: (error) => commandProviderFailureResult(rule, error),
          onSuccess: (commandResult) => commandRuleResult(rule, commandResult),
        })
      );
    const durationMs = Math.max(0, (yield* clock.currentTimeMillis) - started);
    return [rule.id, { result, durationMs, disposition: { kind: "executed", durationMs } }];
  });
}

function commandRuleResult(
  rule: RuleCommandExecutionFacts,
  result: HabitatCommandResult
): RuleRunResult {
  return {
    exitCode: result.exit.code,
    diagnostics: ruleDiagnosticsFromCommandResult(rule, {
      exitCode: result.exit.code,
      stdout: result.stdout.text,
      stderr: result.stderr.text,
    }),
  };
}

function commandProviderFailureResult(
  rule: RuleCommandExecutionFacts,
  error: unknown
): RuleRunResult {
  return {
    exitCode: 1,
    diagnostics: [
      {
        ruleId: rule.id,
        path: ".",
        message: `${rule.message}\n--- command provider failure ---\n${renderRuleExecutionError(error)}`,
        severity: rule.lane === "advisory" ? "advisory" : "error",
        baselined: false,
      },
    ],
  };
}

function renderRuleExecutionError(error: unknown): string {
  return isHabitatError(error)
    ? renderHabitatError(error)
    : error instanceof Error
      ? error.message
      : String(error);
}

function isHabitatError(error: unknown): error is HabitatError {
  return Boolean(error && typeof error === "object" && "_tag" in error);
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

type StagedPathActionReadResult = StagedMutationPath[] | { ok: false; message: string };

function isStagedPathReadFailure(
  result: StagedPathActionReadResult | undefined
): result is { ok: false; message: string } {
  return Boolean(result && "ok" in result && !result.ok);
}

function currentStagedPathActions(): StagedPathActionReadResult {
  const result = runSyncSpawnCommand(["git", "diff", "--cached", "--name-status", "-z"], {
    cwd: repoRoot,
  });
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
  const result = runSyncSpawnCommand(["git", "diff", "--cached", "--name-only", "-z"], {
    cwd: repoRoot,
  });
  if (result.exitCode !== 0 || !result.stdout) return [];
  return result.stdout.split("\0").filter(Boolean).map(toRepoRelative);
}

function sortedUnique(values: readonly string[]): string[] {
  return [...new Set(values)].sort();
}

function pathExt(candidate: string): string {
  const index = candidate.lastIndexOf(".");
  return index === -1 ? "" : candidate.slice(index);
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
