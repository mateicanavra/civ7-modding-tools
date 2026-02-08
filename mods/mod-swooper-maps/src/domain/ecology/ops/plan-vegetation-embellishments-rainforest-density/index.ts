import { createOp } from "@swooper/mapgen-core/authoring";

import PlanVegetationEmbellishmentsRainforestDensityContract from "./contract.js";
import { defaultStrategy } from "./strategies/index.js";

const planVegetationEmbellishmentsRainforestDensity = createOp(
  PlanVegetationEmbellishmentsRainforestDensityContract,
  {
    strategies: { default: defaultStrategy },
  }
);

export type * from "./contract.js";

export default planVegetationEmbellishmentsRainforestDensity;

