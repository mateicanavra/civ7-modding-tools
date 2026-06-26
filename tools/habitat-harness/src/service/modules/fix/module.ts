import type { EffectImplementerInternal } from "effect-orpc";
import type { HabitatServiceContext } from "../../base.js";
import {
  type HabitatServiceRequirements,
  type HabitatServiceRuntimeError,
  habitatServiceImplementer as impl,
} from "../../impl.js";
import type { FixServiceContract } from "./contract.js";

export type FixServiceModule = EffectImplementerInternal<
  FixServiceContract,
  HabitatServiceContext & Record<never, never>,
  HabitatServiceContext,
  HabitatServiceRequirements,
  HabitatServiceRuntimeError
>;

export const module: FixServiceModule = impl.fix;
