import type { NxProviderService } from "@habitat/cli/providers/nx/index";
import type { HabitatServiceSharedContext } from "@habitat/cli/service/base";
import { type HabitatModule, service } from "@habitat/cli/service/impl";
import {
  type CheckOptions,
  checkCommandContext,
  verifyCheckSummary,
} from "@habitat/cli/service/model/check/index";
import { createCheckReportEffect } from "@habitat/cli/service/model/check/policy/structural/index";
import type { RuleFactsCatalog } from "@habitat/cli/service/model/rules/index";
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

export type VerifyModuleContext = ReturnType<typeof makeVerifyModuleContext>;

type VerifyWorkspaceGraphPort = Pick<NxProviderService, "workspaceGraph">;

export const module: HabitatModule<"verify", VerifyModuleContext> = service.verify.use(
  ({ context, next }) => next({ context: makeVerifyModuleContext(context) })
);

function makeVerifyModuleContext(
  context: Pick<HabitatServiceSharedContext, "deps" | "structuralCheck">
) {
  const repoRoot = context.deps.platform.repoRoot;
  return {
    checkCommandContext,
    createCheckReport: (options?: CheckOptions) =>
      createCheckReportEffect({ ...options, repoRoot }, context.structuralCheck),
    createVerifyReceipt: makeCreateVerifyReceipt({
      env: context.deps.platform.env,
      repoRoot,
    }),
    currentTimeMillis: Clock.currentTimeMillis,
    epochMillisToIsoString,
    observeGitStatus: makeObserveGitStatus({ git: context.deps.git, repoRoot }),
    readVerifyTargetPlan: readVerifyTargetPlanEffect({
      nx: context.deps.nx,
      rules: context.deps.rules,
    }),
    resolveVerifyBase: makeResolveVerifyBase({
      git: context.deps.git,
      graphite: context.deps.graphite,
      repoRoot,
    }),
    runAffectedVerification: makeRunAffectedVerification(context.deps.nx),
    verifyCheckSummary,
  };
}

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
