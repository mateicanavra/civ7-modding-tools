import type { FileSystem } from "@effect/platform";
import type { CommandExecutor } from "@effect/platform/CommandExecutor";
import type { BaselineAuthority } from "@internal/habitat-harness/core/domains/baseline-authority/index";
import {
  type HookCheckCommandResult,
  type PreCommitOutcome,
  renderResourceDecisionFailure,
  resourceDecisionToFacade,
} from "@internal/habitat-harness/core/domains/hook-runtime/index";
import {
  finalizePreCommitEffect,
  finalizePrePushEffect,
} from "@internal/habitat-harness/core/domains/hook-runtime/lifecycle";
import { captureRepoSnapshotEffect } from "@internal/habitat-harness/core/domains/hook-runtime/repo-snapshot";
import { classifyResourcePreCommitDecisionEffect } from "@internal/habitat-harness/core/domains/hook-runtime/resource-inspection";
import {
  createHookOutput,
  type HookRuntime,
  hookNow,
  section,
} from "@internal/habitat-harness/core/domains/hook-runtime/runtime";
import {
  biomeHookPaths,
  existingStagedPathsEffect,
  fileHash,
  gitAddEffect,
  hookSourceCheckPaths,
  unstagedAmongEffect,
} from "@internal/habitat-harness/core/domains/hook-runtime/staged-worktree";
import {
  activeRuleHookCheckFacts,
  activeRuleSourceFacts,
  factsForRuleIds,
} from "@internal/habitat-harness/core/domains/rule-registry/active-facts";
import type { SourceCheck } from "@internal/habitat-harness/core/domains/source-check/index";
import {
  approvedScanRootsForRules,
  type CheckReport,
  checkCommandContext,
  type HookCheckSummary,
  hookCheckSummary,
  renderCheckReport,
  StructuralCheck,
  stagedSourceCheckPaths,
} from "@internal/habitat-harness/core/domains/structural-check/index";
import { prePushTargetPlanForChangedPaths } from "@internal/habitat-harness/core/domains/validation-routing/index";
import type { HabitatConfig } from "@internal/habitat-harness/substrate/config/index";
import { repoRoot } from "@internal/habitat-harness/substrate/lib/paths";
import {
  type BiomeCommandRequest,
  BiomeProvider,
} from "@internal/habitat-harness/substrate/providers/biome/index";
import {
  type CommandRunner,
  type SpawnResult,
  spawnResultFromCommandProviderError,
  spawnResultFromCommandResult,
} from "@internal/habitat-harness/substrate/providers/command/index";
import {
  GitProvider,
  type GitProviderRequirements,
} from "@internal/habitat-harness/substrate/providers/git/index";
import {
  GraphiteProvider,
  type GraphiteProviderRequirements,
} from "@internal/habitat-harness/substrate/providers/graphite/index";
import type {
  GritProvider,
  GritProviderRequirements,
} from "@internal/habitat-harness/substrate/providers/grit/index";
import { NxProvider } from "@internal/habitat-harness/substrate/providers/nx/index";
import { workspaceGraphTargetNames } from "@internal/habitat-harness/substrate/providers/nx/targets";
import { Effect } from "effect";
import { type HookServiceModuleContext, hookModule } from "./context.js";
import type { HookServiceRunInput } from "./contract.js";

type StagedHookCheckTool = "file-layer" | "source-check";
type StagedHookCheckResult = SpawnResult & {
  readonly check: {
    readonly report: CheckReport;
    readonly summary: HookCheckSummary;
  };
};
type HookCheckRequirements =
  | BaselineAuthority
  | BiomeProvider
  | CommandRunner
  | NxProvider
  | CommandExecutor
  | SourceCheck
  | HabitatConfig
  | FileSystem.FileSystem
  | GitProvider
  | GitProviderRequirements
  | GritProvider
  | GritProviderRequirements
  | GraphiteProvider
  | GraphiteProviderRequirements
  | StructuralCheck;
