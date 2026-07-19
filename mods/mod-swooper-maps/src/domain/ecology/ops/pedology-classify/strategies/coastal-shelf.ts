import { createStrategy } from "@swooper/mapgen-core/authoring";
import PedologyClassifyContract from "../contract.js";
import { classifyPedology } from "../rules/index.js";

export const coastalShelfStrategy = createStrategy(PedologyClassifyContract, "coastal-shelf", {
  run: (input, config) => {
    // Coastal shelves emphasize sediment and moisture slightly more.
    const boosted = {
      ...config,
      sedimentWeight: config.sedimentWeight * 1.2,
      climateWeight: config.climateWeight * 1.1,
    };
    return classifyPedology(input, boosted);
  },
});
