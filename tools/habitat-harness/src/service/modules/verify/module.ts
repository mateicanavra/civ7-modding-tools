import type { GitProviderService } from "@internal/habitat-harness/providers/git/index";
import type { GraphiteProviderService } from "@internal/habitat-harness/providers/graphite/index";
import type { NxProviderService } from "@internal/habitat-harness/providers/nx/index";
import type { VerifyServiceModuleContext } from "@internal/habitat-harness/service/base";
import { service } from "@internal/habitat-harness/service/impl";
import type { StructuralCheckService } from "@internal/habitat-harness/service/model/check/policy/structural/index";

export type VerifyModuleContext = Required<VerifyServiceModuleContext> & {
  readonly git: GitProviderService;
  readonly graphite: GraphiteProviderService;
  readonly nx: NxProviderService;
  readonly structuralCheck: StructuralCheckService;
};

export const module = service.verify.use(({ context, next }) =>
  next({
    context: {
      ...(context.verify ?? {}),
      epochMillisToIsoString: context.epochMillisToIsoString,
      git: context.git,
      graphite: context.graphite,
      nx: context.nx,
      repoRoot: context.repoRoot,
      structuralCheck: context.structuralCheck,
    } satisfies VerifyModuleContext,
  })
);
