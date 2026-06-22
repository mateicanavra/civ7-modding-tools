import { ManagedRuntime } from "effect";
import { type EffectImplementer, eoc, implementEffect } from "effect-orpc";
import {
  type HabitatServiceContext,
  type HabitatServiceRequirements,
  type HabitatServiceRuntimeError,
  habitatServiceLayer,
} from "./context.js";
import { type HabitatServiceContract, habitatServiceContract } from "./contract.js";

const habitatServiceOrpcContract = eoc.router(habitatServiceContract);
export const habitatServiceEffectRuntime = ManagedRuntime.make(habitatServiceLayer);

export const habitatServiceImplementer: EffectImplementer<
  HabitatServiceContract,
  HabitatServiceContext & Record<never, never>,
  HabitatServiceContext,
  HabitatServiceRequirements,
  HabitatServiceRuntimeError
> = implementEffect(
  habitatServiceOrpcContract,
  habitatServiceEffectRuntime
).$context<HabitatServiceContext>();
