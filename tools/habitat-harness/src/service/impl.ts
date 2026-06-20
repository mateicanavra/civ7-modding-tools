import { Layer, ManagedRuntime } from "effect";
import { type EffectImplementer, implementEffect } from "effect-orpc";
import { HabitatRuntimeLive } from "../runtime/layers.js";
import { type HabitatServiceContext, HabitatServiceRuntime } from "./base.js";
import { habitatServiceContract } from "./contract.js";

export const habitatServiceLayer = Layer.mergeAll(
  HabitatRuntimeLive,
  Layer.succeed(HabitatServiceRuntime, { service: "habitat" })
);

export type HabitatServiceRequirements = Layer.Layer.Success<typeof habitatServiceLayer>;
export type HabitatServiceRuntimeError = Layer.Layer.Error<typeof habitatServiceLayer>;

export const habitatServiceEffectRuntime = ManagedRuntime.make(habitatServiceLayer);

export const habitatServiceImplementer: EffectImplementer<
  typeof habitatServiceContract,
  HabitatServiceContext & Record<never, never>,
  HabitatServiceContext,
  HabitatServiceRequirements,
  HabitatServiceRuntimeError
> = implementEffect(
  habitatServiceContract,
  habitatServiceEffectRuntime
).$context<HabitatServiceContext>();
