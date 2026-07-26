import { createStrategy } from "@swooper/mapgen-core/authoring";
import ComputeTectonicsCurrentContract from "../../contract.js";
import { buildTectonicsCurrent } from "../../rules/index.js";
import NewestEraCompositeDefinition from "./config.js";

/** Attaches newest-era composition to the current-tectonics operation contract. */
export default createStrategy(ComputeTectonicsCurrentContract, NewestEraCompositeDefinition, {
  run: (input) => {
    const tectonics = buildTectonicsCurrent({
      newestEra: input.newestEra,
      upliftTotal: input.upliftTotal,
    });
    return { tectonics } as const;
  },
});
