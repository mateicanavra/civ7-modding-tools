import { defineDomainSubdomain } from "@swooper/mapgen-core/authoring/contracts";
import ops from "./ops/contract.js";

/** Landforms branch contract for connected land, relief features, and volcanic intent. */
const landforms = defineDomainSubdomain({ id: "landforms", ops });
export default landforms;
