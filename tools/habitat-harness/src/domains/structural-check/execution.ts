import type { FileSystem } from "@effect/platform";
import type { CommandExecutor } from "@effect/platform/CommandExecutor";
import { Clock, Effect } from "effect";
import type { HabitatConfig } from "../../config/index.js";
import { type HabitatError, renderHabitatError } from "../../errors/index.js";
import { repoRoot, toRepoRelative } from "../../lib/paths.js";
import {
  modifiedStagedPaths,
  runFileLayerProtectedMutationRule,
  type StagedMutationPath,
  stagedPathsFromNameStatus,
} from "../../lib/protected-zones/index.js";
import { BiomeProvider } from "../../providers/biome/index.js";
import { CommandRunner, type HabitatCommandResult } from "../../providers/command/index.js";
import {
  GitProvider,
  type GitProviderRequirements,
  type GitStateProvider,
} from "../../providers/git/index.js";
import { readWorkspaceGraph } from "../../providers/nx/graph.js";
import {
  NxProvider,
  type NxProviderService,
  spawnResultFromCommandResult,
} from "../../providers/nx/index.js";
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
  RuleGraphFacts,
  RulePatternFacts,
  RuleSelectorFacts,
} from "../rule-registry/index.js";
import {
  approvedSourceScanRootsForRules,
  SourceCheck,
  stagedSourceScanRoots,
} from "../source-check/index.js";
import { ruleAliasTargetState } from "../workspace-graph-integration/index.js";
import { dependencyRefusalDiagnostic, notApplicableDiagnostic } from "./disposition-diagnostics.js";
import type { CheckOptions } from "./request.js";
import type { HabitatDiagnostic, RuleExecutionDisposition, RuleExecutionTiming } from "./schema.js";

export interface RuleExecutionRecord {
  result: RuleRunResult;
  durationMs: number;
  timing?: RuleExecutionTiming;
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
  return stagedSourceScanRoots(stagedPaths, approvedScanRoots);
}

export function approvedScanRootsForRules(rules: readonly RulePatternFacts[]): string[] {
  return approvedSourceScanRootsForRules(rules);
}

export function stagedPatternNotApplicableRecords(
  gritRules: readonly RulePatternFacts[],
  scanRoots: readonly string[]
): Map<string, RuleExecutionRecord> | undefined {
  if (scanRoots.length > 0) return undefined;
  return new Map(
    gritRules.map((rule) => [
      rule.id,
      {
        result: {
          exitCode: 1,
          diagnostics: [notApplicableDiagnostic(rule, "staged-scope-no-approved-roots")],
        },
        durationMs: 0,
        disposition: { kind: "not-applicable", reason: "staged-scope-no-approved-roots" },
      },
    ])
  );
}

