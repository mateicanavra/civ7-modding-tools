import type { GitProviderService } from "@internal/habitat-harness/providers/git/index";
import type { GraphiteProviderService } from "@internal/habitat-harness/providers/graphite/index";
import type { NxProviderService } from "@internal/habitat-harness/providers/nx/index";
import { epochMillisToIsoString } from "@internal/habitat-harness/resources/platform/index";
import type {
  HabitatServiceContext,
  HabitatServiceDeps,
  HabitatServiceRequirements,
  HabitatServiceRuntimeError,
} from "@internal/habitat-harness/service/base";
import type { HabitatServiceContract } from "@internal/habitat-harness/service/contract";
import { service } from "@internal/habitat-harness/service/impl";
import {
  type CheckOptions,
  type CheckReport,
  checkCommandContext,
  verifyCheckSummary,
} from "@internal/habitat-harness/service/model/check/index";
import {
  createCheckReportEffect,
  type StructuralExecutionContext,
} from "@internal/habitat-harness/service/model/check/policy/structural/index";
import { ORPCError } from "@orpc/server";
import { Clock, Effect } from "effect";
import type { EffectImplementerInternal } from "effect-orpc";
import {
  createVerifyReceipt,
  observeGitStatusEffect,
  readVerifyTargetPlan,
  resolveVerifyBaseEffect,
  runAffectedVerificationEffect,
  type VerifyReceiptInput,
} from "./model/index.js";

export interface VerifyModuleContext {
  readonly checkCommandContext: typeof checkCommandContext;
  readonly createCheckReport: (options?: CheckOptions) => Effect.Effect<CheckReport, never, any>;
  readonly createVerifyReceipt: ReturnType<typeof makeCreateVerifyReceipt>;
  readonly currentTimeMillis: typeof Clock.currentTimeMillis;
  readonly epochMillisToIsoString: typeof epochMillisToIsoString;
  readonly observeGitStatus: ReturnType<typeof makeObserveGitStatus>;
  readonly readVerifyTargetPlan: ReturnType<typeof readVerifyTargetPlanEffect>;
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
  const createReceipt = makeCreateVerifyReceipt({
    env: context.deps.platform.env,
    repoRoot: context.deps.platform.repoRoot,
  });
  return next({
    context: {
      checkCommandContext,
      createCheckReport: (options) =>
        createCheckReport(
          { ...options, repoRoot: context.deps.platform.repoRoot },
          structuralExecutionContext(context.deps)
        ),
      createVerifyReceipt: createReceipt,
      currentTimeMillis: Clock.currentTimeMillis,
      epochMillisToIsoString,
      observeGitStatus,
      readVerifyTargetPlan: readVerifyTargetPlanEffect({
        nx: context.deps.nx,
        rules: context.deps.rules,
      }),
      resolveVerifyBase,
      runAffectedVerification,
      verifyCheckSummary,
    } satisfies VerifyModuleContext,
  });
});

function createCheckReport(options: CheckOptions, context: StructuralExecutionContext) {
  return createCheckReportEffect(options, context);
}

function structuralExecutionContext(deps: HabitatServiceDeps): StructuralExecutionContext {
  return {
    biome: deps.biome,
    commandRunner: deps.commandRunner,
    git: deps.git,
    grit: deps.grit,
    nx: deps.nx,
    repoRoot: deps.platform.repoRoot,
    rules: deps.rules,
    sourceFileSystem: {
      isDirectory: deps.platform.isDirectory,
      isFile: deps.platform.isFileEffect,
      readDirectory: deps.platform.readDirectory,
      readText: deps.platform.readText,
    },
  };
}

function readVerifyTargetPlanEffect(input: {
  readonly rules: HabitatServiceDeps["rules"];
  readonly nx: NxProviderService;
}) {
  return () =>
    input.nx.workspaceGraph().pipe(Effect.map((graph) => readVerifyTargetPlan(input.rules, graph)));
}

function makeCreateVerifyReceipt(context: {
  readonly env: Record<string, string | undefined>;
  readonly repoRoot: string;
}) {
  return (input: Omit<VerifyReceiptInput, "env" | "repoRoot">) =>
    createVerifyReceipt({ ...input, env: context.env, repoRoot: context.repoRoot });
}

function makeRunAffectedVerification(nx: NxProviderService) {
  return (base: string, targets: readonly string[]) =>
    runAffectedVerificationEffect(nx, base, targets).pipe(
      Effect.mapError(verifyServiceInternalError)
    );
}

function makeObserveGitStatus(input: {
  readonly git: GitProviderService;
  readonly repoRoot: string;
}) {
  return () => observeGitStatusEffect(input).pipe(Effect.mapError(verifyServiceInternalError));
}

function makeResolveVerifyBase(context: {
  readonly git: GitProviderService;
  readonly graphite: GraphiteProviderService;
  readonly repoRoot: string;
}) {
  return (base?: string) => resolveVerifyBaseEffect(context, base);
}

function verifyServiceInternalError() {
  return new ORPCError("INTERNAL_SERVER_ERROR", {
    message: "Habitat verify service failed.",
  });
}
