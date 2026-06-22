import path from "node:path";
import {
  type CommandProviderError,
  type HabitatCommandResult,
  type SpawnResult,
  spawnResultFromCommandProviderError,
  spawnResultFromCommandResult,
} from "@internal/habitat-harness/resources/command/index";
import type {
  HabitatServiceContext,
  HabitatServiceDeps,
  HabitatServiceRequirements,
  HabitatServiceRuntimeError,
} from "@internal/habitat-harness/service/base";
import type { HabitatServiceContract } from "@internal/habitat-harness/service/contract";
import { service } from "@internal/habitat-harness/service/impl";
import {
  type CheckOptions,
  type CheckReport,
  checkCommandContext,
  type HookCheckSummary,
  hookCheckSummary,
  renderCheckReport,
} from "@internal/habitat-harness/service/model/check/index";
import {
  createCheckReportEffect,
  type StructuralExecutionContext,
} from "@internal/habitat-harness/service/model/check/policy/structural/index";
import { prePushTargetPlanForChangedPaths } from "@internal/habitat-harness/service/model/graph/policy/validation-routing.policy";
import {
  factsForRuleIds,
  type RuleFactsCatalog,
} from "@internal/habitat-harness/service/model/rules/policy/catalog.policy";
import {
  approvedScanRootsForRules,
  stagedSourceCheckPaths,
} from "@internal/habitat-harness/service/model/source-check/index";
import { workspaceGraphTargetNames } from "@internal/habitat-harness/service/model/workspace/index";
import { Effect } from "effect";
import type { EffectImplementerInternal } from "effect-orpc";
import type { HookPreCommitInput } from "./contract.js";
import {
  type HookCheckCommandResult,
  type PreCommitOutcome,
  renderResourceDecisionFailure,
  resourceDecisionToFacade,
} from "./model/index.js";
import { finalizePreCommitEffect, finalizePrePushEffect } from "./model/policy/lifecycle.policy.js";
import { classifyResourcePreCommitDecisionEffect } from "./model/policy/resource-inspection.policy.js";
import {
  createHookOutput,
  type HookResourcePolicy,
  hookNow,
  section,
} from "./model/policy/runtime.policy.js";
import {
  biomeHookPaths,
  existingStagedPathsEffect,
  gitAddEffect,
  hookSourceCheckPaths,
  unstagedAmongEffect,
} from "./model/policy/staged-worktree.policy.js";

export type HookProcedureContext = {
  readonly biome: HookBiomePort;
  readonly git: HookGitPort;
  readonly graphite: HookGraphitePort;
  readonly nx: HookNxPort;
  readonly platform: HookPlatformPort;
  readonly reporter: HookReporterPort;
  readonly rules: RuleFactsCatalog;
  readonly createCheckReport: (options?: CheckOptions) => HookRouterEffect<CheckReport>;
  readonly workspaceGraphTargetNames: typeof workspaceGraphTargetNames;
};
export interface HookBiomeCommandRequest {
  readonly kind: "format" | "check";
  readonly paths?: readonly string[];
  readonly write?: boolean;
  readonly noErrorsOnUnmatched?: boolean;
}
export interface HookBiomePort {
  readonly argv: (request: HookBiomeCommandRequest) => string[];
  readonly run: (
    request: HookBiomeCommandRequest
  ) => Effect.Effect<HabitatCommandResult, CommandProviderError, any>;
}
export interface HookGitPort {
  readonly add: (
    paths: readonly string[],
    options?: { readonly cwd?: string }
  ) => Effect.Effect<HabitatCommandResult, CommandProviderError, any>;
  readonly command: (
    argv: readonly string[],
    options?: { readonly cwd?: string }
  ) => Effect.Effect<HabitatCommandResult, CommandProviderError, any>;
  readonly diffNameOnly: (input?: {
    readonly paths?: readonly string[];
    readonly cwd?: string;
  }) => Effect.Effect<HabitatCommandResult, CommandProviderError, any>;
  readonly diffNameStatus: (input?: {
    readonly cached?: boolean;
    readonly cwd?: string;
  }) => Effect.Effect<HabitatCommandResult, CommandProviderError, any>;
  readonly mergeBase: (
    ref: string,
    options?: { readonly cwd?: string }
  ) => Effect.Effect<string | null, never, any>;
  readonly remoteDefaultBranch: (options?: {
    readonly cwd?: string;
  }) => Effect.Effect<string | null, never, any>;
}
export interface HookGraphitePort {
  readonly parent: (options?: {
    readonly cwd?: string;
  }) => Effect.Effect<string | null, never, any>;
  readonly parentArgv: () => readonly string[];
}
export interface HookNxAffectedRequest {
  readonly base: string;
  readonly targets: readonly string[];
  readonly head?: string;
  readonly excludeTaskDependencies?: boolean;
}
export interface HookNxRunTargetRequest {
  readonly project: string;
  readonly target: string;
}
export interface HookNxPort {
  readonly affected: (
    request: HookNxAffectedRequest
  ) => Effect.Effect<HabitatCommandResult, CommandProviderError, any>;
  readonly affectedArgv: (request: HookNxAffectedRequest) => string[];
  readonly runTarget: (
    request: HookNxRunTargetRequest
  ) => Effect.Effect<HabitatCommandResult, CommandProviderError, any>;
  readonly runTargetArgv: (request: HookNxRunTargetRequest) => string[];
}
export interface HookPlatformPort {
  readonly hashFile: (filePath: string) => string | null;
  readonly pathExists: (targetPath: string) => boolean;
  readonly repoRoot: string;
}
type HookReportEvent =
  | { readonly kind: "stdout"; readonly text: string }
  | { readonly kind: "stderr"; readonly text: string }
  | { readonly kind: "trace"; readonly message: string };
