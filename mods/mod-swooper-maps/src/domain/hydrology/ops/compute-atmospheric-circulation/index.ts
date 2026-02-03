import { createOp } from "@swooper/mapgen-core/authoring";
import ComputeAtmosphericCirculationContract from "./contract.js";
import { defaultStrategy, earthlikeStrategy } from "./strategies/index.js";

const computeAtmosphericCirculation = createOp(ComputeAtmosphericCirculationContract, {
  strategies: { default: defaultStrategy, earthlike: earthlikeStrategy },
});

export type * from "./types.js";
export type * from "./contract.js";

export default computeAtmosphericCirculation;
