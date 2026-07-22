import { createOp } from "@swooper/mapgen-core/authoring";
import ComputeOceanThermalStateContract from "./contract.js";
import { latitudeCurrentAdvectionStrategy } from "./strategies/index.js";

const computeOceanThermalState = createOp(ComputeOceanThermalStateContract, {
  strategies: { "latitude-current-advection": latitudeCurrentAdvectionStrategy },
});

export type * from "./contract.js";
export type * from "./types.js";

export default computeOceanThermalState;
