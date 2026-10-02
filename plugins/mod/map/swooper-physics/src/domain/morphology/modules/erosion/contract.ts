import { defineDomainSubdomain } from "@swooper/mapgen-core/authoring/contracts";
import ComputeGeomorphicCycleContract from "./ops/compute-geomorphic-cycle/contract.js";
import ComputeChannelIncisionContract from "./ops/compute-channel-incision/contract.js";

/** Initial geomorphic shaping and precise channel response to certified hydraulic evidence. */
const erosion = defineDomainSubdomain({
  id: "erosion",
  ops: {
    computeGeomorphicCycle: ComputeGeomorphicCycleContract,
    computeChannelIncision: ComputeChannelIncisionContract,
  },
});
export default erosion;
