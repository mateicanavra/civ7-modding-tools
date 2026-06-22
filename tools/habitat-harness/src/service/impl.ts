import {
  type HabitatServiceContext,
  type HabitatServiceRequirements,
  type HabitatServiceRuntimeError,
  habitatServiceLayer,
} from "@internal/habitat-harness/service/base";
import {
  type HabitatServiceContract,
  habitatServiceContract,
} from "@internal/habitat-harness/service/contract";
import { ManagedRuntime } from "effect";
import { type EffectImplementer, eoc, implementEffect } from "effect-orpc";

const habitatServiceOrpcContract = eoc.router(habitatServiceContract);
export const habitatServiceEffectRuntime = ManagedRuntime.make(habitatServiceLayer);

export const service: EffectImplementer<
  HabitatServiceContract,
  HabitatServiceContext & Record<never, never>,
  HabitatServiceContext,
  HabitatServiceRequirements,
  HabitatServiceRuntimeError
> = implementEffect(
  habitatServiceOrpcContract,
  habitatServiceEffectRuntime
).$context<HabitatServiceContext>();
