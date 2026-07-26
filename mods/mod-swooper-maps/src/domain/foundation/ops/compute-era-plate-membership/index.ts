import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeEraPlateMembershipContract from "./contract.js";
import { backwardDriftStrategy } from "./strategies/index.js";

const computeEraPlateMembership = createOp(ComputeEraPlateMembershipContract, {
  strategies: {
    "backward-drift": backwardDriftStrategy,
  },
});

export default computeEraPlateMembership;
