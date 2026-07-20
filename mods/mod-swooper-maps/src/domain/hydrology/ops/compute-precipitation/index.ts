import { createOp } from "@swooper/mapgen-core/authoring";
import ComputePrecipitationContract from "./contract.js";
import { baselineStrategy, refineStrategy, vectorStrategy } from "./strategies/index.js";

/** Computes precipitation through the selected vector, baseline, or explicit refinement mechanism. */
const computePrecipitation = createOp(ComputePrecipitationContract, {
  strategies: {
    vector: vectorStrategy,
    baseline: baselineStrategy,
    refine: refineStrategy,
  },
});

export type * from "./contract.js";
export type * from "./types.js";

export default computePrecipitation;
