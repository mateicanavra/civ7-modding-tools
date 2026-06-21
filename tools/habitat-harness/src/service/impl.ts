import { BaselineAuthorityLive } from "@internal/habitat-harness/core/domains/baseline-authority/index";
import { StructuralCheckLive } from "@internal/habitat-harness/core/domains/structural-check/index";
import { HabitatRuntimeLive } from "@internal/habitat-harness/service/runtime/layers";
import { Layer, ManagedRuntime } from "effect";
import { type EffectImplementer, implementEffect } from "effect-orpc";
import { type HabitatServiceContext, HabitatServiceRuntime } from "./base.js";
import { habitatServiceContract } from "./contract.js";

export const habitatServiceLayer = Layer.mergeAll(
  HabitatRuntimeLive,
  BaselineAuthorityLive,
  StructuralCheckLive,
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
