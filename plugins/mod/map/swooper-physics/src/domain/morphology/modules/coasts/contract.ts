import { defineDomainSubdomain } from "@swooper/mapgen-core/authoring/contracts";
import ComputeCoastalAdjacencyContract from "./ops/compute-coastal-adjacency/contract.js";
import ComputeDistanceToCoastContract from "./ops/compute-distance-to-coast/contract.js";
import ComputeSculptContinentalMarginContract from "./ops/compute-sculpt-continental-margin/contract.js";

/** Coasts branch contract for margin sculpting and derived coastal topology. */
const coasts = defineDomainSubdomain({
  id: "coasts",
  ops: {
    computeSculptContinentalMargin: ComputeSculptContinentalMarginContract,
    computeCoastalAdjacency: ComputeCoastalAdjacencyContract,
    computeDistanceToCoast: ComputeDistanceToCoastContract,
  },
});
export default coasts;
