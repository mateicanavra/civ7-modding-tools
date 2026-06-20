import { ORPCError } from "@orpc/server";
import { Effect } from "effect";
import {
  createVerifyReceipt,
  observeGitStatusEffect,
  readVerifyTargetPlan,
  resolveVerifyBaseEffect,
  runAffectedVerificationEffect,
} from "../../../domains/proof-contract/index.js";
import {
  checkCommandContext,
  StructuralCheck,
  verifyCheckSummary,
} from "../../../domains/structural-check/index.js";
import type { SpawnResult } from "../../../providers/command/index.js";
import { HabitatClock } from "../../../resources/index.js";
import { module as verifyModule } from "./module.js";

export const verifyRouter = {
  run: verifyModule.run.effect(({ input }) =>
    Effect.gen(function* () {
      const clock = yield* HabitatClock;
      const structuralCheck = yield* StructuralCheck;
      const startedAt = (yield* clock.currentDate).toISOString();
      const startedMs = yield* clock.currentTimeMillis;
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
      let affectedResult: SpawnResult | undefined;
      let exitCode = 0;
      if (!checkSummary.allowsAffectedExecution) exitCode = 1;
      else if (targetPlan.kind === "verify-target-plan-refused") exitCode = 1;
      else {
        affectedResult = yield* runAffectedVerificationEffect(base, targetPlan).pipe(
          Effect.mapError(verifyServiceInternalError)
        );
        exitCode = affectedResult.exitCode;
      }
      const endedMs = yield* clock.currentTimeMillis;
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