export function executeSelectedRulesEffect(
  selectedRules: readonly RuleSelectorFacts[],
  options: Pick<CheckOptions, "staged" | "stagedPaths"> = {}
): Effect.Effect<
  Map<string, RuleExecutionRecord>,
  never,
  | BiomeProvider
  | CommandRunner
  | NxProvider
  | CommandExecutor
  | SourceCheck
  | HabitatConfig
  | FileSystem.FileSystem
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
      const stagedNotApplicable =
        options.staged && scanRoots
          ? stagedPatternNotApplicableRecords(gritRules, scanRoots)
          : undefined;
      if (stagedNotApplicable) {
        for (const [ruleId, record] of stagedNotApplicable) results.set(ruleId, record);
      } else {
        const sourceCheck = yield* SourceCheck;
        const started = yield* Clock.currentTimeMillis;
        const sourceResults = yield* sourceCheck.runPatternRules(
          gritRules,
          scanRoots ? { scanRoots } : {}
        );
        const durationMs = Math.max(0, (yield* Clock.currentTimeMillis) - started);
        for (const rule of gritRules) {
          const result = sourceResults.get(rule.id);
          if (result) {
            results.set(rule.id, {
              result,
              durationMs,
              timing: sharedExecutionTiming("source-check:pattern-rules", durationMs, gritRules),
              disposition: { kind: "executed", durationMs },
            });
          }
        }
      }
    }

    const commandRules = factsForRuleIds(activeRuleCommandExecutionFacts, selectedRuleIds);
    const graphRulesById = factsByRuleId(
      factsForRuleIds(
        activeRuleGraphFacts,
        commandRules.map((rule) => rule.id)
      )
    );
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
    const executableCommandRules = commandRules.filter((rule) => !graphRefusals.has(rule.id));
    yield* executeFormatRulesEffect(
      executableCommandRules.filter((rule) => rule.ownerTool === "format-check"),
      results
    );
    const remainingCommandRules = executableCommandRules.filter(
      (rule) => rule.ownerTool !== "format-check"
    );
    const graphBackedRules = remainingCommandRules.filter((rule) =>
      isGraphBackedCommandRule(rule, graphRulesById)
    );
    yield* executeGraphBackedCommandRulesEffect(graphBackedRules, graphRulesById, results);
    yield* executeCommandRulesEffect(
      remainingCommandRules.filter((rule) => !isGraphBackedCommandRule(rule, graphRulesById)),
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

function executeFormatRulesEffect(
  formatRules: readonly RuleCommandExecutionFacts[],
  results: Map<string, RuleExecutionRecord>
): Effect.Effect<
  void,
  never,
  BiomeProvider | CommandRunner | CommandExecutor | HabitatConfig | GitStateProvider
> {
  return Effect.gen(function* () {
    const records = yield* Effect.all(formatRules.map(executeFormatRuleEffect), {
      concurrency: "unbounded",
    });
    for (const [ruleId, record] of records) results.set(ruleId, record);
  });
}

function executeFormatRuleEffect(
  rule: RuleCommandExecutionFacts
): Effect.Effect<
  [string, RuleExecutionRecord],
  never,
  BiomeProvider | CommandRunner | CommandExecutor | HabitatConfig | GitStateProvider
> {
  return Effect.gen(function* () {
    const biome = yield* BiomeProvider;
    const started = yield* Clock.currentTimeMillis;
    const result = yield* biome.run({ kind: "ci" }).pipe(
      Effect.match({
        onFailure: (error) => commandProviderFailureResult(rule, error),
        onSuccess: (commandResult) => commandRuleResult(rule, commandResult),
      })
    );
    const durationMs = Math.max(0, (yield* Clock.currentTimeMillis) - started);
    return [rule.id, { result, durationMs, disposition: { kind: "executed", durationMs } }];
  });
}

function isGraphBackedCommandRule(
  rule: RuleCommandExecutionFacts,
  graphRulesById: ReadonlyMap<string, RuleGraphFacts>
): boolean {
  return graphRulesById.get(rule.id)?.alias.kind === "depends-on";
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
): Effect.Effect<void, never, CommandRunner | CommandExecutor | HabitatConfig | GitStateProvider> {
  return Effect.gen(function* () {
    const records = yield* Effect.all(commandRules.map(executeCommandRuleEffect), {
      concurrency: "unbounded",
    });
    for (const [ruleId, record] of records) results.set(ruleId, record);
  });
}

function executeGraphBackedCommandRulesEffect(
  rules: readonly RuleCommandExecutionFacts[],
  graphRulesById: ReadonlyMap<string, RuleGraphFacts>,
  results: Map<string, RuleExecutionRecord>
): Effect.Effect<
  void,
  never,
  NxProvider | CommandRunner | CommandExecutor | HabitatConfig | GitStateProvider
> {
  if (rules.length === 0) return Effect.void;
  const groups = groupedGraphBackedCommandRules(rules);
  return Effect.gen(function* () {
    const groupResults = yield* Effect.all(
      groups.map((group) => runGraphBackedCommandRuleGroup(group, graphRulesById)),
      { concurrency: "unbounded" }
    );
    for (const groupResult of groupResults) {
      for (const [ruleId, record] of groupResult) results.set(ruleId, record);
    }
  });
}

function runGraphBackedCommandRuleGroup(
  rules: readonly RuleCommandExecutionFacts[],
  graphRulesById: ReadonlyMap<string, RuleGraphFacts>
): Effect.Effect<
  Map<string, RuleExecutionRecord>,
  never,
  NxProvider | CommandRunner | CommandExecutor | HabitatConfig | GitStateProvider
> {
  return Effect.gen(function* () {
    const targets = graphTargetsForRules(rules, graphRulesById);
    const nx = yield* NxProvider;
    const started = yield* Clock.currentTimeMillis;
    const execution = yield* runGraphTargetsEffect(nx, targets).pipe(
      Effect.match({
        onFailure: (error) => ({ kind: "provider-failure" as const, error }),
        onSuccess: (commandResult) => ({
          kind: "completed" as const,
          result: spawnResultFromCommandResult(commandResult),
        }),
      })
    );
    const durationMs = Math.max(0, (yield* Clock.currentTimeMillis) - started);
    const records = new Map<string, RuleExecutionRecord>();
    for (const rule of rules) {
      const ruleResult =
        execution.kind === "provider-failure"
          ? commandProviderFailureResult(rule, execution.error)
          : {
              exitCode: execution.result.exitCode,
              diagnostics: ruleDiagnosticsFromCommandResult(rule, execution.result),
            };
      records.set(rule.id, {
        result: ruleResult,
        durationMs,
        timing: sharedExecutionTiming("nx:graph-targets", durationMs, rules),
        disposition: { kind: "executed", durationMs },
      });
    }
    return records;
  });
}

function sharedExecutionTiming(
  groupId: string,
  durationMs: number,
  rules: readonly { id: string }[]
): RuleExecutionTiming | undefined {
  if (rules.length < 2) return undefined;
  return {
    kind: "shared",
    groupId,
    durationMs,
    ruleCount: rules.length,
  };
}

function runGraphTargetsEffect(
  nx: NxProviderService,
  targets: readonly { project: string; target: string }[]
) {
  const uniqueTargets = uniqueGraphTargets(targets);
  if (uniqueTargets.length === 1) {
    const [target] = uniqueTargets;
    return nx.runTarget(target);
  }
  return nx.runMany({
    projects: sortedUnique(uniqueTargets.map((target) => target.project)),
    targets: sortedUnique(uniqueTargets.map((target) => target.target)),
  });
}

function uniqueGraphTargets(
  targets: readonly { project: string; target: string }[]
): Array<{ project: string; target: string }> {
  const seen = new Set<string>();
  const unique: Array<{ project: string; target: string }> = [];
  for (const target of targets) {
    const key = `${target.project}:${target.target}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(target);
  }
  return unique;
}

function groupedGraphBackedCommandRules(
  rules: readonly RuleCommandExecutionFacts[]
): RuleCommandExecutionFacts[][] {
  const groups = new Map<string, RuleCommandExecutionFacts[]>();
  for (const rule of rules) {
    const group = groups.get(rule.ownerTool) ?? [];
    group.push(rule);
    groups.set(rule.ownerTool, group);
  }
  return [...groups.values()];
}

function graphTargetsForRules(
  rules: readonly RuleCommandExecutionFacts[],
  graphRulesById: ReadonlyMap<string, RuleGraphFacts>
): Array<{ project: string; target: string }> {
  return rules.map((rule) => {
    const graphRule = graphRulesById.get(rule.id);
    if (graphRule?.alias.kind !== "depends-on") {
      throw new Error(`habitat internal error: missing graph target for ${rule.id}`);
    }
    return graphRule.alias.target;
  });
}

function executeCommandRuleEffect(
  rule: RuleCommandExecutionFacts
): Effect.Effect<
  [string, RuleExecutionRecord],
  never,
  CommandRunner | CommandExecutor | HabitatConfig | GitStateProvider
> {
  return Effect.gen(function* () {
    const runner = yield* CommandRunner;
    const started = yield* Clock.currentTimeMillis;
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
    const durationMs = Math.max(0, (yield* Clock.currentTimeMillis) - started);
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

function sortedUnique(values: readonly string[]): string[] {
  return [...new Set(values)].sort();
}

function factsByRuleId<T extends { id: string }>(facts: readonly T[]): Map<string, T> {
  return new Map(facts.map((fact) => [fact.id, fact]));
}

function isHabitatError(error: unknown): error is HabitatError {
  return Boolean(error && typeof error === "object" && "_tag" in error);
}

function executeFileLayerRulesEffect(
  fileLayerRules: readonly RuleFileLayerFacts[],
  results: Map<string, RuleExecutionRecord>,
  options: Pick<CheckOptions, "staged" | "stagedPaths">
): Effect.Effect<void, never, GitProvider | GitProviderRequirements> {
  return Effect.gen(function* () {
    const stagedPathsResult =
      options.staged && options.stagedPaths
        ? modifiedStagedPaths(options.stagedPaths)
        : options.staged
          ? yield* currentStagedPathActionsEffect()
          : undefined;
    for (const rule of fileLayerRules) {
      const started = yield* Clock.currentTimeMillis;
      if (isStagedPathReadFailure(stagedPathsResult)) {
        const durationMs = Math.max(0, (yield* Clock.currentTimeMillis) - started);
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
      const durationMs = Math.max(0, (yield* Clock.currentTimeMillis) - started);
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
