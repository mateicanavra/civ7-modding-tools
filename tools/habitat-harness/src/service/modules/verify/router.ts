import type { GitProviderService } from "@internal/habitat-harness/providers/git/index";
import type { GraphiteProviderService } from "@internal/habitat-harness/providers/graphite/index";
import {
  type SpawnResult,
  spawnResultFromCommandResult,
} from "@internal/habitat-harness/resources/command/index";
import {
  checkCommandContext,
  verifyCheckSummary,
} from "@internal/habitat-harness/service/model/check/policy/structural/index";
import { ORPCError } from "@orpc/server";
import { Clock, Effect } from "effect";
import {
  createVerifyReceipt,
  readVerifyTargetPlan,
  type VerifyBaseResolution,
} from "./model/index.js";
import { module } from "./module.js";

export const verifyRouter = {
  run: module.run.effect(function* ({ context, input }) {
    const { structuralCheck } = context;
    const startedMs = yield* Clock.currentTimeMillis;
    const startedAt = context.epochMillisToIsoString(startedMs);
    const baseDecision = yield* resolveVerifyBase(context, input.base);
    if (baseDecision.kind === "refused") {
      return { kind: "base-refused" as const, message: baseDecision.message };
    }

    const base = baseDecision.base;
    const checkReport = yield* structuralCheck.createReport({
      base,
      baselineIntegrity: true,
      command: checkCommandContext(),
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
      affectedResult = yield* context.nx
        .affected({ base, targets: targetPlan.targets })
        .pipe(
          Effect.map(spawnResultFromCommandResult),
          Effect.mapError(verifyServiceInternalError)
        );
      exitCode = affectedResult.exitCode;
    } else {
      affectedSkipReason = "receipt-only";
    }
    const endedMs = yield* Clock.currentTimeMillis;
    const gitStatus = yield* context.git
      .statusShortBranch({ cwd: context.repoRoot })
      .pipe(Effect.map(spawnResultFromCommandResult), Effect.mapError(verifyServiceInternalError));
    const receipt = createVerifyReceipt({
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

function verifyServiceInternalError() {
  return new ORPCError("INTERNAL_SERVER_ERROR", {
    message: "Habitat verify service failed.",
  });
}

function resolveVerifyBase(
  context: {
    readonly git: GitProviderService;
    readonly graphite: GraphiteProviderService;
    readonly repoRoot: string;
  },
  base?: string
) {
  if (base) {
    return Effect.succeed({
      kind: "resolved",
      base,
      source: "flag",
    } satisfies VerifyBaseResolution);
  }
  return Effect.gen(function* () {
    const graphiteParent = yield* context.graphite.parent({ cwd: context.repoRoot });
    if (graphiteParent) {
      return {
        kind: "resolved",
        base: graphiteParent,
        source: "graphite-parent",
      } satisfies VerifyBaseResolution;
    }

    const defaultBranch = yield* context.git.remoteDefaultBranch({ cwd: context.repoRoot });
    const resolved = defaultBranch
      ? yield* context.git.mergeBase(defaultBranch, { cwd: context.repoRoot })
      : null;
    if (resolved) {
      return {
        kind: "resolved",
        base: resolved,
        source: "merge-base",
      } satisfies VerifyBaseResolution;
    }
    return {
      kind: "refused",
      message:
        "could not resolve verify base from the remote default branch; pass --base explicitly.",
    } satisfies VerifyBaseResolution;
  });
}
