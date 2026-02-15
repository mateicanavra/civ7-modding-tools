import { createStrategy } from "@swooper/mapgen-core/authoring";

import { buildTectonicsCurrent } from "../rules/index.js";
import ComputeTectonicsCurrentContract from "../contract.js";

export const defaultStrategy = createStrategy(ComputeTectonicsCurrentContract, "default", {
  run: (input) => {
    const tectonics = buildTectonicsCurrent({
      newestEra: input.newestEra,
      upliftTotal: input.upliftTotal,
    });
    return { tectonics } as const;
  },
});
