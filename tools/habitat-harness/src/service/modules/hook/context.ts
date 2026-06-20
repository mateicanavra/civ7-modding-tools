import type { HookRuntime } from "../../../domains/hook-runtime/runtime.js";

export interface HookServiceOptions {
  runtime?: HookRuntime;
}

export interface HookServiceContext {
  readonly hook?: HookServiceOptions;
}
