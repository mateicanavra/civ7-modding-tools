import { defineDomain } from "@swooper/mapgen-core/authoring/contracts";

import ops from "./ops/contracts.js";

const domain = defineDomain({ id: "ecology", ops } as const);

export default domain;

export type { PlotEffectIntentKey } from "./model/schemas/index.js";
export {
  BIOME_SYMBOL_ORDER,
  BIOME_SYMBOL_TO_INDEX,
  PLOT_EFFECT_INTENT_KEYS,
  biomeSymbolFromIndex,
  type BiomeSymbol,
} from "./model/schemas/index.js";
