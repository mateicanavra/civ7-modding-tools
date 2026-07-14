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
  output.writeStdout(context.output.localNotice());

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
      "source checks: no changed TypeScript/JavaScript files in hook source-check roots\n"
    );
  }
  const targetPlan = context.prePush.targetPlanForChangedPaths(changedPaths.paths);
  if (targetPlan.kind === "run-many") {
    const request = { targets: targetPlan.targets };
    const result = yield* context.prePush.runMany(request);
    output.writeStdout(`habitat hook pre-push: repo Nx policy graph\n${result.stdout}`);
    output.writeStderr(result.stderr);
    return yield* context.lifecycle.finalizePrePush(
      result.exitCode === 0 ? "pass" : "affected-failed",
      yield* context.output.result(output, result.exitCode)
    );
  }
  const request = {
    base,
    targets: targetPlan.targets,
    head: "HEAD",
  };
  const result = yield* context.prePush.runAffected(request);
  output.writeStdout(`habitat hook pre-push: repo Nx affected base=${base}\n${result.stdout}`);
  output.writeStderr(result.stderr);
  return yield* context.lifecycle.finalizePrePush(
    result.exitCode === 0 ? "pass" : "affected-failed",
    yield* context.output.result(output, result.exitCode)
  );
});
