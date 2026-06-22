import {
  type SpawnResult,
  spawnResultFromCommandProviderError,
  spawnResultFromCommandResult,
} from "@internal/habitat-harness/resources/command/index";
import {
  approvedScanRootsForRules,
  type CheckReport,
  checkCommandContext,
  type HookCheckSummary,
  hookCheckSummary,
  renderCheckReport,
  stagedSourceCheckPaths,
} from "@internal/habitat-harness/service/model/check/policy/structural/index";
import { prePushTargetPlanForChangedPaths } from "@internal/habitat-harness/service/model/graph/policy/validation-routing.policy";
import {
  activeRuleHookCheckFacts,
  activeRuleSourceFacts,
  factsForRuleIds,
} from "@internal/habitat-harness/service/model/rules/policy/active-facts.policy";
import { Effect } from "effect";
import {
  type HookCheckCommandResult,
  type PreCommitOutcome,
  renderResourceDecisionFailure,
  resourceDecisionToFacade,
} from "./model/index.js";
import { finalizePreCommitEffect, finalizePrePushEffect } from "./model/policy/lifecycle.policy.js";
import { captureRepoSnapshotEffect } from "./model/policy/repo-snapshot.policy.js";
import { classifyResourcePreCommitDecisionEffect } from "./model/policy/resource-inspection.policy.js";
import {
  createHookOutput,
  type HookRuntime,
  hookNow,
  section,
} from "./model/policy/runtime.policy.js";
import {
  biomeHookPaths,
  existingStagedPathsEffect,
  fileHash,
  gitAddEffect,
  hookSourceCheckPaths,
  unstagedAmongEffect,
} from "./model/policy/staged-worktree.policy.js";
import { type HabitatServiceRequirements, type HookModuleContext, module } from "./module.js";

