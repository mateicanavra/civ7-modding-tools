import { createOp } from "@swooper/mapgen-core/authoring";
import ComputeRadiativeForcingContract from "./contract.js";
import { defaultStrategy } from "./strategies/index.js";

const computeRadiativeForcing = createOp(ComputeRadiativeForcingContract, {
  strategies: { default: defaultStrategy },
});

export type * from "./contract.js";
export type * from "./types.js";

export default computeRadiativeForcing;
