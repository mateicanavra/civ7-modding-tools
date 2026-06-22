import type { HabitatServiceDeps } from "@internal/habitat-harness/service/base";
import { service } from "@internal/habitat-harness/service/impl";

export type CheckModuleContext = Pick<HabitatServiceDeps, "structuralCheck">;

export const module = service.check.use(({ context, next }) =>
  next({
    context: {
      structuralCheck: context.deps.structuralCheck,
    } satisfies CheckModuleContext,
  })
);
