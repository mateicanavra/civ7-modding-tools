import type { EffectImplementerInternal } from "effect-orpc";
import type { HabitatServiceContext } from "../../base.js";
import {
  type HabitatServiceRequirements,
  type HabitatServiceRuntimeError,
  habitatServiceImplementer as impl,
} from "../../impl.js";
import type { HookServiceContract } from "./contract.js";

export type HookServiceModule = EffectImplementerInternal<
  HookServiceContract,
  HabitatServiceContext & Record<never, never>,
  HabitatServiceContext,
  HabitatServiceRequirements,
  HabitatServiceRuntimeError
>;

export const module: HookServiceModule = impl.hook;