export interface HookReporterPort {
  readonly emit: (event: HookReportEvent) => Effect.Effect<void>;
}
type BiomeCommandRequest = HookBiomeCommandRequest;
export type StagedHookCheckTool = "file-layer" | "source-check";
export type StagedHookCheckResult = SpawnResult & {
  readonly check: {
    readonly report: CheckReport;
    readonly summary: HookCheckSummary;
  };
};
export type HookOutput = ReturnType<typeof createHookOutput>;
export interface PreCommitState {
  readonly context: HookProcedureContext;
  readonly resourcePolicy?: HookResourcePolicy;
  readonly output: HookOutput;
  readonly staged: readonly string[];
}

export interface PreCommitBiomeState extends PreCommitState {
  readonly biomePaths: readonly string[];
  readonly beforeHashes: ReadonlyMap<string, string | null>;
}

export interface PreCommitSourceCheckState extends PreCommitState {
  readonly sourceCheckPaths: readonly string[];
}

export type PreCommitStep<T> =
  | { readonly kind: "done"; readonly outcome: PreCommitOutcome; readonly result: SpawnResult }
  | { readonly kind: "continue"; readonly state: T };
export type PrePushChangedPathsResult =
  | { readonly kind: "available"; readonly paths: readonly string[] }
  | { readonly kind: "unavailable"; readonly message: string };
export type PrePushBaseDecision =
  | {
      readonly kind: "resolved";
      readonly base: string;
      readonly source: "explicit" | "graphite-parent" | "merge-base";
    }
  | {
      readonly kind: "refused";
      readonly message: string;
    };
export type ParsedHookCheckResult = Extract<HookCheckCommandResult, { readonly kind: "parsed" }>;
export type PrePushHookSourceCheckResult = SpawnResult & ParsedHookCheckResult;
type HookRouterEffect<T> = Effect.Effect<T, never, any>;
const localHookNotice = "hook result: workstation check only; CI remains authoritative.\n";

