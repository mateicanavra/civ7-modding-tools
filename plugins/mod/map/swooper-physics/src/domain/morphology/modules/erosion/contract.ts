import { defineDomainSubdomain } from "@swooper/mapgen-core/authoring/contracts";
import ComputeGeomorphicCycleContract from "./ops/compute-geomorphic-cycle/contract.js";

/** Erosion branch contract for the geomorphic cycle that reshapes relief and substrate. */
const erosion = defineDomainSubdomain({
  id: "erosion",
  ops: { computeGeomorphicCycle: ComputeGeomorphicCycleContract },
});
export default erosion;
