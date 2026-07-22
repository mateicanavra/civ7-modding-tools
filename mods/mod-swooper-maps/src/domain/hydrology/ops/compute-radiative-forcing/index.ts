import { createOp } from "@swooper/mapgen-core/authoring";
import ComputeRadiativeForcingContract from "./contract.js";
import { latitudeInsolationStrategy } from "./strategies/index.js";

const computeRadiativeForcing = createOp(ComputeRadiativeForcingContract, {
  strategies: { "latitude-insolation": latitudeInsolationStrategy },
});

export type * from "./contract.js";
export type * from "./types.js";

export default computeRadiativeForcing;
