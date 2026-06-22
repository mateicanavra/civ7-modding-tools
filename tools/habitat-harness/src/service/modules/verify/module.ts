import type { GitProviderService } from "@internal/habitat-harness/providers/git/index";
import type { GraphiteProviderService } from "@internal/habitat-harness/providers/graphite/index";
import type { NxProviderService } from "@internal/habitat-harness/providers/nx/index";
import { spawnResultFromCommandResult } from "@internal/habitat-harness/resources/command/index";
import { epochMillisToIsoString } from "@internal/habitat-harness/resources/platform/index";
import type {
  HabitatServiceContext,
  HabitatServiceRequirements,
  HabitatServiceRuntimeError,
} from "@internal/habitat-harness/service/base";
import type { HabitatServiceContract } from "@internal/habitat-harness/service/contract";
import { service } from "@internal/habitat-harness/service/impl";
import {
  type CheckOptions,
  checkCommandContext,
  verifyCheckSummary,
} from "@internal/habitat-harness/service/model/check/index";
import { StructuralCheck } from "@internal/habitat-harness/service/model/check/policy/structural/index";
import { ORPCError } from "@orpc/server";
import { Clock, Effect } from "effect";
import type { EffectImplementerInternal } from "effect-orpc";
import {
  createVerifyReceipt,
  readVerifyTargetPlan,
  type VerifyBaseResolution,
} from "./model/index.js";

export interface VerifyModuleContext {
  readonly checkCommandContext: typeof checkCommandContext;
  readonly createCheckReport: typeof createCheckReport;
  readonly createVerifyReceipt: typeof createVerifyReceipt;
  readonly currentTimeMillis: typeof Clock.currentTimeMillis;
  readonly epochMillisToIsoString: typeof epochMillisToIsoString;
  readonly observeGitStatus: ReturnType<typeof makeObserveGitStatus>;
  readonly readVerifyTargetPlan: typeof readVerifyTargetPlanEffect;
  readonly resolveVerifyBase: ReturnType<typeof makeResolveVerifyBase>;
  readonly runAffectedVerification: ReturnType<typeof makeRunAffectedVerification>;
  readonly verifyCheckSummary: typeof verifyCheckSummary;
}

type VerifyModule = EffectImplementerInternal<
  HabitatServiceContract["verify"],
  HabitatServiceContext,
  HabitatServiceContext & VerifyModuleContext,
  HabitatServiceRequirements,
  HabitatServiceRuntimeError
>;

export const module: VerifyModule = service.verify.use(({ context, next }) => {
  const resolveVerifyBase = makeResolveVerifyBase({
    git: context.deps.git,
    graphite: context.deps.graphite,
    repoRoot: context.deps.platform.repoRoot,
  });
  const runAffectedVerification = makeRunAffectedVerification(context.deps.nx);
  const observeGitStatus = makeObserveGitStatus({
    git: context.deps.git,
    repoRoot: context.deps.platform.repoRoot,
  });
  return next({
    context: {
      checkCommandContext,
      createCheckReport,
      createVerifyReceipt,
      currentTimeMillis: Clock.currentTimeMillis,
      epochMillisToIsoString,
      observeGitStatus,
      readVerifyTargetPlan: readVerifyTargetPlanEffect,
      resolveVerifyBase,
      runAffectedVerification,
      verifyCheckSummary,
    } satisfies VerifyModuleContext,
  });
});

function createCheckReport(options?: CheckOptions) {
  return Effect.flatMap(StructuralCheck, (service) => service.createReport(options));
}

function readVerifyTargetPlanEffect() {
  return Effect.promise(() => readVerifyTargetPlan());
}

function makeRunAffectedVerification(nx: NxProviderService) {
  return (base: string, targets: readonly string[]) =>
    nx
      .affected({ base, targets })
      .pipe(Effect.map(spawnResultFromCommandResult), Effect.mapError(verifyServiceInternalError));
}

function makeObserveGitStatus(input: {
  readonly git: GitProviderService;
  readonly repoRoot: string;
}) {
  return () =>
    input.git
      .statusShortBranch({ cwd: input.repoRoot })
      .pipe(Effect.map(spawnResultFromCommandResult), Effect.mapError(verifyServiceInternalError));
}

function makeResolveVerifyBase(context: {
  readonly git: GitProviderService;
  readonly graphite: GraphiteProviderService;
  readonly repoRoot: string;
}) {
  return (base?: string) => {
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
  };
}

function verifyServiceInternalError() {
  return new ORPCError("INTERNAL_SERVER_ERROR", {
    message: "Habitat verify service failed.",
  });
}
