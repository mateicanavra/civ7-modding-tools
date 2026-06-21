import { HabitatRuntimeLive } from "@internal/habitat-harness/service/runtime/layers";
import { Context, Layer } from "effect";
import type { CheckServiceModuleContext } from "./modules/check/context.js";
import type { ClassifyServiceModuleContext } from "./modules/classify/context.js";
import type { FixServiceModuleContext } from "./modules/fix/context.js";
import type { GraphServiceModuleContext } from "./modules/graph/context.js";
import type { HookServiceModuleContext } from "./modules/hook/context.js";
import type { VerifyServiceModuleContext } from "./modules/verify/context.js";

export interface HabitatServiceContext {
  readonly check?: CheckServiceModuleContext;
  readonly classify?: ClassifyServiceModuleContext;
  readonly fix?: FixServiceModuleContext;
  readonly graph?: GraphServiceModuleContext;
  readonly hook?: HookServiceModuleContext;
  readonly verify?: VerifyServiceModuleContext;
  readonly correlationId?: string;
}

export class HabitatServiceRuntime extends Context.Tag(
  "@internal/habitat-harness/HabitatServiceRuntime"
)<HabitatServiceRuntime, { readonly service: "habitat" }>() {}

export const habitatServiceLayer = Layer.mergeAll(
  HabitatRuntimeLive,
  Layer.succeed(HabitatServiceRuntime, { service: "habitat" })
);

export type HabitatServiceRequirements = Layer.Layer.Success<typeof habitatServiceLayer>;
export type HabitatServiceRuntimeError = Layer.Layer.Error<typeof habitatServiceLayer>;
