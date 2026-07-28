import { defineDomainSubdomain } from "@swooper/mapgen-core/authoring/contracts";
import ComputeShelfMaskContract from "./ops/compute-shelf-mask/contract.js";

/** Shelf branch contract for classifying connected shallow-water habitat around land. */
const shelf = defineDomainSubdomain({
  id: "shelf",
  ops: { computeShelfMask: ComputeShelfMaskContract },
});
export default shelf;