type HookOutput = ReturnType<typeof createHookOutput>;
interface PreCommitState {
  readonly runtime: HookRuntime;
  readonly output: HookOutput;
  readonly staged: readonly string[];
  readonly hashFile: (repoRelativePath: string) => string | null;
}

interface PreCommitBiomeState extends PreCommitState {
  readonly biomePaths: readonly string[];
  readonly beforeHashes: ReadonlyMap<string, string | null>;
}

interface PreCommitSourceCheckState extends PreCommitState {
  readonly sourceCheckPaths: readonly string[];
}

type PreCommitStep<T> =
  | { readonly kind: "done"; readonly outcome: PreCommitOutcome; readonly result: SpawnResult }
  | { readonly kind: "continue"; readonly state: T };
type PrePushChangedPathsResult =
  | { readonly kind: "available"; readonly paths: readonly string[] }
  | { readonly kind: "unavailable"; readonly message: string };
type PrePushBaseDecision =
  | {
      readonly kind: "resolved";
      readonly base: string;
      readonly source: "explicit" | "graphite-parent" | "merge-base";
    }
  | {
      readonly kind: "refused";
      readonly message: string;
    };
type ParsedHookCheckResult = Extract<HookCheckCommandResult, { readonly kind: "parsed" }>;
type PrePushHookSourceCheckResult = SpawnResult & ParsedHookCheckResult;

const localHookNotice = "hook result: workstation check only; CI remains authoritative.\n";

export const hookRouter = {
  run: hookModule.run.effect(({ context, input }) => runHookService(input, context)),
};

export const router = hookRouter;

export function runHookService(
  input: HookServiceRunInput = {},
  options: HookServiceModuleContext = {}
) {
  if (input.name === "pre-push") {
    const runtime = options.runtime ?? {};
    return Effect.gen(function* () {
      const baseDecision = input.base
        ? { kind: "resolved" as const, base: input.base, source: "explicit" as const }
        : yield* resolvePrePushBaseForService(runtime);
      return yield* runPrePushWithBaseDecisionEffect(baseDecision, runtime);
    });
  }
  if (input.name === "pre-commit") return runPreCommitEffect(options.runtime ?? {});
  return Effect.succeed(unknownHookResult(input.name));
}

function unknownHookResult(name: string | undefined): SpawnResult {
  return {
    exitCode: 2,
    stdout: "",
    stderr: `Unknown Habitat hook '${name ?? "(missing)"}'. Expected pre-commit or pre-push.\n`,
  };
}

function runPreCommitEffect(
  runtime: HookRuntime = {}
): Effect.Effect<SpawnResult, never, HookCheckRequirements> {
  return Effect.gen(function* () {
    const begun = yield* beginPreCommitEffect(runtime);
    if (begun.kind === "done") {
      return yield* finalizePreCommitEffect(runtime, begun.outcome, begun.result);
    }
    const fileLayer = yield* runStagedHookCheckServiceEffect(
      begun.state.runtime,
      "file-layer",
      begun.state.staged
    );
    const afterFileLayer = yield* continuePreCommitAfterFileLayerEffect(begun.state, fileLayer);
    if (afterFileLayer.kind === "done") {
      return yield* finalizePreCommitEffect(
        begun.state.runtime,
        afterFileLayer.outcome,
        afterFileLayer.result
      );
    }
    const afterBiome = yield* runPreCommitBiomeProviderEffect(afterFileLayer.state);
    if (afterBiome.kind === "done") {
      return yield* finalizePreCommitEffect(
        afterFileLayer.state.runtime,
        afterBiome.outcome,
        afterBiome.result
      );
    }

    const sourceCheckResult =
      afterBiome.state.sourceCheckPaths.length > 0
        ? yield* runStagedHookCheckServiceEffect(
            afterBiome.state.runtime,
            "source-check",
            afterBiome.state.sourceCheckPaths
          )
        : undefined;
    return yield* finishPreCommitEffect(afterBiome.state, sourceCheckResult);
  });
}

