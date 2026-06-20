import type { HookRuntime } from "../../../lib/hook-runtime/runtime.js";

export interface HookServiceOptions {
  runtime?: HookRuntime;
}

export interface HookServiceContext {
  readonly hook?: HookServiceOptions;
}
