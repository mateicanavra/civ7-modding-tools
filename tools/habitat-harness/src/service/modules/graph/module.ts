import type { GraphServiceModuleContext } from "@internal/habitat-harness/service/base";
import { service } from "@internal/habitat-harness/service/impl";

export const module = service.graph.use(({ context, next }) =>
  next({ context: context.graph ?? {} })
);
