import type { FileSystem } from "@effect/platform";
import type { CommandExecutor } from "@effect/platform/CommandExecutor";
import {
  modifiedStagedPaths,
  runFileLayerProtectedMutationRule,
  type StagedMutationPath,
  stagedPathsFromNameStatus,
} from "@internal/habitat-harness/core/domains/protected-zones/index";
import {
  type RuleRunResult,
  ruleDiagnosticsFromCommandResult,
} from "@internal/habitat-harness/core/rules/architecture";
import type { HabitatConfig } from "@internal/habitat-harness/substrate/config/index";
import {
  type HabitatError,
  renderHabitatError,
} from "@internal/habitat-harness/substrate/errors/index";
import { repoRoot, toRepoRelative } from "@internal/habitat-harness/substrate/lib/paths";
import { BiomeProvider } from "@internal/habitat-harness/substrate/providers/biome/index";
import {
  CommandRunner,
  type HabitatCommandResult,
} from "@internal/habitat-harness/substrate/providers/command/index";
import {
  GitProvider,
  type GitProviderRequirements,
  type GitStateProvider,
} from "@internal/habitat-harness/substrate/providers/git/index";
import {
  NxProvider,
  type NxProviderService,
  spawnResultFromCommandResult,
} from "@internal/habitat-harness/substrate/providers/nx/index";
import { Clock, Effect } from "effect";
import {
  activeRuleCommandExecutionFacts,
  activeRuleFileLayerFacts,
  activeRuleGraphFacts,
  activeRuleHookCheckFacts,
  activeRuleSourceFacts,
  factsForRuleIds,
} from "../rule-registry/active-facts.js";
import type {
  RuleCommandExecutionFacts,
  RuleFileLayerFacts,
  RuleGraphFacts,
  RuleSelectorFacts,
  RuleSourceFacts,
} from "../rule-registry/index.js";
import type { RuleSelection } from "../rule-selection/index.js";
import {
  approvedSourceScanRootsForRules,
  SourceCheck,
  stagedSourceScanRoots,
} from "../source-check/index.js";
import { notApplicableDiagnostic } from "./disposition-diagnostics.js";
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
  options: {
    selection?: RuleSelection;
    hookCheck?: boolean;
    sourceRuleFacts?: readonly RuleSourceFacts[];
    staged?: boolean;
    stagedPaths?: readonly string[];
  } = {}
): RuleSelectorFacts[] {
  const rules = shouldUseDefaultLocalLane(options)
    ? selectedRules.filter((rule) => defaultLocalRuleTools.has(rule.ownerTool))
    : [...selectedRules];
  if (!options.hookCheck) return rules;
  const hookRuleIds = new Set(activeRuleHookCheckFacts.map((rule) => rule.id));
  return rules.filter((rule) => rule.ownerTool !== "source-check" || hookRuleIds.has(rule.id));
}

const defaultLocalRuleTools = new Set(["command-check", "file-layer", "habitat", "source-check"]);

function shouldUseDefaultLocalLane(options: { selection?: RuleSelection; staged?: boolean }) {
  if (options.staged) return false;
  const selection = options.selection ?? {};
  return !selection.owner && !selection.rule && !selection.tool;
}

export function stagedSourceCheckPaths(
  stagedPaths: readonly string[],
  approvedScanRoots: readonly string[] = approvedScanRootsForRules(activeRuleSourceFacts)
): string[] {
  return stagedSourceScanRoots(stagedPaths, approvedScanRoots);
}

export function approvedScanRootsForRules(rules: readonly RuleSourceFacts[]): string[] {
  return approvedSourceScanRootsForRules(rules);
}