function beginPreCommitEffect(
  runtime: HookRuntime = {}
): Effect.Effect<PreCommitStep<PreCommitState>, never, HookCheckRequirements> {
  const startedAtMs = hookNow(runtime);
  const output = createHookOutput(runtime.reporter);
  output.writeStdout("habitat hook pre-commit\n");
  output.writeStdout(localHookNotice);

  return Effect.gen(function* () {
    const resourceDecision = yield* classifyResourcePreCommitDecisionEffect(runtime);
    const resources = resourceDecisionToFacade(resourceDecision);
    if (runtime.trace) {
      runtime.trace.preCommit = {
        resourceState: resources.kind,
        stagedPaths: [],
        biomePaths: [],
        sourceCheckPaths: [],
        partialPaths: [],
        formatterTouchedPaths: [],
        restagedPaths: [],
        outcome: "started",
        startedAtMs,
      };
      runtime.trace.preCommit.preState = yield* captureRepoSnapshotEffect(runtime, resources.kind);
    }
    output.writeStdout(`resources: ${resources.kind}\n`);
    if (!resources.allowPreCommit) {
      output.writeStderr(renderResourceDecisionFailure(resourceDecision));
      return {
        kind: "done",
        outcome: "resource-blocked",
        result: {
          exitCode: 1,
          ...output.result(),
        },
      };
    }

    const hashFile = runtime.fileHash ?? fileHash;
    const stagedStartedAtMs = hookNow(runtime);
    const staged = yield* existingStagedPathsEffect(runtime);
    recordHookCommand(
      runtime,
      "staged-paths",
      ["git", "diff", "--cached", "--name-status", "-z"],
      stagedStartedAtMs,
      0
    );
    if (runtime.trace?.preCommit) runtime.trace.preCommit.stagedPaths = staged;

    return { kind: "continue", state: { runtime, output, staged, hashFile } };
  });
}

function continuePreCommitAfterFileLayerEffect(
  state: PreCommitState,
  fileLayer: StagedHookCheckResult
): Effect.Effect<PreCommitStep<PreCommitBiomeState>, never, HookCheckRequirements> {
  const { hashFile, output, runtime, staged } = state;
  output.writeStdout(section("file-layer staged check", fileLayer.stdout));
  output.writeStderr(fileLayer.stderr);
  const fileLayerCheck = stagedHookCheckCommandResult(fileLayer);
  if (!checkSummaryAllowsNextStage(fileLayerCheck)) {
    if (fileLayerCheck.kind !== "parsed") {
      output.writeStderr("habitat hook pre-commit: could not parse file-layer check JSON.\n");
    }
    return Effect.succeed({
      kind: "done",
      outcome: "file-layer-failed",
      result: {
        exitCode: fileLayer.exitCode === 0 ? 1 : fileLayer.exitCode,
        ...output.result(),
      },
    });
  }

  const biomePaths = biomeHookPaths(staged);
  if (runtime.trace?.preCommit) runtime.trace.preCommit.biomePaths = biomePaths;
  return Effect.gen(function* () {
    const partialStartedAtMs = hookNow(runtime);
    const partials = yield* unstagedAmongEffect(biomePaths);
    recordHookCommand(
      runtime,
      "partial-staging",
      ["git", "diff", "--name-only", "-z", "--", ...biomePaths],
      partialStartedAtMs,
      0
    );
    if (runtime.trace?.preCommit) runtime.trace.preCommit.partialPaths = partials;
    if (partials.length > 0) {
      output.writeStderr(
        [
          "habitat hook pre-commit: refusing to format partially staged files.",
          "Stage or unstage each whole file before committing; Habitat does not stash or rewrite unstaged hunks.",
          ...partials.map((file) => `- ${file}`),
          "",
        ].join("\n")
      );
      return {
        kind: "done",
        outcome: "partial-staging-refused",
        result: {
          exitCode: 1,
          ...output.result(),
        },
      };
    }
    const beforeHashes = new Map(biomePaths.map((candidate) => [candidate, hashFile(candidate)]));
    return { kind: "continue", state: { ...state, biomePaths, beforeHashes } };
  });
}

