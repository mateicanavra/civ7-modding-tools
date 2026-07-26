import { defineDomainSubdomain } from "@swooper/mapgen-core/authoring/contracts";
import ops from "./ops/contract.js";

/** Coasts branch contract for margin sculpting, coastline metrics, and coastal topology. */
const coasts = defineDomainSubdomain({ id: "coasts", ops });
export default coasts;