export interface HookModuleContext {
  readonly beginPreCommit: (
    resourcePolicy: HookPreCommitInput["resourcePolicy"]
  ) => HookRouterEffect<PreCommitStep<PreCommitState>>;
  readonly checkSummaryAllowsNextStage: typeof checkSummaryAllowsNextStage;
  readonly continuePreCommitAfterFileLayer: typeof continuePreCommitAfterFileLayer;
  readonly createHookOutput: () => HookOutput;
  readonly finalizePreCommitEffect: typeof finalizePreCommitEffect;
  readonly finalizePrePushEffect: typeof finalizePrePushEffect;
  readonly finishPreCommit: typeof finishPreCommit;
  readonly hookNow: typeof hookNow;
  readonly hookResult: typeof hookResult;
  readonly localHookNotice: typeof localHookNotice;
  readonly preCommitBiomeProviderStep: typeof preCommitBiomeProviderStep;
  readonly prePushAffectedArgv: (request: HookNxAffectedRequest) => string[];
  readonly prePushChangedPaths: (base: string) => HookRouterEffect<PrePushChangedPathsResult>;
  readonly prePushHookSourceCheck: (
    changedPaths: readonly string[]
  ) => HookRouterEffect<PrePushHookSourceCheckResult>;
  readonly prePushHookSourceCheckPaths: (changedPaths: readonly string[]) => readonly string[];
  readonly prePushRunAffected: (request: HookNxAffectedRequest) => HookRouterEffect<SpawnResult>;
  readonly prePushRunTarget: (target: HookNxRunTargetRequest) => HookRouterEffect<SpawnResult>;
  readonly prePushRunTargetArgv: (target: HookNxRunTargetRequest) => string[];
  readonly prePushTargetPlanForChangedPaths: (
    changedPaths: readonly string[]
  ) => ReturnType<typeof prePushTargetPlanForChangedPaths>;
  readonly recordHookCommand: (
    phase: HookCommandRecordPhase,
    argv: readonly string[],
    startedAtMs: number,
    exitCode: number
  ) => Effect.Effect<void>;
  readonly renderCheckReport: typeof renderCheckReport;
  readonly resolvePrePushBase: () => HookRouterEffect<PrePushBaseDecision>;
  readonly section: typeof section;
  readonly stagedHookCheck: (
    tool: StagedHookCheckTool,
    stagedPaths: readonly string[]
  ) => HookRouterEffect<StagedHookCheckResult>;
}

type HookModule = EffectImplementerInternal<
  HabitatServiceContract["hook"],
  HabitatServiceContext,
  HabitatServiceContext & HookModuleContext,
  HabitatServiceRequirements,
  HabitatServiceRuntimeError
>;

export const module: HookModule = service.hook.use(({ context, next }) => {
  const hookContext = {
    biome: context.deps.biome,
    git: context.deps.git,
    graphite: context.deps.graphite,
    nx: context.deps.nx,
    platform: context.deps.platform,
    reporter: context.deps.reporter,
    rules: context.deps.rules,
    createCheckReport: (options) =>
      createCheckReport(
        { ...options, repoRoot: context.deps.platform.repoRoot },
        structuralExecutionContext(context.deps)
      ),
    workspaceGraphTargetNames,
  } satisfies HookProcedureContext;

  return next({
    context: {
      beginPreCommit: (resourcePolicy) => beginPreCommit(hookContext, resourcePolicy),
      checkSummaryAllowsNextStage,
      continuePreCommitAfterFileLayer,
      createHookOutput: () => createHookOutput(hookContext.reporter),
      finalizePreCommitEffect,
      finalizePrePushEffect,
      finishPreCommit,
      hookNow,
      hookResult,
      localHookNotice,
      preCommitBiomeProviderStep,
      prePushAffectedArgv: (request) => hookContext.nx.affectedArgv(request),
      prePushChangedPaths: (base) => prePushChangedPaths(hookContext, base),
      prePushHookSourceCheck: (changedPaths) => prePushHookSourceCheck(hookContext, changedPaths),
      prePushHookSourceCheckPaths: (changedPaths) =>
        prePushHookSourceCheckPaths(hookContext, changedPaths),
      prePushRunAffected: (request) => runPrePushAffected(hookContext, request),
      prePushRunTarget: (target) => runPrePushTarget(hookContext, target),
      prePushRunTargetArgv: (target) => hookContext.nx.runTargetArgv(target),
      prePushTargetPlanForChangedPaths: (changedPaths) =>
        prePushTargetPlanForChangedPaths(
          changedPaths,
          hookContext.workspaceGraphTargetNames(),
          hookContext.rules.artifactPath
        ),
      recordHookCommand: (phase, argv, startedAtMs, exitCode) =>
        recordHookCommand(hookContext, phase, argv, startedAtMs, exitCode),
      renderCheckReport,
      resolvePrePushBase: () => resolvePrePushBase(hookContext),
      section,
      stagedHookCheck: (tool, stagedPaths) => stagedHookCheck(hookContext, tool, stagedPaths),
    } satisfies HookModuleContext,
  });
});

function createCheckReport(options: CheckOptions, context: StructuralExecutionContext) {
  return createCheckReportEffect(options, context);
}