function runPreCommitBiomeProviderEffect(
  state: PreCommitBiomeState
): Effect.Effect<PreCommitStep<PreCommitSourceCheckState>, never, HookCheckRequirements> {
  const { beforeHashes, biomePaths, hashFile, output, runtime } = state;
  if (biomePaths.length === 0) {
    output.writeStdout("biome: no staged supported files\n");
    return Effect.succeed(continuePreCommitAfterBiome(state));
  }

  return Effect.gen(function* () {
    const biome = yield* BiomeProvider;
    const formatRequest: BiomeCommandRequest = {
      kind: "format",
      write: true,
      noErrorsOnUnmatched: true,
      paths: biomePaths,
    };
    const formatArgv = biome.argv(formatRequest);
    const formatStartedAtMs = hookNow(runtime);
    const format = yield* biome.run(formatRequest).pipe(
      Effect.match({
        onFailure: spawnResultFromCommandProviderError,
        onSuccess: spawnResultFromCommandResult,
      })
    );
    recordHookCommand(runtime, "biome-format", formatArgv, formatStartedAtMs, format.exitCode);
    output.writeStdout(section("biome format", format.stdout));
    output.writeStderr(format.stderr);
    if (format.exitCode !== 0) {
      return {
        kind: "done",
        outcome: "biome-format-failed",
        result: {
          exitCode: format.exitCode,
          ...output.result(),
        },
      };
    }

    const touched = biomePaths.filter(
      (candidate) => beforeHashes.get(candidate) !== hashFile(candidate)
    );
    if (runtime.trace?.preCommit) runtime.trace.preCommit.formatterTouchedPaths = touched;
    if (touched.length > 0) {
      const restageStartedAtMs = hookNow(runtime);
      const restage = yield* gitAddEffect(touched);
      recordHookCommand(
        runtime,
        "formatter-restage",
        ["git", "add", "--", ...touched],
        restageStartedAtMs,
        restage.exitCode
      );
      output.writeStdout(section("formatter restage", restage.stdout));
      output.writeStderr(restage.stderr);
      if (restage.exitCode !== 0) {
        return {
          kind: "done",
          outcome: "formatter-restage-failed",
          result: {
            exitCode: restage.exitCode,
            ...output.result(),
          },
        };
      }
      if (runtime.trace?.preCommit) runtime.trace.preCommit.restagedPaths = touched;
      output.writeStdout(`formatter restage: ${touched.length} path(s)\n`);
    } else {
      output.writeStdout("formatter restage: 0 paths\n");
    }

    const checkRequest: BiomeCommandRequest = {
      kind: "check",
      noErrorsOnUnmatched: true,
      paths: biomePaths,
    };
    const checkArgv = biome.argv(checkRequest);
    const checkStartedAtMs = hookNow(runtime);
    const check = yield* biome.run(checkRequest).pipe(
      Effect.match({
        onFailure: spawnResultFromCommandProviderError,
        onSuccess: spawnResultFromCommandResult,
      })
    );
    recordHookCommand(runtime, "biome-check", checkArgv, checkStartedAtMs, check.exitCode);
    output.writeStdout(section("biome check", check.stdout));
    output.writeStderr(check.stderr);
    if (check.exitCode !== 0) {
      return {
        kind: "done",
        outcome: "biome-check-failed",
        result: {
          exitCode: check.exitCode,
          ...output.result(),
        },
      };
    }

    return continuePreCommitAfterBiome(state);
  });
}

function continuePreCommitAfterBiome(
  state: PreCommitBiomeState
): PreCommitStep<PreCommitSourceCheckState> {
  const { runtime, staged } = state;
  const sourceCheckPaths = hookSourceCheckPaths(staged);
  if (runtime.trace?.preCommit) runtime.trace.preCommit.sourceCheckPaths = sourceCheckPaths;
  return { kind: "continue", state: { ...state, sourceCheckPaths } };
}

