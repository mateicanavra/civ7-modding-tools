import type { GritProviderService } from "@internal/habitat-harness/providers/grit/index";
import { service } from "@internal/habitat-harness/service/impl";

export interface FixModuleContext {
  readonly grit: GritProviderService;
}

export const module = service.fix.use(({ context, next }) =>
  next({
    context: {
      grit: context.deps.grit,
    } satisfies FixModuleContext,
  })
);
