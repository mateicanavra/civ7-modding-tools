import type { HookRuntime } from "@internal/habitat-harness/service/modules/hook/runtime/runtime";
import { habitatServiceImplementer } from "../../impl.js";

export interface HookServiceModuleContext {
  runtime?: HookRuntime;
}

export const implementer = habitatServiceImplementer.hook.use(({ context, next }) =>
  next({ context: context.hook ?? {} })
);
