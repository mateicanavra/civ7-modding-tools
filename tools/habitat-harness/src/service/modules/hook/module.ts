import type { SpawnResult } from "@internal/habitat-harness/resources/command/index";
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
  renderCheckReport,
} from "@internal/habitat-harness/service/model/check/index";
import {
  createCheckReportEffect,
  type StructuralExecutionContext,
} from "@internal/habitat-harness/service/model/check/policy/structural/index";
import { prePushTargetPlanForChangedPaths } from "@internal/habitat-harness/service/model/graph/policy/validation-routing.policy";
import { workspaceGraphTargetNames } from "@internal/habitat-harness/service/model/workspace/index";
import type { Effect } from "effect";
import type { EffectImplementerInternal } from "effect-orpc";
import type { HookPreCommitInput } from "./contract.js";
import { finalizePreCommitEffect, finalizePrePushEffect } from "./model/policy/lifecycle.policy.js";
import type {
  HookCommandRecordPhase,
  HookNxAffectedRequest,
  HookNxRunTargetRequest,
  HookOutput,
  HookProcedureContext,
  HookRouterEffect,
  PreCommitState,
  PreCommitStep,
  PrePushBaseDecision,
  PrePushChangedPathsResult,
  PrePushHookSourceCheckResult,
  StagedHookCheckResult,
  StagedHookCheckTool,
} from "./model/policy/procedure-context.policy.js";
import { localHookNotice } from "./model/policy/procedure-context.policy.js";
import {
  beginPreCommit,
  checkSummaryAllowsNextStage,
  continuePreCommitAfterFileLayer,
  finishPreCommit,
  hookResult,
  preCommitBiomeProviderStep,
  prePushChangedPaths,
  prePushHookSourceCheck,
  prePushHookSourceCheckPaths,
  recordHookCommand,
  resolvePrePushBase,
  runPrePushAffected,
  runPrePushTarget,
  stagedHookCheck,
} from "./model/policy/procedure-operations.policy.js";
import { createHookOutput, hookNow, section } from "./model/policy/runtime.policy.js";

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
