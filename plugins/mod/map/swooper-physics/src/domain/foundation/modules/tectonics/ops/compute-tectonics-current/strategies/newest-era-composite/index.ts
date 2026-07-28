import { createStrategy } from "@swooper/mapgen-core/authoring";
import ComputeTectonicsCurrentContract from "../../contract.js";
import { buildTectonicsCurrent } from "../../rules/index.js";
import NewestEraCompositeDefinition from "./config.js";

/**
 * Copies present-day boundary and stress evidence from the newest era and joins it with cumulative
 * uplift from the full history. This keeps "current" and "cumulative" vintages explicit in one
 * downstream product.
 */
export default createStrategy(ComputeTectonicsCurrentContract, NewestEraCompositeDefinition, {
  run: (input) => {
    const tectonics = buildTectonicsCurrent({
      newestEra: input.newestEra,
      upliftTotal: input.upliftTotal,
    });
    return { tectonics } as const;
  },
});
