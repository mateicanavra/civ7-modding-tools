import { habitatServiceManagedRuntime } from "@internal/habitat-harness/runtime/service-runtime";
import {
  type HabitatServiceContext,
  type HabitatServiceRequirements,
  type HabitatServiceRuntimeError,
} from "@internal/habitat-harness/service/base";
import {
  type HabitatServiceContract,
  habitatServiceContract,
} from "@internal/habitat-harness/service/contract";
import { type EffectImplementer, eoc, implementEffect } from "effect-orpc";

const habitatServiceOrpcContract = eoc.router(habitatServiceContract);

export const service: EffectImplementer<
  HabitatServiceContract,
  HabitatServiceContext & Record<never, never>,
  HabitatServiceContext,
  HabitatServiceRequirements,
  HabitatServiceRuntimeError
> = implementEffect(
  habitatServiceOrpcContract,
  habitatServiceManagedRuntime
).$context<HabitatServiceContext>();
