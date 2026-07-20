import { createStrategy } from "@swooper/mapgen-core/authoring";
import ResourcePlanBasinsContract from "../contract.js";
import { planResourceBasins } from "../rules/index.js";

export const hydroFluvialStrategy = createStrategy(ResourcePlanBasinsContract, "hydro-fluvial", {
  run: (input, config) => {
    const boosted = {
      ...config,
      resources: config.resources.map((res) => ({
        ...res,
        moistureBias: res.moistureBias * 1.5,
      })),
    };
    return planResourceBasins(input, boosted);
  },
});
