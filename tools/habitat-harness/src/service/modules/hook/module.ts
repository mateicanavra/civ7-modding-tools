import type { HookServiceModuleContext } from "@internal/habitat-harness/service/base";
import { service } from "@internal/habitat-harness/service/impl";

export type { HookServiceModuleContext } from "@internal/habitat-harness/service/base";

export const module = service.hook.use(({ context, next }) =>
  next({ context: context.hook ?? {} })
);
