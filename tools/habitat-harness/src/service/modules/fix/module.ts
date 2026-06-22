import type { HabitatServiceDeps } from "@internal/habitat-harness/service/base";
import { service } from "@internal/habitat-harness/service/impl";

export type FixModuleContext = Pick<HabitatServiceDeps, "grit">;

export const module = service.fix.use(({ context, next }) =>
  next({
    context: {
      grit: context.deps.grit,
    } satisfies FixModuleContext,
  })
);
