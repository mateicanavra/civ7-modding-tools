import { createStrategy } from "@swooper/mapgen-core/authoring";
import ComputeTectonicsCurrentContract from "../contract.js";
import { buildTectonicsCurrent } from "../rules/index.js";

export const defaultStrategy = createStrategy(ComputeTectonicsCurrentContract, "default", {
  run: (input) => {
    const tectonics = buildTectonicsCurrent({
      newestEra: input.newestEra,
      upliftTotal: input.upliftTotal,
    });
    return { tectonics } as const;
  },
});