function structuralExecutionContext(deps: HabitatServiceDeps): StructuralExecutionContext {
  return {
    baselineFileSystem: {
      isDirectory: deps.platform.isDirectory,
      isFile: deps.platform.isFileEffect,
      makeDirectory: deps.platform.makeDirectory,
      readDirectory: deps.platform.readDirectory,
      readText: deps.platform.readText,
      writeText: deps.platform.writeText,
    },
    biome: deps.biome,
    command: deps.commandRunner,
    git: deps.git,
    grit: {
      runRules: deps.grit.runRules,
    },
    nx: deps.nx,
    repoRoot: deps.platform.repoRoot,
    rules: deps.rules,
    sourceFileSystem: {
      isDirectory: deps.platform.isDirectory,
      isFile: deps.platform.isFileEffect,
      readDirectory: deps.platform.readDirectory,
      readText: deps.platform.readText,
    },
  };
}

function hookResult(output: HookOutput, exitCode: number): HookRouterEffect<SpawnResult> {
  return output.flush().pipe(Effect.as({ exitCode, ...output.result() }));
}

function hashRepoRelativeFile(
  context: HookProcedureContext,
  repoRelativePath: string
): string | null {
  return context.platform.hashFile(path.join(context.platform.repoRoot, repoRelativePath));
}

function beginPreCommit(
  context: HookProcedureContext,
  resourcePolicy?: HookResourcePolicy
): HookRouterEffect<PreCommitStep<PreCommitState>> {
  const output = createHookOutput(context.reporter);
  output.writeStdout("habitat hook pre-commit\n");
  output.writeStdout(localHookNotice);

  return Effect.gen(function* () {
    const resourceDecision = yield* classifyResourcePreCommitDecisionEffect(
      context,
      resourcePolicy
    );
    const resources = resourceDecisionToFacade(resourceDecision);
    output.writeStdout(`resources: ${resources.kind}\n`);
    if (!resources.allowPreCommit) {
      output.writeStderr(renderResourceDecisionFailure(resourceDecision));
      return {
        kind: "done",
        outcome: "resource-blocked",
        result: yield* hookResult(output, 1),
      };
    }

    const stagedStartedAtMs = yield* hookNow();
    const staged = yield* existingStagedPathsEffect(
      context.git,
      context.platform.repoRoot,
      context.platform.pathExists
    );
    yield* recordHookCommand(
      context,
      "staged-paths",
      ["git", "diff", "--cached", "--name-status", "-z"],
      stagedStartedAtMs,
      0
    );
    return {
      kind: "continue",
      state: { context, resourcePolicy, output, staged },
    };
  });
}

function continuePreCommitAfterFileLayer(
  state: PreCommitState,
  fileLayer: StagedHookCheckResult
): HookRouterEffect<PreCommitStep<PreCommitBiomeState>> {
  return Effect.gen(function* () {
    const { context, output, staged } = state;
    output.writeStdout(section("file-layer staged check", fileLayer.stdout));
    output.writeStderr(fileLayer.stderr);
    const fileLayerCheck = stagedHookCheckCommandResult(fileLayer);
    if (!checkSummaryAllowsNextStage(fileLayerCheck)) {
      if (fileLayerCheck.kind !== "parsed") {
        output.writeStderr("habitat hook pre-commit: could not parse file-layer check JSON.\n");
      }
      return {
        kind: "done",
        outcome: "file-layer-failed",
        result: yield* hookResult(output, fileLayer.exitCode === 0 ? 1 : fileLayer.exitCode),
      };
    }

    const biomePaths = biomeHookPaths(staged);
    const partialStartedAtMs = yield* hookNow();
    const partials = yield* unstagedAmongEffect(context.git, context.platform.repoRoot, biomePaths);
    yield* recordHookCommand(
      context,
      "partial-staging",
      ["git", "diff", "--name-only", "-z", "--", ...biomePaths],
      partialStartedAtMs,
      0
    );
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
        result: yield* hookResult(output, 1),
      } satisfies PreCommitStep<PreCommitBiomeState>;
    }
    const beforeHashes = new Map(
      biomePaths.map((candidate) => [candidate, hashRepoRelativeFile(context, candidate)])
    );
    return {
      kind: "continue",
      state: { ...state, biomePaths, beforeHashes },
    } satisfies PreCommitStep<PreCommitBiomeState>;
  });
}

