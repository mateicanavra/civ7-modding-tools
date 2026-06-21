import {
  checkCommandContext,
  StructuralCheck,
  verifyCheckSummary,
} from "@internal/habitat-harness/service/modules/check/structural/index";
import {
  createVerifyReceipt,
  observeGitStatusEffect,
  readVerifyTargetPlan,
  resolveVerifyBaseEffect,
  runAffectedVerificationEffect,
} from "@internal/habitat-harness/service/modules/verify/proof/index";
import type { SpawnResult } from "@internal/habitat-harness/service/runtime/command/index";
import { epochMillisToIsoString } from "@internal/habitat-harness/service/runtime/resources/index";
import { ORPCError } from "@orpc/server";
import { Clock, Effect } from "effect";
import { implementer } from "./context.js";

export const verifyRouter = {
  run: implementer.run.effect(({ input }) =>
    Effect.gen(function* () {
      const structuralCheck = yield* StructuralCheck;
      const startedMs = yield* Clock.currentTimeMillis;
      const startedAt = epochMillisToIsoString(startedMs);
      const baseDecision = yield* resolveVerifyBaseEffect(input.base);
      if (baseDecision.kind === "refused") {
        return { kind: "base-refused" as const, message: baseDecision.message };
      }

      const base = baseDecision.base;
      const checkReport = yield* structuralCheck.createReport({
        base,
        baselineIntegrity: true,
        command: checkCommandContext(input.commandArgs ?? []),
      });
      const checkSummary = verifyCheckSummary(checkReport);
      const targetPlan = yield* Effect.promise(() => Promise.resolve(readVerifyTargetPlan()));
      const affectedExecution = input.affectedExecution ?? "run";
      let affectedResult: SpawnResult | undefined;
      let affectedSkipReason: "receipt-only" | undefined;
      let exitCode = 0;
      if (!checkSummary.allowsAffectedExecution) exitCode = 1;
      else if (targetPlan.kind === "verify-target-plan-refused") exitCode = 1;
      else if (affectedExecution === "run") {
        affectedResult = yield* runAffectedVerificationEffect(base, targetPlan).pipe(
          Effect.mapError(verifyServiceInternalError)
        );
        exitCode = affectedResult.exitCode;
      } else {
        affectedSkipReason = "receipt-only";
      }
      const endedMs = yield* Clock.currentTimeMillis;
      const receipt = createVerifyReceipt({
        requestedBase: input.base,
        resolvedBase: base,
        baseSource: baseDecision.source,
        commandArgs: input.commandArgs,
        startedAt,
        durationMs: Math.max(0, endedMs - startedMs),
        exitCode,
        checkReport,
        verifyTargetPlan: targetPlan,
        affectedResult,
        affectedSkipReason,
        gitStatus: yield* observeGitStatusEffect().pipe(
          Effect.mapError(verifyServiceInternalError)
        ),
      });
      return {
        kind: "completed" as const,
        base,
        checkReport,
        targetPlan,
        affectedResult,
        receipt,
      };
    })
  ),
};

export const router = verifyRouter;

function verifyServiceInternalError() {
  return new ORPCError("INTERNAL_SERVER_ERROR", {
    message: "Habitat verify service failed.",
  });
}