function finishPreCommitEffect(
  state: PreCommitSourceCheckState,
  sourceCheckResult: StagedHookCheckResult | undefined
): Effect.Effect<SpawnResult, never, HookCheckRequirements> {
  const { output, runtime } = state;
  if (state.sourceCheckPaths.length > 0) {
    if (!sourceCheckResult) {
      return finalizePreCommitEffect(runtime, "command-failed", {
        exitCode: 1,
        ...output.result(),
      });
    }
    output.writeStdout(section("source check", sourceCheckResult.stdout));
    output.writeStderr(sourceCheckResult.stderr);
    const sourceCheck = stagedHookCheckCommandResult(sourceCheckResult);
    if (sourceCheck.kind !== "parsed") {
      if (sourceCheckResult.exitCode !== 0 && sourceCheck.kind === "missing-json") {
        return finalizePreCommitEffect(runtime, "command-failed", {
          exitCode: sourceCheckResult.exitCode,
          ...output.result(),
        });
      }
      output.writeStderr("habitat hook pre-commit: could not parse Habitat source check JSON.\n");
      return finalizePreCommitEffect(runtime, "parse-failed", {
        exitCode: 1,
        ...output.result(),
      });
    }
    if (!checkSummaryAllowsNextStage(sourceCheck)) {
      if (sourceCheck.summary.kind === "diagnostic-unavailable") {
        output.writeStderr("habitat hook pre-commit: could not parse source check JSON output.\n");
        return finalizePreCommitEffect(runtime, "parse-failed", {
          exitCode: 1,
          ...output.result(),
        });
      }
      return finalizePreCommitEffect(runtime, "finding", { exitCode: 1, ...output.result() });
    }
  } else {
    output.writeStdout(
      "source checks: no staged TypeScript/JavaScript files in approved source-check roots\n"
    );
  }

  output.writeStdout("habitat hook pre-commit: PASS\n");
  return finalizePreCommitEffect(runtime, "pass", { exitCode: 0, ...output.result() });
}

function runPrePushWithBaseDecisionEffect(
  baseDecision: PrePushBaseDecision,
  runtime: HookRuntime = {}
): Effect.Effect<SpawnResult, never, HookCheckRequirements> {
  const output = createHookOutput(runtime.reporter);
  output.writeStdout(localHookNotice);
  if (runtime.trace) {
    runtime.trace.prePush = {
      outcome: "started",
      startedAtMs: hookNow(runtime),
    };
  }

  return Effect.gen(function* () {
    if (runtime.trace?.prePush) {
      runtime.trace.prePush.preState = yield* captureRepoSnapshotEffect(runtime);
    }
    if (baseDecision.kind === "refused") {
      output.writeStderr(`habitat hook pre-push: ${baseDecision.message}\n`);
      return yield* finalizePrePushEffect(runtime, "base-refused", {
        exitCode: 1,
        ...output.result(),
      });
    }
    const base = baseDecision.base;
    if (runtime.trace?.prePush) runtime.trace.prePush.base = base;
    if (runtime.trace?.prePush) runtime.trace.prePush.baseSource = baseDecision.source;
    const changedPaths = yield* prePushChangedPathsEffect(base);
    if (changedPaths.kind === "unavailable") {
      output.writeStderr(`habitat hook pre-push: ${changedPaths.message}\n`);
      return yield* finalizePrePushEffect(runtime, "affected-failed", {
        exitCode: 1,
        ...output.result(),
      });
    }
    const hookSourcePaths = prePushHookSourceCheckPaths(changedPaths.paths);
    if (hookSourcePaths.length > 0) {
      const hookSourceCheck = yield* runPrePushHookSourceCheckEffect(runtime, hookSourcePaths);
      output.writeStdout(
        section("source-check changed-path hook check", renderCheckReport(hookSourceCheck.report))
      );
      if (!checkSummaryAllowsNextStage(hookSourceCheck)) {
        return yield* finalizePrePushEffect(runtime, "affected-failed", {
          exitCode: hookSourceCheck.exitCode,
          ...output.result(),
        });
      }
    } else {
      output.writeStdout(
        "source checks: no changed TypeScript/JavaScript/docs files in hook source-check roots\n"
      );
    }
    const nx = yield* NxProvider;
    const targetPlan = prePushTargetPlanForChangedPaths(
      changedPaths.paths,
      workspaceGraphTargetNames()
    );
    for (const target of targetPlan.runTargets) {
      const argv = nx.runTargetArgv(target);
      const startedAtMs = hookNow(runtime);
      const targetResult = yield* nx.runTarget(target).pipe(
        Effect.match({
          onFailure: spawnResultFromCommandProviderError,
          onSuccess: spawnResultFromCommandResult,
        })
      );
      recordHookCommand(runtime, "pre-push-target", argv, startedAtMs, targetResult.exitCode);
      output.writeStdout(
        `habitat hook pre-push: repo Nx target ${target.project}:${target.target}\n${targetResult.stdout}`
      );
      output.writeStderr(targetResult.stderr);
      if (targetResult.exitCode !== 0) {
        return yield* finalizePrePushEffect(runtime, "affected-failed", {
          exitCode: targetResult.exitCode,
          ...output.result(),
        });
      }
    }
    if (targetPlan.affectedTargets.length === 0) {
      output.writeStdout("habitat hook pre-push: no repo Nx affected targets selected\n");
      return yield* finalizePrePushEffect(runtime, "pass", {
        exitCode: 0,
        ...output.result(),
      });
    }
    const request = {
      base,
      targets: targetPlan.affectedTargets,
      head: "HEAD",
      excludeTaskDependencies: true,
    };
    const argv = nx.affectedArgv(request);
    const startedAtMs = hookNow(runtime);
    const result = yield* nx.affected(request).pipe(
      Effect.match({
        onFailure: spawnResultFromCommandProviderError,
        onSuccess: spawnResultFromCommandResult,
      })
    );
    recordHookCommand(runtime, "pre-push-affected", argv, startedAtMs, result.exitCode);
    output.writeStdout(`habitat hook pre-push: repo Nx affected base=${base}\n${result.stdout}`);
    output.writeStderr(result.stderr);
    return yield* finalizePrePushEffect(
      runtime,
      result.exitCode === 0 ? "pass" : "affected-failed",
      {
        exitCode: result.exitCode,
        ...output.result(),
      }
    );
  });
}

