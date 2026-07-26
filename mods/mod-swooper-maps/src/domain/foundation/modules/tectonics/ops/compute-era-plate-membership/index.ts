import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeEraPlateMembershipContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Reconstructs historical plate membership by drifting current plate seeds backward through time. */
const computeEraPlateMembership = createOp(ComputeEraPlateMembershipContract, {
  strategies,
});

export default computeEraPlateMembership;
