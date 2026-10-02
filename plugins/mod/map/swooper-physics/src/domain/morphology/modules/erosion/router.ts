import { createDomainSubdomainRouter } from "@swooper/mapgen-core/authoring";
import contract from "./contract.js";
import computeGeomorphicCycle from "./ops/compute-geomorphic-cycle/index.js";
import computeChannelIncision from "./ops/compute-channel-incision/index.js";

/** Binds initial shaping and later certified channel incision without owning hydrologic routing. */
const erosion = createDomainSubdomainRouter(contract, {
  computeGeomorphicCycle,
  computeChannelIncision,
});
export default erosion;
