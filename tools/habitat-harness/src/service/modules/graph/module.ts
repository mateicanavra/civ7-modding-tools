import type { EffectImplementerInternal } from "effect-orpc";
import type { HabitatServiceContext } from "../../base.js";
import {
  type HabitatServiceRequirements,
  type HabitatServiceRuntimeError,
  habitatServiceImplementer as impl,
} from "../../impl.js";
import type { GraphServiceContract } from "./contract.js";

export type GraphServiceModule = EffectImplementerInternal<
  GraphServiceContract,
  HabitatServiceContext & Record<never, never>,
  HabitatServiceContext,
  HabitatServiceRequirements,
  HabitatServiceRuntimeError
>;

export const module: GraphServiceModule = impl.graph;
