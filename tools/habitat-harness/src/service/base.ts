import { Context } from "effect";
import type { FixServiceContext } from "./modules/fix/context.js";
import type { HookServiceContext } from "./modules/hook/context.js";

export interface HabitatServiceContext extends FixServiceContext, HookServiceContext {
  readonly correlationId?: string;
}

export class HabitatServiceRuntime extends Context.Tag(
  "@internal/habitat-harness/HabitatServiceRuntime"
)<HabitatServiceRuntime, { readonly service: "habitat" }>() {}
