import { createOp } from "@swooper/mapgen-core/authoring";
import ComputeOceanThermalStateContract from "./contract.js";
import { defaultStrategy } from "./strategies/index.js";

const computeOceanThermalState = createOp(ComputeOceanThermalStateContract, {
  strategies: { default: defaultStrategy },
});

export type * from "./contract.js";
export type * from "./types.js";

export default computeOceanThermalState;
