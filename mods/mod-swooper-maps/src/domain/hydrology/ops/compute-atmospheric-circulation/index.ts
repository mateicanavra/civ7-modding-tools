import { createOp } from "@swooper/mapgen-core/authoring";
import ComputeAtmosphericCirculationContract from "./contract.js";
import { defaultStrategy, latitudeStrategy } from "./strategies/index.js";

const computeAtmosphericCirculation = createOp(ComputeAtmosphericCirculationContract, {
  strategies: { default: defaultStrategy, latitude: latitudeStrategy },
});

export type * from "./types.js";
export type * from "./contract.js";

export default computeAtmosphericCirculation;
