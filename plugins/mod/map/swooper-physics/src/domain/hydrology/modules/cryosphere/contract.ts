import { defineDomainSubdomain } from "@swooper/mapgen-core/authoring/contracts";

import ApplyAlbedoFeedbackContract from "./ops/apply-albedo-feedback/contract.js";
import ComputeCryosphereStateContract from "./ops/compute-cryosphere-state/contract.js";

/** Cryosphere branch contract for snow, ground ice, and albedo feedback. */
const cryosphere = defineDomainSubdomain({
  id: "cryosphere",
  ops: {
    computeCryosphereState: ComputeCryosphereStateContract,
    applyAlbedoFeedback: ApplyAlbedoFeedbackContract,
  },
});

export default cryosphere;
