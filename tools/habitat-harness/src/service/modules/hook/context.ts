import type { HookRuntime } from "@internal/habitat-harness/core/domains/hook-runtime/runtime";
import { habitatServiceImplementer } from "../../impl.js";

export interface HookServiceModuleContext {
  runtime?: HookRuntime;
}

export const hookModule = habitatServiceImplementer.hook.use(({ context, next }) =>
  next({ context: context.hook ?? {} })
);
