import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeEraPlateMembershipContract from "./contract.js";
import { defaultStrategy } from "./strategies/index.js";

const computeEraPlateMembership = createOp(ComputeEraPlateMembershipContract, {
  strategies: {
    default: defaultStrategy,
  },
});

export default computeEraPlateMembership;
