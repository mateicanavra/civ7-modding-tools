import { defineDomain } from "@swooper/mapgen-core/authoring/contracts";

import regions from "./modules/regions/contract.js";
import starts from "./modules/starts/contract.js";
import wonders from "./modules/wonders/contract.js";

/** Placement contract composed from wonder planning into player-start assignment. */
const placement = defineDomain("placement", {
  wonders,
  regions,
  starts,
});

export default placement;
