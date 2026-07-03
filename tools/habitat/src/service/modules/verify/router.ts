import { module } from "./module.js";

export const verifyRouter = {
  changes: module.changes.effect(function* ({ context, input }) {
    const startedMs = yield* context.currentTimeMillis;
    const startedAt = context.epochMillisToIsoString(startedMs);
    const baseDecision = yield* context.resolveVerifyBase(input.base);
    if (baseDecision.kind === "refused") {
      return { kind: "base-refused" as const, message: baseDecision.message };
    }

    const base = baseDecision.base;
    const checkReport = yield* context.createCheckReport({
      base,
      baselineIntegrity: true,
      command: context.checkCommandContext(),
    });
    const checkSummary = context.verifyCheckSummary(checkReport);
    const targetPlan = yield* context.readVerifyTargetPlan();
    const affectedExecution = input.affectedExecution ?? "run";
    let affectedResult: Parameters<typeof context.createVerifyReceipt>[0]["affectedResult"];
    let affectedSkipReason: "receipt-only" | undefined;
    let exitCode = 0;
    if (!checkSummary.allowsAffectedExecution) exitCode = 1;
    else if (targetPlan.kind === "verify-target-plan-refused") exitCode = 1;
    else if (affectedExecution === "run") {
      affectedResult = yield* context.runAffectedVerification(base, targetPlan.targets);
      exitCode = affectedResult.exitCode;
    } else {
      affectedSkipReason = "receipt-only";
    }
    const endedMs = yield* context.currentTimeMillis;
    const gitStatus = yield* context.observeGitStatus();
    const receipt = context.createVerifyReceipt({
      requestedBase: input.base,
      resolvedBase: base,
      baseSource: baseDecision.source,
      startedAt,
      durationMs: Math.max(0, endedMs - startedMs),
      exitCode,
      checkReport,
      verifyTargetPlan: targetPlan,
      affectedResult,
      affectedSkipReason,
      gitStatus,
    });
    return {
      kind: "completed" as const,
      base,
      checkReport,
      targetPlan,
      affectedResult,
      receipt,
    };
  }),
};

export const router = verifyRouter;
