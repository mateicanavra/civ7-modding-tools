import { type HabitatModule, service } from "@habitat/cli/service/impl";
import { renderCheckReport } from "@habitat/cli/service/model/check/index";
import { createCheckReportEffect } from "@habitat/cli/service/model/check/policy/structural/index";
import { prePushTargetPlanForChangedPaths } from "@habitat/cli/service/model/validation/policy/target-routing.policy";
import { workspaceGraphTargetNames } from "@habitat/cli/service/model/workspace/index";
import { finalizePreCommitEffect, finalizePrePushEffect } from "./model/policy/lifecycle.policy.js";
import type {
  HookModuleContext,
  HookProcedureContext,
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

export const module: HabitatModule<"hook", HookModuleContext> = service.hook.use(
  ({ context, next }) => {
    const hookContext = {
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
    } satisfies HookProcedureContext;

    return next({
      context: {
        lifecycle: {
          finalizePreCommit: finalizePreCommitEffect,
          finalizePrePush: finalizePrePushEffect,
        },
        output: {
          create: () => createHookOutput(hookContext.reporter),
          localNotice: localHookNotice,
          renderCheckReport,
          result: hookResult,
          section,
        },
        preCommit: {
          begin: (resourcePolicy) => beginPreCommit(hookContext, resourcePolicy),
          continueAfterFileLayer: continuePreCommitAfterFileLayer,
          finish: finishPreCommit,
          runBiome: preCommitBiomeProviderStep,
          stagedCheck: (phase, stagedPaths) => stagedHookCheck(hookContext, phase, stagedPaths),
          summaryAllowsNextStage: checkSummaryAllowsNextStage,
        },
        prePush: {
          affectedArgv: (request) => hookContext.nx.affectedArgv(request),
          changedPaths: (base) => prePushChangedPaths(hookContext, base),
          hookSourceCheck: (changedPaths) => prePushHookSourceCheck(hookContext, changedPaths),
          hookSourceCheckPaths: (changedPaths) =>
            prePushHookSourceCheckPaths(hookContext, changedPaths),
          recordCommand: (phase, argv, startedAtMs, exitCode) =>
            recordHookCommand(hookContext, phase, argv, startedAtMs, exitCode),
          resolveBase: () => resolvePrePushBase(hookContext),
          runAffected: (request) => runPrePushAffected(hookContext, request),
          runTarget: (target) => runPrePushTarget(hookContext, target),
          runTargetArgv: (target) => hookContext.nx.runTargetArgv(target),
          targetPlanForChangedPaths: (changedPaths) =>
            prePushTargetPlanForChangedPaths(
              changedPaths,
              hookContext.workspaceGraphTargetNames(),
              hookContext.rules.authorityPath
            ),
        },
        time: {
          now: hookNow,
        },
      } satisfies HookModuleContext,
    });
  }
);
