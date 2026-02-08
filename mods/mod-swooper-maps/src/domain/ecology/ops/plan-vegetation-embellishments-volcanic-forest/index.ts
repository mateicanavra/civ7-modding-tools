import { createOp } from "@swooper/mapgen-core/authoring";

import PlanVegetationEmbellishmentsVolcanicForestContract from "./contract.js";
import { defaultStrategy } from "./strategies/index.js";

const planVegetationEmbellishmentsVolcanicForest = createOp(
  PlanVegetationEmbellishmentsVolcanicForestContract,
  {
    strategies: { default: defaultStrategy },
  }
);

export type * from "./contract.js";

export default planVegetationEmbellishmentsVolcanicForest;

