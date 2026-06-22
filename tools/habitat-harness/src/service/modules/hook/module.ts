import type { HookServiceModuleContext } from "../../context.js";
import { service } from "../../impl.js";

export type { HookServiceModuleContext } from "../../context.js";

export const module = service.hook.use(({ context, next }) =>
  next({ context: context.hook ?? {} })
);