function preCommitBiomeProviderStep(
  state: PreCommitBiomeState
): HookRouterEffect<PreCommitStep<PreCommitSourceCheckState>> {
  const { beforeHashes, biomePaths, context, output } = state;
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
    const formatStartedAtMs = yield* hookNow();
    const format = yield* context.biome.run(formatRequest).pipe(
      Effect.match({
        onFailure: spawnResultFromCommandProviderError,
        onSuccess: spawnResultFromCommandResult,
      })
    );
    yield* recordHookCommand(
      context,
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
        result: yield* hookResult(output, format.exitCode),
      };
    }

    const touched = biomePaths.filter(
      (candidate) => beforeHashes.get(candidate) !== hashRepoRelativeFile(context, candidate)
    );
    if (touched.length > 0) {
      const restageStartedAtMs = yield* hookNow();
      const restage = yield* gitAddEffect(context.git, context.platform.repoRoot, touched);
      yield* recordHookCommand(
        context,
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
          result: yield* hookResult(output, restage.exitCode),
        };
      }
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
    const checkStartedAtMs = yield* hookNow();
    const check = yield* context.biome.run(checkRequest).pipe(
      Effect.match({
        onFailure: spawnResultFromCommandProviderError,
        onSuccess: spawnResultFromCommandResult,
      })
    );
    yield* recordHookCommand(context, "biome-check", checkArgv, checkStartedAtMs, check.exitCode);
    output.writeStdout(section("biome check", check.stdout));
    output.writeStderr(check.stderr);
    if (check.exitCode !== 0) {
      return {
        kind: "done",
        outcome: "biome-check-failed",
        result: yield* hookResult(output, check.exitCode),
      };
    }

    return continuePreCommitAfterBiome(state);
  });
}

function continuePreCommitAfterBiome(
  state: PreCommitBiomeState
): PreCommitStep<PreCommitSourceCheckState> {
  const { context, staged } = state;
  const sourceCheckPaths = hookSourceCheckPaths(
    staged,
    context.platform.repoRoot,
    hookSourceCheckApprovedRoots(context)
  );
  return { kind: "continue", state: { ...state, sourceCheckPaths } };
}

function finishPreCommit(
  state: PreCommitSourceCheckState,
  sourceCheckResult: StagedHookCheckResult | undefined
): HookRouterEffect<SpawnResult> {
  return Effect.gen(function* () {
    const { output } = state;
    if (state.sourceCheckPaths.length > 0) {
      if (!sourceCheckResult) {
        return yield* finalizePreCommitEffect("command-failed", yield* hookResult(output, 1));
      }
      output.writeStdout(section("source check", sourceCheckResult.stdout));
      output.writeStderr(sourceCheckResult.stderr);
      const sourceCheck = stagedHookCheckCommandResult(sourceCheckResult);
      if (sourceCheck.kind !== "parsed") {
        if (sourceCheckResult.exitCode !== 0 && sourceCheck.kind === "missing-json") {
          return yield* finalizePreCommitEffect(
            "command-failed",
            yield* hookResult(output, sourceCheckResult.exitCode)
          );
        }
        output.writeStderr("habitat hook pre-commit: could not parse Habitat source check JSON.\n");
        return yield* finalizePreCommitEffect("parse-failed", yield* hookResult(output, 1));
      }
      if (!checkSummaryAllowsNextStage(sourceCheck)) {
        if (sourceCheck.summary.kind === "diagnostic-unavailable") {
          output.writeStderr(
            "habitat hook pre-commit: could not parse source check JSON output.\n"
          );
          return yield* finalizePreCommitEffect("parse-failed", yield* hookResult(output, 1));
        }
        return yield* finalizePreCommitEffect("finding", yield* hookResult(output, 1));
      }
    } else {
      output.writeStdout(
        "source checks: no staged TypeScript/JavaScript files in approved source-check roots\n"
      );
    }

    output.writeStdout("habitat hook pre-commit: PASS\n");
    return yield* finalizePreCommitEffect("pass", yield* hookResult(output, 0));
  });
}