type BiomeCommandRequest = Parameters<HookModuleContext["biome"]["run"]>[0];
type StagedHookCheckTool = "file-layer" | "source-check";
type StagedHookCheckResult = SpawnResult & {
  readonly check: {
    readonly report: CheckReport;
    readonly summary: HookCheckSummary;
  };
};
type HookOutput = ReturnType<typeof createHookOutput>;
interface PreCommitState {
  readonly context: HookModuleContext;
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
  run: module.run.effect(function* ({ context, input = {} }) {
    if (input.name === "pre-push") {
      const runtime = context.runtime ?? {};
      const baseDecision = input.base
        ? ({
            kind: "resolved",
            base: input.base,
            source: "explicit",
          } satisfies PrePushBaseDecision)
        : yield* resolvePrePushBase(context, runtime);
      const output = createHookOutput(runtime.reporter);
      output.writeStdout(localHookNotice);

      if (runtime.trace) {
        runtime.trace.prePush = {
          outcome: "started",
          startedAtMs: yield* hookNow(runtime),
        };
      }
      if (runtime.trace?.prePush) {
        runtime.trace.prePush.preState = yield* captureRepoSnapshotEffect(context, runtime);
      }
      if (baseDecision.kind === "refused") {
        output.writeStderr(`habitat hook pre-push: ${baseDecision.message}\n`);
        return yield* finalizePrePushEffect(context, runtime, "base-refused", {
          exitCode: 1,
          ...output.result(),
        });
      }
      const base = baseDecision.base;
      if (runtime.trace?.prePush) runtime.trace.prePush.base = base;
      if (runtime.trace?.prePush) runtime.trace.prePush.baseSource = baseDecision.source;
      const changedPaths = yield* prePushChangedPaths(context, base);
      if (changedPaths.kind === "unavailable") {
        output.writeStderr(`habitat hook pre-push: ${changedPaths.message}\n`);
        return yield* finalizePrePushEffect(context, runtime, "affected-failed", {
          exitCode: 1,
          ...output.result(),
        });
      }
      const hookSourcePaths = prePushHookSourceCheckPaths(changedPaths.paths);
      if (hookSourcePaths.length > 0) {
        const hookSourceCheck = yield* prePushHookSourceCheck(context, runtime, hookSourcePaths);
        output.writeStdout(
          section("source-check changed-path hook check", renderCheckReport(hookSourceCheck.report))
        );
        if (!checkSummaryAllowsNextStage(hookSourceCheck)) {
          return yield* finalizePrePushEffect(context, runtime, "affected-failed", {
            exitCode: hookSourceCheck.exitCode,
            ...output.result(),
          });
        }
      } else {
        output.writeStdout(
          "source checks: no changed TypeScript/JavaScript/docs files in hook source-check roots\n"
        );
      }
      const targetPlan = prePushTargetPlanForChangedPaths(
        changedPaths.paths,
        context.workspaceGraphTargetNames()
      );
      for (const target of targetPlan.runTargets) {
        const argv = context.nx.runTargetArgv(target);
        const startedAtMs = yield* hookNow(runtime);
        const targetResult = yield* context.nx.runTarget(target).pipe(
          Effect.match({
            onFailure: spawnResultFromCommandProviderError,
            onSuccess: spawnResultFromCommandResult,
          })
        );
        yield* recordHookCommand(
          context,
          runtime,
          "pre-push-target",
          argv,
          startedAtMs,
          targetResult.exitCode
        );
        output.writeStdout(
          `habitat hook pre-push: repo Nx target ${target.project}:${target.target}\n${targetResult.stdout}`
        );
        output.writeStderr(targetResult.stderr);
        if (targetResult.exitCode !== 0) {
          return yield* finalizePrePushEffect(context, runtime, "affected-failed", {
            exitCode: targetResult.exitCode,
            ...output.result(),
          });
        }
      }
      if (targetPlan.affectedTargets.length === 0) {
        output.writeStdout("habitat hook pre-push: no repo Nx affected targets selected\n");
        return yield* finalizePrePushEffect(context, runtime, "pass", {
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
      const argv = context.nx.affectedArgv(request);
      const startedAtMs = yield* hookNow(runtime);
      const result = yield* context.nx.affected(request).pipe(
        Effect.match({
          onFailure: spawnResultFromCommandProviderError,
          onSuccess: spawnResultFromCommandResult,
        })
      );
      yield* recordHookCommand(
        context,
        runtime,
        "pre-push-affected",
        argv,
        startedAtMs,
        result.exitCode
      );
      output.writeStdout(`habitat hook pre-push: repo Nx affected base=${base}\n${result.stdout}`);
      output.writeStderr(result.stderr);
      return yield* finalizePrePushEffect(
        context,
        runtime,
        result.exitCode === 0 ? "pass" : "affected-failed",
        {
          exitCode: result.exitCode,
          ...output.result(),
        }
      );
    }

    if (input.name === "pre-commit") {
      const runtime = context.runtime ?? {};
      const begun = yield* beginPreCommit(context, runtime);
      if (begun.kind === "done") {
        return yield* finalizePreCommitEffect(context, runtime, begun.outcome, begun.result);
      }
      const fileLayer = yield* stagedHookCheck(
        context,
        begun.state.runtime,
        "file-layer",
        begun.state.staged
      );
      const afterFileLayer = yield* continuePreCommitAfterFileLayer(begun.state, fileLayer);
      if (afterFileLayer.kind === "done") {
        return yield* finalizePreCommitEffect(
          context,
          begun.state.runtime,
          afterFileLayer.outcome,
          afterFileLayer.result
        );
      }
      const afterBiome = yield* preCommitBiomeProviderStep(afterFileLayer.state);
      if (afterBiome.kind === "done") {
        return yield* finalizePreCommitEffect(
          context,
          afterFileLayer.state.runtime,
          afterBiome.outcome,
          afterBiome.result
        );
      }

      const sourceCheckResult =
        afterBiome.state.sourceCheckPaths.length > 0
          ? yield* stagedHookCheck(
              context,
              afterBiome.state.runtime,
              "source-check",
              afterBiome.state.sourceCheckPaths
            )
          : undefined;
      return yield* finishPreCommit(afterBiome.state, sourceCheckResult);
    }

    return unknownHookResult(input.name);
  }),
};

export const router = hookRouter;

function unknownHookResult(name: string | undefined): SpawnResult {
  return {
    exitCode: 2,
    stdout: "",
    stderr: `Unknown Habitat hook '${name ?? "(missing)"}'. Expected pre-commit or pre-push.\n`,
  };
}

function beginPreCommit(
  context: HookModuleContext,
  runtime: HookRuntime = {}
): Effect.Effect<PreCommitStep<PreCommitState>, never, HabitatServiceRequirements> {
  const output = createHookOutput(runtime.reporter);
  output.writeStdout("habitat hook pre-commit\n");
  output.writeStdout(localHookNotice);

  return Effect.gen(function* () {
    const startedAtMs = yield* hookNow(runtime);
    const resourceDecision = yield* classifyResourcePreCommitDecisionEffect(context, runtime);
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
      runtime.trace.preCommit.preState = yield* captureRepoSnapshotEffect(
        context,
        runtime,
        resources.kind
      );
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
    const stagedStartedAtMs = yield* hookNow(runtime);
    const staged = yield* existingStagedPathsEffect(context.git, context.repoRoot, runtime);
    yield* recordHookCommand(
      context,
      runtime,
      "staged-paths",
      ["git", "diff", "--cached", "--name-status", "-z"],
      stagedStartedAtMs,
      0
    );
    if (runtime.trace?.preCommit) runtime.trace.preCommit.stagedPaths = staged;

    return { kind: "continue", state: { context, runtime, output, staged, hashFile } };
  });
}

function continuePreCommitAfterFileLayer(
  state: PreCommitState,
  fileLayer: StagedHookCheckResult
): Effect.Effect<PreCommitStep<PreCommitBiomeState>, never, HabitatServiceRequirements> {
  const { context, hashFile, output, runtime, staged } = state;
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
    const partialStartedAtMs = yield* hookNow(runtime);
    const partials = yield* unstagedAmongEffect(context.git, context.repoRoot, biomePaths);
    yield* recordHookCommand(
      context,
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
      } satisfies PreCommitStep<PreCommitBiomeState>;
    }
    const beforeHashes = new Map(biomePaths.map((candidate) => [candidate, hashFile(candidate)]));
    return {
      kind: "continue",
      state: { ...state, biomePaths, beforeHashes },
    } satisfies PreCommitStep<PreCommitBiomeState>;
  });
}

