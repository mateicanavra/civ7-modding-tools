import { defineDomain } from "@swooper/mapgen-core/authoring/contracts";

import starts from "./modules/starts/contract.js";
import wonders from "./modules/wonders/contract.js";

/** Placement contract composed from wonder planning into player-start assignment. */
const placement = defineDomain("placement", {
  wonders,
  starts,
});

export default placement;
