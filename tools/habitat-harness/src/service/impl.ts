import { ManagedRuntime } from "effect";
import { type EffectImplementer, implementEffect } from "effect-orpc";
import {
  type HabitatServiceContext,
  type HabitatServiceRequirements,
  type HabitatServiceRuntimeError,
  habitatServiceLayer,
} from "./context.js";
import { habitatServiceContract } from "./contract.js";

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
