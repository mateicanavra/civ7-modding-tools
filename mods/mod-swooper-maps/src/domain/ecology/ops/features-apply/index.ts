import { createOp } from "@swooper/mapgen-core/authoring";
import FeaturesApplyContract from "./contract.js";
import { strictSingleOccupancyStrategy } from "./strategies/index.js";

const applyFeatures = createOp(FeaturesApplyContract, {
  strategies: {
    "strict-single-occupancy": strictSingleOccupancyStrategy,
  },
});

export type * from "./contract.js";
export type * from "./types.js";

export default applyFeatures;
