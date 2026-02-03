import { createOp } from "@swooper/mapgen-core/authoring";
import ComputePrecipitationContract from "./contract.js";
import { basicStrategy, defaultStrategy, refineStrategy } from "./strategies/index.js";

const computePrecipitation = createOp(ComputePrecipitationContract, {
  strategies: {
    default: defaultStrategy,
    basic: basicStrategy,
    refine: refineStrategy,
  },
});

export type * from "./types.js";
export type * from "./contract.js";

export default computePrecipitation;