function prePushChangedPathsEffect(
  base: string
): Effect.Effect<PrePushChangedPathsResult, never, GitProvider | GitProviderRequirements> {
  return Effect.gen(function* () {
    const git = yield* GitProvider;
    const result = yield* git
      .command(["diff", "--name-only", "-z", base, "HEAD"], { cwd: repoRoot })
      .pipe(Effect.catchAll(() => Effect.succeed(undefined)));
    if (!result || result.exit.code !== 0) {
      return {
        kind: "unavailable",
        message: `could not read changed paths for base ${base}; refusing to skip hook source checks.`,
      };
    }
    return { kind: "available", paths: result.stdout.text.split("\0").filter(Boolean) };
  });
}

function prePushHookSourceCheckPaths(changedPaths: readonly string[]): readonly string[] {
  const hookRuleIds = activeRuleHookCheckFacts.map((rule) => rule.id);
  const hookSourceRules = factsForRuleIds(activeRuleSourceFacts, hookRuleIds);
  return stagedSourceCheckPaths(changedPaths, approvedScanRootsForRules(hookSourceRules));
}

function runPrePushHookSourceCheckEffect(
  runtime: HookRuntime,
  changedPaths: readonly string[]
): Effect.Effect<PrePushHookSourceCheckResult, never, HookCheckRequirements> {
  return Effect.gen(function* () {
    const structuralCheck = yield* StructuralCheck;
    const argv = ["--hook-check", "--tool", "source-check", "--json"];
    const startedAtMs = hookNow(runtime);
    const report = yield* structuralCheck.createReport({
      tool: "source-check",
      hookCheck: true,
      staged: true,
      stagedPaths: changedPaths,
      command: checkCommandContext(argv),
    });
    const summary = hookCheckSummary(report);
    const result = {
      ...spawnResultFromCheckReport(report),
      kind: "parsed" as const,
      report,
      summary,
    };
    const exitCode = checkSummaryAllowsNextStage(result) ? 0 : 1;
    recordInProcessHookCheck(runtime, "source-check", argv, startedAtMs, exitCode);
    return { ...result, exitCode };
  });
}

