import { Context } from "effect";
import type { FixServiceContext } from "./modules/fix/context.js";

export interface HabitatServiceContext extends FixServiceContext {
  readonly correlationId?: string;
}

export class HabitatServiceRuntime extends Context.Tag(
  "@internal/habitat-harness/HabitatServiceRuntime"
)<HabitatServiceRuntime, { readonly service: "habitat" }>() {}