function prePushChangedPaths(
  context: HookProcedureContext,
  base: string
): HookRouterEffect<PrePushChangedPathsResult> {
  return Effect.gen(function* () {
    const result = yield* context.git
      .command(["diff", "--name-only", "-z", base, "HEAD"], { cwd: context.platform.repoRoot })
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

function prePushHookSourceCheckPaths(
  context: HookProcedureContext,
  changedPaths: readonly string[]
): readonly string[] {
  return stagedSourceCheckPaths(changedPaths, hookSourceCheckApprovedRoots(context), {
    repoRoot: context.platform.repoRoot,
  });
}

function hookSourceCheckApprovedRoots(context: HookProcedureContext): string[] {
  const hookRuleIds = context.rules.hookCheck.map((rule) => rule.id);
  return approvedScanRootsForRules(factsForRuleIds(context.rules.source, hookRuleIds));
}

function prePushHookSourceCheck(
  context: HookProcedureContext,
  changedPaths: readonly string[]
): HookRouterEffect<PrePushHookSourceCheckResult> {
  return Effect.gen(function* () {
    const argv = ["--hook-check", "--tool", "source-check", "--json"];
    const startedAtMs = yield* hookNow();
    const report = yield* context.createCheckReport({
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
    yield* recordInProcessHookCheck(context, "source-check", argv, startedAtMs, exitCode);
    return { ...result, exitCode };
  });
}

function runPrePushTarget(
  context: HookProcedureContext,
  target: HookNxRunTargetRequest
): HookRouterEffect<SpawnResult> {
  return context.nx.runTarget(target).pipe(
    Effect.match({
      onFailure: spawnResultFromCommandProviderError,
      onSuccess: spawnResultFromCommandResult,
    })
  );
}

function runPrePushAffected(
  context: HookProcedureContext,
  request: HookNxAffectedRequest
): HookRouterEffect<SpawnResult> {
  return context.nx.affected(request).pipe(
    Effect.match({
      onFailure: spawnResultFromCommandProviderError,
      onSuccess: spawnResultFromCommandResult,
    })
  );
}

function resolvePrePushBase(context: HookProcedureContext): HookRouterEffect<PrePushBaseDecision> {
  return Effect.gen(function* () {
    const startedAtMs = yield* hookNow();
    const parent = yield* context.graphite.parent({ cwd: context.platform.repoRoot });
    yield* recordHookCommand(
      context,
      "pre-push-base",
      context.graphite.parentArgv(),
      startedAtMs,
      parent ? 0 : 1
    );
    if (parent) return { kind: "resolved" as const, base: parent, source: "graphite-parent" };

    const defaultBranch = yield* context.git.remoteDefaultBranch({
      cwd: context.platform.repoRoot,
    });
    const base = defaultBranch
      ? yield* context.git.mergeBase(defaultBranch, { cwd: context.platform.repoRoot })
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
  context: HookProcedureContext,
  tool: StagedHookCheckTool,
  stagedPaths: readonly string[]
): HookRouterEffect<StagedHookCheckResult> {
  return Effect.gen(function* () {
    const argv = ["--staged", "--tool", tool, "--json"];
    const startedAtMs = yield* hookNow();
    const report = yield* context.createCheckReport({
      tool,
      staged: true,
      stagedPaths,
      command: checkCommandContext(argv),
    });
    const result = {
      ...spawnResultFromCheckReport(report),
      check: { report, summary: hookCheckSummary(report) },
    };
    yield* recordInProcessHookCheck(context, tool, argv, startedAtMs, result.exitCode);
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
  context: HookProcedureContext,
  phase: StagedHookCheckTool,
  argv: readonly string[],
  startedAtMs: number,
  exitCode: number
): Effect.Effect<void> {
  void context;
  void phase;
  void argv;
  void startedAtMs;
  void exitCode;
  return Effect.void;
}

type HookCommandRecordPhase =
  | "partial-staging"
  | "staged-paths"
  | "formatter-restage"
  | "biome-format"
  | "biome-check"
  | "pre-push-base"
  | "pre-push-target"
  | "pre-push-affected";

function recordHookCommand(
  context: HookProcedureContext,
  phase: HookCommandRecordPhase,
  argv: readonly string[],
  startedAtMs: number,
  exitCode: number
): Effect.Effect<void> {
  void context;
  void phase;
  void argv;
  void startedAtMs;
  void exitCode;
  return Effect.void;
}

function checkSummaryAllowsNextStage(result: HookCheckCommandResult): boolean {
  return (
    result.kind === "parsed" &&
    (result.summary.kind === "pass" ||
      result.summary.kind === "advisory-only" ||
      result.summary.kind === "not-applicable")
  );
}