function preCommitBiomeProviderStep(
  state: PreCommitBiomeState
): Effect.Effect<PreCommitStep<PreCommitSourceCheckState>, never, HabitatServiceRequirements> {
  const { beforeHashes, biomePaths, context, hashFile, output, runtime } = state;
  if (biomePaths.length === 0) {
    output.writeStdout("biome: no staged supported files\n");
    return Effect.succeed(continuePreCommitAfterBiome(state));
  }

  return Effect.gen(function* () {
    const formatRequest: BiomeCommandRequest = {
      kind: "format",
      write: true,
      noErrorsOnUnmatched: true,
      paths: biomePaths,
    };
    const formatArgv = context.biome.argv(formatRequest);
    const formatStartedAtMs = yield* hookNow(runtime);
    const format = yield* context.biome.run(formatRequest).pipe(
      Effect.match({
        onFailure: spawnResultFromCommandProviderError,
        onSuccess: spawnResultFromCommandResult,
      })
    );
    yield* recordHookCommand(
      context,
      runtime,
      "biome-format",
      formatArgv,
      formatStartedAtMs,
      format.exitCode
    );
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
      const restageStartedAtMs = yield* hookNow(runtime);
      const restage = yield* gitAddEffect(context.git, context.repoRoot, touched);
      yield* recordHookCommand(
        context,
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
    const checkArgv = context.biome.argv(checkRequest);
    const checkStartedAtMs = yield* hookNow(runtime);
    const check = yield* context.biome.run(checkRequest).pipe(
      Effect.match({
        onFailure: spawnResultFromCommandProviderError,
        onSuccess: spawnResultFromCommandResult,
      })
    );
    yield* recordHookCommand(
      context,
      runtime,
      "biome-check",
      checkArgv,
      checkStartedAtMs,
      check.exitCode
    );
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

function finishPreCommit(
  state: PreCommitSourceCheckState,
  sourceCheckResult: StagedHookCheckResult | undefined
): Effect.Effect<SpawnResult, never, HabitatServiceRequirements> {
  const { context, output, runtime } = state;
  if (state.sourceCheckPaths.length > 0) {
    if (!sourceCheckResult) {
      return finalizePreCommitEffect(context, runtime, "command-failed", {
        exitCode: 1,
        ...output.result(),
      });
    }
    output.writeStdout(section("source check", sourceCheckResult.stdout));
    output.writeStderr(sourceCheckResult.stderr);
    const sourceCheck = stagedHookCheckCommandResult(sourceCheckResult);
    if (sourceCheck.kind !== "parsed") {
      if (sourceCheckResult.exitCode !== 0 && sourceCheck.kind === "missing-json") {
        return finalizePreCommitEffect(context, runtime, "command-failed", {
          exitCode: sourceCheckResult.exitCode,
          ...output.result(),
        });
      }
      output.writeStderr("habitat hook pre-commit: could not parse Habitat source check JSON.\n");
      return finalizePreCommitEffect(context, runtime, "parse-failed", {
        exitCode: 1,
        ...output.result(),
      });
    }
    if (!checkSummaryAllowsNextStage(sourceCheck)) {
      if (sourceCheck.summary.kind === "diagnostic-unavailable") {
        output.writeStderr("habitat hook pre-commit: could not parse source check JSON output.\n");
        return finalizePreCommitEffect(context, runtime, "parse-failed", {
          exitCode: 1,
          ...output.result(),
        });
      }
      return finalizePreCommitEffect(context, runtime, "finding", {
        exitCode: 1,
        ...output.result(),
      });
    }
  } else {
    output.writeStdout(
      "source checks: no staged TypeScript/JavaScript files in approved source-check roots\n"
    );
  }

  output.writeStdout("habitat hook pre-commit: PASS\n");
  return finalizePreCommitEffect(context, runtime, "pass", { exitCode: 0, ...output.result() });
}

function prePushChangedPaths(
  context: HookModuleContext,
  base: string
): Effect.Effect<PrePushChangedPathsResult, never, HabitatServiceRequirements> {
  return Effect.gen(function* () {
    const result = yield* context.git
      .command(["diff", "--name-only", "-z", base, "HEAD"], { cwd: context.repoRoot })
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

function prePushHookSourceCheck(
  context: HookModuleContext,
  runtime: HookRuntime,
  changedPaths: readonly string[]
): Effect.Effect<PrePushHookSourceCheckResult, never, HabitatServiceRequirements> {
  return Effect.gen(function* () {
    const argv = ["--hook-check", "--tool", "source-check", "--json"];
    const startedAtMs = yield* hookNow(runtime);
    const report = yield* context.structuralCheck.createReport({
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
    yield* recordInProcessHookCheck(context, runtime, "source-check", argv, startedAtMs, exitCode);
    return { ...result, exitCode };
  });
}

function resolvePrePushBase(
  context: HookModuleContext,
  runtime: HookRuntime
): Effect.Effect<PrePushBaseDecision, never, HabitatServiceRequirements> {
  return Effect.gen(function* () {
    const startedAtMs = yield* hookNow(runtime);
    const parent = yield* context.graphite.parent({ cwd: context.repoRoot });
    yield* recordHookCommand(
      context,
      runtime,
      "pre-push-base",
      ["gt", "branch", "info", "--no-interactive"],
      startedAtMs,
      parent ? 0 : 1
    );
    if (parent) return { kind: "resolved" as const, base: parent, source: "graphite-parent" };

    const defaultBranch = yield* context.git.remoteDefaultBranch({ cwd: context.repoRoot });
    const base = defaultBranch
      ? yield* context.git.mergeBase(defaultBranch, { cwd: context.repoRoot })
      : null;
    if (base) return { kind: "resolved" as const, base, source: "merge-base" };
    return {
      kind: "refused" as const,
      message:
        "could not resolve an affected base from Graphite parent or the remote default branch; pass --base explicitly.",
    };
  });
}

function stagedHookCheck(
  context: HookModuleContext,
  runtime: HookRuntime,
  tool: StagedHookCheckTool,
  stagedPaths: readonly string[]
): Effect.Effect<StagedHookCheckResult, never, HabitatServiceRequirements> {
  return Effect.gen(function* () {
    const argv = ["--staged", "--tool", tool, "--json"];
    const startedAtMs = yield* hookNow(runtime);
    const report = yield* context.structuralCheck.createReport({
      tool,
      staged: true,
      stagedPaths,
      command: checkCommandContext(argv),
    });
    const result = {
      ...spawnResultFromCheckReport(report),
      check: { report, summary: hookCheckSummary(report) },
    };
    yield* recordInProcessHookCheck(context, runtime, tool, argv, startedAtMs, result.exitCode);
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
  context: HookModuleContext,
  runtime: HookRuntime,
  phase: StagedHookCheckTool,
  argv: readonly string[],
  startedAtMs: number,
  exitCode: number
): Effect.Effect<void> {
  return Effect.gen(function* () {
    const endedAtMs = yield* hookNow(runtime);
    runtime.trace?.commands.push({
      phase,
      argv: ["habitat", "check", ...argv],
      cwd: context.repoRoot,
      env: undefined,
      exitCode,
      startedAtMs,
      endedAtMs,
      durationMs: Math.max(0, endedAtMs - startedAtMs),
    });
  });
}

function recordHookCommand(
  context: HookModuleContext,
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
): Effect.Effect<void> {
  return Effect.gen(function* () {
    const endedAtMs = yield* hookNow(runtime);
    runtime.trace?.commands.push({
      phase,
      argv: [...argv],
      cwd: context.repoRoot,
      env: undefined,
      exitCode,
      startedAtMs,
      endedAtMs,
      durationMs: Math.max(0, endedAtMs - startedAtMs),
    });
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
