import {
  type FixServiceModuleContext,
  requiredHabitatServiceDependency,
} from "@internal/habitat-harness/service/base";
import { service } from "@internal/habitat-harness/service/impl";

export type { FixServiceModuleContext } from "@internal/habitat-harness/service/base";

export const module = service.fix.use(({ context, next }) =>
  next({
    context: {
      ...(context.fix ?? {}),
      grit: requiredHabitatServiceDependency(context.deps.grit, "grit"),
    } satisfies FixServiceModuleContext,
  })
);
