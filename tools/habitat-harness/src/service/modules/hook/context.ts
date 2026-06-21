import type { HookRuntime } from "@internal/habitat-harness/core/domains/hook-runtime/runtime";

export interface HookServiceOptions {
  runtime?: HookRuntime;
}

export interface HookServiceContext {
  readonly hook?: HookServiceOptions;
}
