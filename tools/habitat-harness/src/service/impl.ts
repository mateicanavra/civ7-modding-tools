import { HabitatRuntimeLive } from "@internal/habitat-harness/service/runtime/layers";
import { Layer, ManagedRuntime } from "effect";
import { type EffectImplementer, implementEffect } from "effect-orpc";
import { HabitatServiceRuntime } from "./base.js";
import type { HabitatServiceContext } from "./context.js";
import { habitatServiceContract } from "./contract.js";

export const habitatServiceLayer = Layer.mergeAll(
  HabitatRuntimeLive,
  Layer.succeed(HabitatServiceRuntime, { service: "habitat" })
);

export type HabitatServiceRequirements = Layer.Layer.Success<typeof habitatServiceLayer>;
export type HabitatServiceRuntimeError = Layer.Layer.Error<typeof habitatServiceLayer>;

export const habitatServiceEffectRuntime = ManagedRuntime.make(habitatServiceLayer);

export type HabitatServiceImplementer = EffectImplementer<
  typeof habitatServiceContract,
  HabitatServiceContext & Record<never, never>,
  HabitatServiceContext,
  HabitatServiceRequirements,
  HabitatServiceRuntimeError
>;

export const habitatServiceImplementer: HabitatServiceImplementer = implementEffect(
  habitatServiceContract,
  habitatServiceEffectRuntime
).$context<HabitatServiceContext>();
