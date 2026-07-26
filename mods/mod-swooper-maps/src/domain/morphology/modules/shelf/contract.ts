import { defineDomainSubdomain } from "@swooper/mapgen-core/authoring/contracts";
import ops from "./ops/contract.js";

/** Shelf branch contract for classifying connected shallow-water habitat around land. */
const shelf = defineDomainSubdomain({ id: "shelf", ops });
export default shelf;
