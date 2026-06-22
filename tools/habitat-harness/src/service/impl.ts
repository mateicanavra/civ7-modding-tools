import {
  type HabitatServiceContext,
  type HabitatServiceRequirements,
  type HabitatServiceRuntimeError,
  HabitatServiceRuntime,
} from "@internal/habitat-harness/service/base";
import {
  type HabitatServiceContract,
  habitatServiceContract,
} from "@internal/habitat-harness/service/contract";
import { HabitatRuntimeLive } from "@internal/habitat-harness/service/runtime/layers";
import { Layer, ManagedRuntime } from "effect";
import { type EffectImplementer, eoc, implementEffect } from "effect-orpc";

const habitatServiceOrpcContract = eoc.router(habitatServiceContract);
export const habitatServiceEffectRuntime = ManagedRuntime.make(
  Layer.mergeAll(
    HabitatRuntimeLive,
    Layer.succeed(HabitatServiceRuntime, { service: "habitat" as const })
  )
);

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
