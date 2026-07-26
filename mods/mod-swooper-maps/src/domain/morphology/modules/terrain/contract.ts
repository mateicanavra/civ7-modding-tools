import { defineDomainSubdomain } from "@swooper/mapgen-core/authoring/contracts";
import ops from "./ops/contract.js";

/** Terrain branch contract for tectonic drivers, base relief, sea level, landmask, and substrate. */
const terrain = defineDomainSubdomain({ id: "terrain", ops });
export default terrain;
