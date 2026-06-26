import { module } from "../module.js";

export const prePushRouter = module.prePush.effect(function* ({ context, input = {} }) {
  const baseDecision = input.base
    ? ({
        kind: "resolved",
        base: input.base,
        source: "explicit",
      } as const)
    : yield* context.prePush.resolveBase();
  const output = context.output.create();
  output.writeStdout(context.output.localNotice);

  if (baseDecision.kind === "refused") {
    output.writeStderr(`habitat hook pre-push: ${baseDecision.message}\n`);
    return yield* context.lifecycle.finalizePrePush(
      "base-refused",
      yield* context.output.result(output, 1)
    );
  }
  const base = baseDecision.base;
  const changedPaths = yield* context.prePush.changedPaths(base);
  if (changedPaths.kind === "unavailable") {
    output.writeStderr(`habitat hook pre-push: ${changedPaths.message}\n`);
    return yield* context.lifecycle.finalizePrePush(
      "affected-failed",
      yield* context.output.result(output, 1)
    );
  }
  const hookSourcePaths = context.prePush.hookSourceCheckPaths(changedPaths.paths);
  if (hookSourcePaths.length > 0) {
    const hookSourceCheck = yield* context.prePush.hookSourceCheck(hookSourcePaths);
    output.writeStdout(
      context.output.section(
        "source-check changed-path hook check",
        context.output.renderCheckReport(hookSourceCheck.report)
      )
    );
    if (!context.preCommit.summaryAllowsNextStage(hookSourceCheck)) {
      return yield* context.lifecycle.finalizePrePush(
        "affected-failed",
        yield* context.output.result(output, hookSourceCheck.exitCode)
      );
    }
  } else {
    output.writeStdout(
      "source checks: no changed TypeScript/JavaScript/docs files in hook source-check roots\n"
    );
  }
  const targetPlan = context.prePush.targetPlanForChangedPaths(changedPaths.paths);
  for (const target of targetPlan.runTargets) {
    const argv = context.prePush.runTargetArgv(target);
    const startedAtMs = yield* context.time.now();
    const targetResult = yield* context.prePush.runTarget(target);
    yield* context.prePush.recordCommand(
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
      return yield* context.lifecycle.finalizePrePush(
        "affected-failed",
        yield* context.output.result(output, targetResult.exitCode)
      );
    }
  }
  if (targetPlan.affectedTargets.length === 0) {
    output.writeStdout("habitat hook pre-push: no repo Nx affected targets selected\n");
    return yield* context.lifecycle.finalizePrePush(
      "pass",
      yield* context.output.result(output, 0)
    );
  }
  const request = {
    base,
    targets: targetPlan.affectedTargets,
    head: "HEAD",
    excludeTaskDependencies: true,
  };
  const argv = context.prePush.affectedArgv(request);
  const startedAtMs = yield* context.time.now();
  const result = yield* context.prePush.runAffected(request);
  yield* context.prePush.recordCommand("pre-push-affected", argv, startedAtMs, result.exitCode);
  output.writeStdout(`habitat hook pre-push: repo Nx affected base=${base}\n${result.stdout}`);
  output.writeStderr(result.stderr);
  return yield* context.lifecycle.finalizePrePush(
    result.exitCode === 0 ? "pass" : "affected-failed",
    yield* context.output.result(output, result.exitCode)
  );
});
