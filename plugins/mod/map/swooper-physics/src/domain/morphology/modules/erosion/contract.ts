import { defineDomainSubdomain } from "@swooper/mapgen-core/authoring/contracts";
import ComputeGeomorphicCycleContract from "./ops/compute-geomorphic-cycle/contract.js";
import ComputeChannelIncisionContract from "./ops/compute-channel-incision/contract.js";
import ComputeChannelTopographyContract from "./ops/compute-channel-topography/contract.js";

/** Initial geomorphic shaping and precise channel response to certified hydraulic evidence. */
const erosion = defineDomainSubdomain({
  id: "erosion",
  ops: {
    computeGeomorphicCycle: ComputeGeomorphicCycleContract,
    computeChannelIncision: ComputeChannelIncisionContract,
    computeChannelTopography: ComputeChannelTopographyContract,
  },
});
export default erosion;
