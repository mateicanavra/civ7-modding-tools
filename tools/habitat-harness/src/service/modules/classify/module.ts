import type { EffectImplementerInternal } from "effect-orpc";
import type { HabitatServiceContext } from "../../base.js";
import {
  type HabitatServiceRequirements,
  type HabitatServiceRuntimeError,
  habitatServiceImplementer as impl,
} from "../../impl.js";
import type { ClassifyServiceContract } from "./contract.js";

export type ClassifyServiceModule = EffectImplementerInternal<
  ClassifyServiceContract,
  HabitatServiceContext & Record<never, never>,
  HabitatServiceContext,
  HabitatServiceRequirements,
  HabitatServiceRuntimeError
>;

export const module: ClassifyServiceModule = impl.classify;