function resolvePrePushBaseForService(
  runtime: HookRuntime
): Effect.Effect<PrePushBaseDecision, never, HookCheckRequirements> {
  return Effect.gen(function* () {
    const graphite = yield* GraphiteProvider;
    const startedAtMs = hookNow(runtime);
    const parent = yield* graphite.parent({ cwd: repoRoot });
    recordHookCommand(
      runtime,
      "pre-push-base",
      ["gt", "branch", "info", "--no-interactive"],
      startedAtMs,
      parent ? 0 : 1
    );
    if (parent) return { kind: "resolved" as const, base: parent, source: "graphite-parent" };

    const git = yield* GitProvider;
    const defaultBranch = yield* git.remoteDefaultBranch({ cwd: repoRoot });
    const base = defaultBranch ? yield* git.mergeBase(defaultBranch, { cwd: repoRoot }) : null;
    if (base) return { kind: "resolved" as const, base, source: "merge-base" };
    return {
      kind: "refused" as const,
      message:
        "could not resolve an affected base from Graphite parent or the remote default branch; pass --base explicitly.",
    };
  });
}

function runStagedHookCheckServiceEffect(
  runtime: HookRuntime,
  tool: StagedHookCheckTool,
  stagedPaths: readonly string[]
): Effect.Effect<StagedHookCheckResult, never, HookCheckRequirements> {
  return Effect.gen(function* () {
    const structuralCheck = yield* StructuralCheck;
    const argv = ["--staged", "--tool", tool, "--json"];
    const startedAtMs = hookNow(runtime);
    const report = yield* structuralCheck.createReport({
      tool,
      staged: true,
      stagedPaths,
      command: checkCommandContext(argv),
    });
    const result = {
      ...spawnResultFromCheckReport(report),
      check: { report, summary: hookCheckSummary(report) },
    };
    recordInProcessHookCheck(runtime, tool, argv, startedAtMs, result.exitCode);
    return result;
  });
}

function spawnResultFromCheckReport(report: CheckReport): SpawnResult {
  return {
    exitCode: report.ok ? 0 : 1,
    stdout: `${renderCheckReport(report, { json: true })}\n`,
    stderr: "",
  };
}

function stagedHookCheckCommandResult(result: StagedHookCheckResult): HookCheckCommandResult {
  return {
    kind: "parsed",
    report: result.check.report,
    summary: result.check.summary,
  };
}

function recordInProcessHookCheck(
  runtime: HookRuntime,
  phase: StagedHookCheckTool,
  argv: readonly string[],
  startedAtMs: number,
  exitCode: number
) {
  const endedAtMs = hookNow(runtime);
  runtime.trace?.commands.push({
    phase,
    argv: ["habitat", "check", ...argv],
    cwd: repoRoot,
    env: undefined,
    exitCode,
    startedAtMs,
    endedAtMs,
    durationMs: Math.max(0, endedAtMs - startedAtMs),
  });
}

function recordHookCommand(
  runtime: HookRuntime,
  phase:
    | "partial-staging"
    | "staged-paths"
    | "formatter-restage"
    | "biome-format"
    | "biome-check"
    | "pre-push-base"
    | "pre-push-target"
    | "pre-push-affected",
  argv: readonly string[],
  startedAtMs: number,
  exitCode: number
) {
  const endedAtMs = hookNow(runtime);
  runtime.trace?.commands.push({
    phase,
    argv: [...argv],
    cwd: repoRoot,
    env: undefined,
    exitCode,
    startedAtMs,
    endedAtMs,
    durationMs: Math.max(0, endedAtMs - startedAtMs),
  });
}

function checkSummaryAllowsNextStage(result: HookCheckCommandResult): boolean {
  return (
    result.kind === "parsed" &&
    (result.summary.kind === "pass" ||
      result.summary.kind === "advisory-only" ||
      result.summary.kind === "not-applicable")
  );
}
