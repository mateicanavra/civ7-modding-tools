import type { ClassifyServiceModuleContext } from "@internal/habitat-harness/service/base";
import { service } from "@internal/habitat-harness/service/impl";

export const module = service.classify.use(({ context, next }) =>
  next({
    context: {
      ...(context.classify ?? {}),
      options: context.classify?.options,
    },
  })
);
