import { type HabitatModule, service } from "@habitat/cli/service/impl";
import { renderCheckReport } from "@habitat/cli/service/model/check/index";
import { createCheckReportEffect } from "@habitat/cli/service/model/check/policy/structural/index";
import { prePushTargetPlanForChangedPaths } from "@habitat/cli/service/model/validation/policy/target-routing.policy";
import { workspaceGraphTargetNames } from "@habitat/cli/service/model/workspace/index";
import { finalizePreCommitEffect, finalizePrePushEffect } from "./model/policy/lifecycle.policy.js";
import type {
  HookNxAffectedRequest,
  HookNxRunManyRequest,
  HookProcedureContext,
  StagedHookCheckPhase,
} from "./model/policy/procedure-context.policy.js";
import {
  makeHookProcedureContext,
  renderLocalHookNotice,
} from "./model/policy/procedure-context.policy.js";
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
  resolvePrePushBase,
  runPrePushAffected,
  runPrePushRunMany,
  stagedHookCheck,
} from "./model/policy/procedure-operations.policy.js";
import {
  createHookOutput,
  type HookResourcePolicy,
  section,
} from "./model/policy/runtime.policy.js";

type HookModuleContext = ReturnType<typeof makeHookModuleContext>;

export const module: HabitatModule<"hook", HookModuleContext> = service.hook.use(
  ({ context, next }) => {
    const hookContext = makeHookProcedureContext({
      biome: context.deps.biome,
      git: context.deps.git,
      graphite: context.deps.graphite,
      nx: context.deps.nx,
      platform: context.deps.platform,
      reporter: context.deps.reporter,
      rules: context.deps.rules,
      createCheckReport: (options) =>
        createCheckReportEffect(
          { ...options, repoRoot: context.deps.platform.repoRoot },
          context.structuralCheck
        ),
      workspaceGraphTargetNames,
    });

    return next({ context: makeHookModuleContext(hookContext) });
  }
);

function makeHookModuleContext(hookContext: HookProcedureContext) {
  return {
    lifecycle: {
      finalizePreCommit: finalizePreCommitEffect,
      finalizePrePush: finalizePrePushEffect,
    },
    output: {
      create: () => createHookOutput(hookContext.reporter),
      localNotice: renderLocalHookNotice,
      renderCheckReport,
      result: hookResult,
      section,
    },
    preCommit: {
      begin: (resourcePolicy: HookResourcePolicy | undefined) =>
        beginPreCommit(hookContext, resourcePolicy),
      continueAfterFileLayer: continuePreCommitAfterFileLayer,
      finish: finishPreCommit,
      runBiome: preCommitBiomeProviderStep,
      stagedCheck: (phase: StagedHookCheckPhase, stagedPaths: readonly string[]) =>
        stagedHookCheck(hookContext, phase, stagedPaths),
      summaryAllowsNextStage: checkSummaryAllowsNextStage,
    },
    prePush: {
      changedPaths: (base: string) => prePushChangedPaths(hookContext, base),
      hookSourceCheck: (changedPaths: readonly string[]) =>
        prePushHookSourceCheck(hookContext, changedPaths),
      hookSourceCheckPaths: (changedPaths: readonly string[]) =>
        prePushHookSourceCheckPaths(hookContext, changedPaths),
      resolveBase: () => resolvePrePushBase(hookContext),
      runAffected: (request: HookNxAffectedRequest) => runPrePushAffected(hookContext, request),
      runMany: (request: HookNxRunManyRequest) => runPrePushRunMany(hookContext, request),
      targetPlanForChangedPaths: (changedPaths: readonly string[]) =>
        prePushTargetPlanForChangedPaths(
          changedPaths,
          hookContext.workspaceGraphTargetNames(),
          hookContext.rules.authorityPath
        ),
    },
  };
}
