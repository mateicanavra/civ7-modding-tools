import type { CommandExecutor } from "@effect/platform/CommandExecutor";
import { Effect } from "effect";
import { runGritRulesEffect, validateScanRoots } from "../../adapters/grit/index.js";
import { GritProvider, type GritProviderRequirements } from "../../adapters/grit/provider/index.js";
import type { HabitatConfig } from "../../config/index.js";
import { type HabitatError, renderHabitatError } from "../../errors/index.js";
import { repoRoot, toRepoRelative } from "../../lib/paths.js";
import {
  modifiedStagedPaths,
  runFileLayerProtectedMutationRule,
  type StagedMutationPath,
  stagedPathsFromNameStatus,
} from "../../lib/protected-zones/index.js";
import { CommandRunner, type HabitatCommandResult } from "../../providers/command/index.js";
import { GitProvider, type GitProviderRequirements } from "../../providers/git/index.js";
import { readWorkspaceGraph } from "../../providers/nx/graph.js";
import { HabitatClock } from "../../resources/index.js";
import { type RuleRunResult, ruleDiagnosticsFromCommandResult } from "../../rules/architecture.js";
import {
  activeRuleCommandExecutionFacts,
  activeRuleFileLayerFacts,
  activeRuleGraphFacts,
  activeRulePatternFacts,
  factsForRuleIds,
} from "../rule-registry/active-facts.js";
import type {
  RuleCommandExecutionFacts,
  RuleFileLayerFacts,
  RulePatternFacts,
  RuleSelectorFacts,
} from "../rule-registry/index.js";
import { ruleAliasTargetState } from "../workspace-graph-integration/index.js";
import { dependencyRefusalDiagnostic, notApplicableDiagnostic } from "./disposition-diagnostics.js";
import type { CheckOptions } from "./request.js";
import type { HabitatDiagnostic, RuleExecutionDisposition } from "./schema.js";

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
  | GitProvider
  | GitProviderRequirements
> {
  return Effect.gen(function* () {
    const results = new Map<string, RuleExecutionRecord>();
    const selectedRuleIds = selectedRules.map((rule) => rule.id);
    const gritRules = factsForRuleIds(activeRulePatternFacts, selectedRuleIds);
    if (gritRules.length > 0) {
      const scanRoots = options.staged
        ? stagedPatternScanRoots(
            options.stagedPaths ?? (yield* currentStagedPathsEffect()),
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
    yield* executeFileLayerRulesEffect(
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

function executeFileLayerRulesEffect(
  fileLayerRules: readonly RuleFileLayerFacts[],
  results: Map<string, RuleExecutionRecord>,
  options: Pick<CheckOptions, "staged" | "stagedPaths">
): Effect.Effect<void, never, HabitatClock | GitProvider | GitProviderRequirements> {
  return Effect.gen(function* () {
    const clock = yield* HabitatClock;
    const stagedPathsResult =
      options.staged && options.stagedPaths
        ? modifiedStagedPaths(options.stagedPaths)
        : options.staged
          ? yield* currentStagedPathActionsEffect()
          : undefined;
    for (const rule of fileLayerRules) {
      const started = yield* clock.currentTimeMillis;
      if (isStagedPathReadFailure(stagedPathsResult)) {
        const durationMs = Math.max(0, (yield* clock.currentTimeMillis) - started);
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
      const durationMs = Math.max(0, (yield* clock.currentTimeMillis) - started);
      results.set(rule.id, { result, durationMs, disposition: { kind: "executed", durationMs } });
    }
  });
}

type StagedPathActionReadResult = StagedMutationPath[] | { ok: false; message: string };

function isStagedPathReadFailure(
  result: StagedPathActionReadResult | undefined
): result is { ok: false; message: string } {
  return Boolean(result && "ok" in result && !result.ok);
}

function currentStagedPathActionsEffect(): Effect.Effect<
  StagedPathActionReadResult,
  never,
  GitProvider | GitProviderRequirements
> {
  return Effect.gen(function* () {
    const git = yield* GitProvider;
    const result = yield* git.diffNameStatus({ cached: true, cwd: repoRoot }).pipe(Effect.either);
    if (result._tag === "Left") {
      return {
        ok: false,
        message: renderHabitatError(result.left),
      };
    }
    if (result.right.exit.code !== 0) {
      return {
        ok: false,
        message:
          result.right.stderr.text.trim() ||
          `Unable to read staged path actions with git diff --cached --name-status -z (exit ${result.right.exit.code}).`,
      };
    }
    if (!result.right.stdout.text) return [];
    return stagedPathsFromNameStatus(result.right.stdout.text);
  });
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

function currentStagedPathsEffect(): Effect.Effect<
  string[],
  never,
  GitProvider | GitProviderRequirements
> {
  return Effect.gen(function* () {
    const git = yield* GitProvider;
    const result = yield* git.diffNameOnly({ cached: true, cwd: repoRoot }).pipe(Effect.either);
    if (result._tag === "Left" || result.right.exit.code !== 0 || !result.right.stdout.text) {
      return [];
    }
    return result.right.stdout.text.split("\0").filter(Boolean).map(toRepoRelative);
  });
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
