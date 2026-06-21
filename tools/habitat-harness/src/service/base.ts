import { Context } from "effect";

// TODO: base and context are the same thing. either call it base or call it context, but all goes in one place -- its the service definition part, before it's wired in the implementer file

export type { HabitatServiceContext } from "./context.js";

export class HabitatServiceRuntime extends Context.Tag(
  "@internal/habitat-harness/HabitatServiceRuntime"
)<HabitatServiceRuntime, { readonly service: "habitat" }>() {}
