import { service, type HabitatModule } from "@internal/habitat-harness/service/impl";
import {
  type CheckOptions,
  type CheckReport,
  checkCommandContext,
  verifyCheckSummary,
} from "@internal/habitat-harness/service/model/check/index";
import { createCheckReportEffect } from "@internal/habitat-harness/service/model/check/policy/structural/index";
import type { RuleFactsCatalog } from "@internal/habitat-harness/service/model/rules/index";
import { ORPCError } from "@orpc/server";
import { Clock, Effect } from "effect";
import {
  createVerifyReceipt,
  observeGitStatusEffect,
  readVerifyTargetPlan,
  resolveVerifyBaseEffect,
  runAffectedVerificationEffect,
  type VerifyBaseGitPort,
  type VerifyBaseGraphitePort,
  type VerifyGitStatusPort,
  type VerifyNxAffectedPort,
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

interface VerifyWorkspaceGraphPort {
  readonly workspaceGraph: () => Effect.Effect<Parameters<typeof readVerifyTargetPlan>[1]>;
}

export const module: HabitatModule<"verify", VerifyModuleContext> = service.verify.use(
  ({ context, next }) => {
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
          createCheckReportEffect(
            { ...options, repoRoot: context.deps.platform.repoRoot },
            context.structuralCheck
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
  }
);

function epochMillisToIsoString(epochMillis: number): string {
  return new Date(epochMillis).toISOString();
}

function readVerifyTargetPlanEffect(input: {
  readonly rules: RuleFactsCatalog;
  readonly nx: VerifyWorkspaceGraphPort;
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

function makeRunAffectedVerification(nx: VerifyNxAffectedPort) {
  return (base: string, targets: readonly string[]) =>
    runAffectedVerificationEffect(nx, base, targets).pipe(
      Effect.mapError(verifyServiceInternalError)
    );
}

function makeObserveGitStatus(input: {
  readonly git: VerifyGitStatusPort;
  readonly repoRoot: string;
}) {
  return () => observeGitStatusEffect(input).pipe(Effect.mapError(verifyServiceInternalError));
}

function makeResolveVerifyBase(context: {
  readonly git: VerifyBaseGitPort;
  readonly graphite: VerifyBaseGraphitePort;
  readonly repoRoot: string;
}) {
  return (base?: string) => resolveVerifyBaseEffect(context, base);
}

function verifyServiceInternalError() {
  return new ORPCError("INTERNAL_SERVER_ERROR", {
    message: "Habitat verify service failed.",
  });
}