export function stagedSourceCheckNotApplicableRecords(
  sourceRules: readonly RuleSourceFacts[],
  scanRoots: readonly string[]
): Map<string, RuleExecutionRecord> | undefined {
  if (scanRoots.length > 0) return undefined;
  return new Map(
    sourceRules.map((rule) => [
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
    const sourceRules = factsForRuleIds(activeRuleSourceFacts, selectedRuleIds);
    if (sourceRules.length > 0) {
      const scanRoots = options.staged
        ? stagedSourceCheckPaths(
            options.stagedPaths ?? (yield* currentStagedPathsEffect()),
            approvedScanRootsForRules(sourceRules)
          )
        : undefined;
      const stagedNotApplicable =
        options.staged && scanRoots
          ? stagedSourceCheckNotApplicableRecords(sourceRules, scanRoots)
          : undefined;
      if (stagedNotApplicable) {
        for (const [ruleId, record] of stagedNotApplicable) results.set(ruleId, record);
      } else {
        const sourceCheck = yield* SourceCheck;
        const started = yield* Clock.currentTimeMillis;
        const sourceResults = yield* sourceCheck.runSourceRules(
          sourceRules,
          scanRoots ? { scanRoots } : {}
        );
        const durationMs = Math.max(0, (yield* Clock.currentTimeMillis) - started);
        for (const rule of sourceRules) {
          const result = sourceResults.get(rule.id);
          if (result) {
            results.set(rule.id, {
              result,
              durationMs,
              timing: sharedExecutionTiming("source-check:source-rules", durationMs, sourceRules),
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
    yield* executeFormatRulesEffect(
      commandRules.filter((rule) => rule.ownerTool === "format-check"),
      results
    );
    const remainingCommandRules = commandRules.filter((rule) => rule.ownerTool !== "format-check");
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

function executeCommandRulesEffect(
  commandRules: readonly RuleCommandExecutionFacts[],
  results: Map<string, RuleExecutionRecord>
): Effect.Effect<void, never, CommandRunner | CommandExecutor | HabitatConfig | GitStateProvider> {
  return Effect.gen(function* () {
    const groupResults = yield* Effect.all(
      commandRuleExecutionGroups(commandRules).map(executeCommandRuleGroupEffect),
      {
        concurrency: "unbounded",
      }
    );
    for (const groupResult of groupResults) {
      for (const [ruleId, record] of groupResult) results.set(ruleId, record);
    }
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

interface CommandRuleExecutionGroup {
  readonly executable: string;
  readonly argv: readonly string[];
  readonly cwd: string;
  readonly rules: readonly RuleCommandExecutionFacts[];
}

function commandRuleExecutionGroups(
  rules: readonly RuleCommandExecutionFacts[]
): CommandRuleExecutionGroup[] {
  const groups = new Map<string, CommandRuleExecutionGroup>();
  for (const rule of rules) {
    const executable = rule.detect[0] ?? "";
    const argv = rule.detect.slice(1);
    const key = JSON.stringify({ executable, argv, cwd: repoRoot });
    const current = groups.get(key);
    groups.set(key, {
      executable,
      argv,
      cwd: repoRoot,
      rules: current ? [...current.rules, rule] : [rule],
    });
  }
  return [...groups.values()];
}

function executeCommandRuleGroupEffect(
  group: CommandRuleExecutionGroup
): Effect.Effect<
  Map<string, RuleExecutionRecord>,
  never,
  CommandRunner | CommandExecutor | HabitatConfig | GitStateProvider
> {
  return Effect.gen(function* () {
    const runner = yield* CommandRunner;
    const started = yield* Clock.currentTimeMillis;
    const result = yield* runner
      .run({
        commandId: commandRuleGroupId(group),
        kind: "workspace-tool",
        executable: group.executable,
        argv: group.argv,
        cwd: group.cwd,
        captureGitState: false,
      })
      .pipe(
        Effect.match({
          onFailure: (error) => ({ kind: "provider-failure" as const, error }),
          onSuccess: (commandResult) => ({ kind: "completed" as const, commandResult }),
        })
      );
    const durationMs = Math.max(0, (yield* Clock.currentTimeMillis) - started);
    const records = new Map<string, RuleExecutionRecord>();
    for (const rule of group.rules) {
      records.set(rule.id, {
        result:
          result.kind === "provider-failure"
            ? commandProviderFailureResult(rule, result.error)
            : commandRuleResult(rule, result.commandResult),
        durationMs,
        timing: sharedExecutionTiming(commandTimingGroupId(group), durationMs, group.rules),
        disposition: { kind: "executed", durationMs },
      });
    }
    return records;
  });
}

function commandRuleGroupId(group: CommandRuleExecutionGroup): string {
  if (group.rules.length === 1) return group.rules[0]?.id ?? "command-rule";
  return `command-rules:${group.rules.map((rule) => rule.id).join("+")}`;
}

function commandTimingGroupId(group: CommandRuleExecutionGroup): string {
  return `command:${[group.executable, ...group.argv].join(" ")}`;
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
