import type { HookServiceModuleContext } from "../../context.js";
import { habitatServiceImplementer } from "../../impl.js";

export type { HookServiceModuleContext } from "../../context.js";

export const implementer = habitatServiceImplementer.hook.use(({ context, next }) =>
  next({ context: context.hook ?? {} })
);
