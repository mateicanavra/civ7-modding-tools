import type { GitProviderService } from "@internal/habitat-harness/providers/git/index";
import type { GraphiteProviderService } from "@internal/habitat-harness/providers/graphite/index";
import type { NxProviderService } from "@internal/habitat-harness/providers/nx/index";
import type { epochMillisToIsoString } from "@internal/habitat-harness/resources/platform/index";
import { service } from "@internal/habitat-harness/service/impl";
import type { StructuralCheckService } from "@internal/habitat-harness/service/model/check/policy/structural/index";

export interface VerifyModuleContext {
  readonly epochMillisToIsoString: typeof epochMillisToIsoString;
  readonly git: GitProviderService;
  readonly graphite: GraphiteProviderService;
  readonly nx: NxProviderService;
  readonly repoRoot: string;
  readonly structuralCheck: StructuralCheckService;
}

export const module = service.verify.use(({ context, next }) =>
  next({
    context: {
      epochMillisToIsoString: context.deps.epochMillisToIsoString,
      git: context.deps.git,
      graphite: context.deps.graphite,
      nx: context.deps.nx,
      repoRoot: context.deps.repoRoot,
      structuralCheck: context.deps.structuralCheck,
    } satisfies VerifyModuleContext,
  })
);
