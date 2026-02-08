import { createOp } from "@swooper/mapgen-core/authoring";

import PlanVegetationEmbellishmentsVolcanicTaigaContract from "./contract.js";
import { defaultStrategy } from "./strategies/index.js";

const planVegetationEmbellishmentsVolcanicTaiga = createOp(
  PlanVegetationEmbellishmentsVolcanicTaigaContract,
  {
    strategies: { default: defaultStrategy },
  }
);

export type * from "./contract.js";

export default planVegetationEmbellishmentsVolcanicTaiga;

