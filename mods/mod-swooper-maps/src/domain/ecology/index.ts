import { defineDomain } from "@swooper/mapgen-core/authoring";

import ops from "./ops/contracts.js";

const domain = defineDomain({ id: "ecology", ops } as const);

export default domain;

export { BiomeEngineBindingsSchema } from "./biome-bindings.js";
export type { BiomeEngineBindings } from "./biome-bindings.js";

export {
  ENGINE_FEATURE_LEGALITY_BY_KEY,
  getEngineFeatureLegality,
  isEngineCompatibleInternalBiome,
} from "./feature-engine-legality.js";
export type { EngineFeatureLegality } from "./feature-engine-legality.js";

export {
  BIOME_SYMBOL_ORDER,
  BIOME_SYMBOL_TO_INDEX,
  FEATURE_KEY_INDEX,
  FEATURE_PLACEMENT_KEYS,
  biomeSymbolFromIndex,
} from "./types.js";
export type { BiomeSymbol, FeatureKey, PlotEffectKey } from "./types.js";
