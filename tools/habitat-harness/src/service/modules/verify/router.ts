import {
  checkCommandContext,
  StructuralCheck,
  type StructuralCheckService,
  verifyCheckSummary,
} from "@internal/habitat-harness/service/model/check/policy/structural/index";
import {
  createVerifyReceipt,
  readVerifyTargetPlan,
  type VerifyBaseResolution,
  VerifyBaseResolutionSchema,
} from "./model/index.js";
import {
  type SpawnResult,
  spawnResultFromCommandResult,
} from "@internal/habitat-harness/resources/command/index";
import { GitProvider } from "@internal/habitat-harness/providers/git/index";
import { GraphiteProvider } from "@internal/habitat-harness/providers/graphite/index";
import { NxProvider } from "@internal/habitat-harness/providers/nx/index";
import { repoRoot as defaultRepoRoot } from "@internal/habitat-harness/resources/paths";
import { epochMillisToIsoString as defaultEpochMillisToIsoString } from "@internal/habitat-harness/resources/platform/index";
import type {
  HabitatServiceRequirements,
  VerifyServiceModuleContext,
} from "@internal/habitat-harness/service/base";
import { ORPCError } from "@orpc/server";
import { Clock, Effect } from "effect";
import { Value } from "typebox/value";
import { module } from "./module.js";

export const verifyRouter = {
  run: module.run.effect(function* ({ context: moduleContext, input }) {
    const context = yield* resolveVerifyContext(moduleContext);
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

type ResolvedVerifyServiceModuleContext = Required<VerifyServiceModuleContext> & {
  readonly structuralCheck: StructuralCheckService;
};

function resolveVerifyContext(
  context: VerifyServiceModuleContext
): Effect.Effect<ResolvedVerifyServiceModuleContext, never, HabitatServiceRequirements> {
  return Effect.gen(function* () {
    return {
      epochMillisToIsoString: context.epochMillisToIsoString ?? defaultEpochMillisToIsoString,
      git: context.git ?? (yield* GitProvider),
      graphite: context.graphite ?? (yield* GraphiteProvider),
      nx: context.nx ?? (yield* NxProvider),
      repoRoot: context.repoRoot ?? defaultRepoRoot,
      structuralCheck: yield* StructuralCheck,
    };
  });
}

function verifyServiceInternalError() {
  return new ORPCError("INTERNAL_SERVER_ERROR", {
    message: "Habitat verify service failed.",
  });
}

function resolveVerifyBase(
  context: ResolvedVerifyServiceModuleContext,
  base?: string
): Effect.Effect<VerifyBaseResolution, never, HabitatServiceRequirements> {
  if (base) {
    return Effect.succeed(
      Value.Parse(VerifyBaseResolutionSchema, { kind: "resolved", base, source: "flag" })
    );
  }
  return Effect.gen(function* () {
    const graphiteParent = yield* context.graphite.parent({ cwd: context.repoRoot });
    if (graphiteParent) {
      return Value.Parse(VerifyBaseResolutionSchema, {
        kind: "resolved",
        base: graphiteParent,
        source: "graphite-parent",
      });
    }

    const defaultBranch = yield* context.git.remoteDefaultBranch({ cwd: context.repoRoot });
    const resolved = defaultBranch
      ? yield* context.git.mergeBase(defaultBranch, { cwd: context.repoRoot })
      : null;
    if (resolved) {
      return Value.Parse(VerifyBaseResolutionSchema, {
        kind: "resolved",
        base: resolved,
        source: "merge-base",
      });
    }
    return Value.Parse(VerifyBaseResolutionSchema, {
      kind: "refused",
      message:
        "could not resolve verify base from the remote default branch; pass --base explicitly.",
    });
  });
}
