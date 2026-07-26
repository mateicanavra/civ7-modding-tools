import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring";

import contract from "./contract.js";
import applyAlbedoFeedback from "./ops/apply-albedo-feedback/index.js";
import computeCryosphereState from "./ops/compute-cryosphere-state/index.js";

/** Executable Hydrology cryosphere branch. */
const cryosphere = createDomainSubdomainRouter(contract, {
  computeCryosphereState,
  applyAlbedoFeedback,
});

export default cryosphere;
