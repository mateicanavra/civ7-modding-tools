import { createStrategy } from "@swooper/mapgen-core/authoring";
import { scoreDrylandWaterpoint } from "../../../../model/policy/dryland-waterpoint-score.js";
import Contract from "../../contract.js";
import StrategyDefinition from "./config.js";

export default createStrategy(Contract, StrategyDefinition, {
  run: (input, config) => ({
    score01: scoreDrylandWaterpoint({
      size: input.width * input.height,
      landMask: input.landMask,
      localSurfaceWaterOpportunity: input.localSurfaceWaterOpportunity,
      pet: input.pet,
      aridityIndex: input.aridityIndex,
      ...config,
    }),
  }),
});
