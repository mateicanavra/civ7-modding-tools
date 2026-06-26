import { module } from "./module.js";

export const hookRouter = {
  preCommit: module.preCommit.effect(function* ({ context, input = {} }) {
    const begun = yield* context.beginPreCommit(input.resourcePolicy);
    if (begun.kind === "done") {
      return yield* context.finalizePreCommitEffect(begun.outcome, begun.result);
    }
    const fileLayer = yield* context.stagedHookCheck("file-layer", begun.state.staged);
    const afterFileLayer = yield* context.continuePreCommitAfterFileLayer(begun.state, fileLayer);
    if (afterFileLayer.kind === "done") {
      return yield* context.finalizePreCommitEffect(afterFileLayer.outcome, afterFileLayer.result);
    }
    const afterBiome = yield* context.preCommitBiomeProviderStep(afterFileLayer.state);
    if (afterBiome.kind === "done") {
      return yield* context.finalizePreCommitEffect(afterBiome.outcome, afterBiome.result);
    }

    const sourceCheckResult =
      afterBiome.state.sourceCheckPaths.length > 0
        ? yield* context.stagedHookCheck("source-check", afterBiome.state.sourceCheckPaths)
        : undefined;
    return yield* context.finishPreCommit(afterBiome.state, sourceCheckResult);
  }),
  prePush: module.prePush.effect(function* ({ context, input = {} }) {
    const baseDecision = input.base
      ? ({
          kind: "resolved",
          base: input.base,
          source: "explicit",
        } as const)
      : yield* context.resolvePrePushBase();
    const output = context.createHookOutput();
    output.writeStdout(context.localHookNotice);

    if (baseDecision.kind === "refused") {
      output.writeStderr(`habitat hook pre-push: ${baseDecision.message}\n`);
      return yield* context.finalizePrePushEffect(
        "base-refused",
        yield* context.hookResult(output, 1)
      );
    }
    const base = baseDecision.base;
    const changedPaths = yield* context.prePushChangedPaths(base);
    if (changedPaths.kind === "unavailable") {
      output.writeStderr(`habitat hook pre-push: ${changedPaths.message}\n`);
      return yield* context.finalizePrePushEffect(
        "affected-failed",
        yield* context.hookResult(output, 1)
      );
    }
    const hookSourcePaths = context.prePushHookSourceCheckPaths(changedPaths.paths);
    if (hookSourcePaths.length > 0) {
      const hookSourceCheck = yield* context.prePushHookSourceCheck(hookSourcePaths);
      output.writeStdout(
        context.section(
          "source-check changed-path hook check",
          context.renderCheckReport(hookSourceCheck.report)
        )
      );
      if (!context.checkSummaryAllowsNextStage(hookSourceCheck)) {
        return yield* context.finalizePrePushEffect(
          "affected-failed",
          yield* context.hookResult(output, hookSourceCheck.exitCode)
        );
      }
    } else {
      output.writeStdout(
        "source checks: no changed TypeScript/JavaScript/docs files in hook source-check roots\n"
      );
    }
    const targetPlan = context.prePushTargetPlanForChangedPaths(changedPaths.paths);
    for (const target of targetPlan.runTargets) {
      const argv = context.prePushRunTargetArgv(target);
      const startedAtMs = yield* context.hookNow();
      const targetResult = yield* context.prePushRunTarget(target);
      yield* context.recordHookCommand("pre-push-target", argv, startedAtMs, targetResult.exitCode);
      output.writeStdout(
        `habitat hook pre-push: repo Nx target ${target.project}:${target.target}\n${targetResult.stdout}`
      );
      output.writeStderr(targetResult.stderr);
      if (targetResult.exitCode !== 0) {
        return yield* context.finalizePrePushEffect(
          "affected-failed",
          yield* context.hookResult(output, targetResult.exitCode)
        );
      }
    }
    if (targetPlan.affectedTargets.length === 0) {
      output.writeStdout("habitat hook pre-push: no repo Nx affected targets selected\n");
      return yield* context.finalizePrePushEffect("pass", yield* context.hookResult(output, 0));
    }
    const request = {
      base,
      targets: targetPlan.affectedTargets,
      head: "HEAD",
      excludeTaskDependencies: true,
    };
    const argv = context.prePushAffectedArgv(request);
    const startedAtMs = yield* context.hookNow();
    const result = yield* context.prePushRunAffected(request);
    yield* context.recordHookCommand("pre-push-affected", argv, startedAtMs, result.exitCode);
    output.writeStdout(`habitat hook pre-push: repo Nx affected base=${base}\n${result.stdout}`);
    output.writeStderr(result.stderr);
    return yield* context.finalizePrePushEffect(
      result.exitCode === 0 ? "pass" : "affected-failed",
      yield* context.hookResult(output, result.exitCode)
    );
  }),
};

export const router = hookRouter;
