import { createOp } from "@swooper/mapgen-core/authoring";

import SelectResourceSitesContract from "./contract.js";
import { defaultStrategy } from "./strategies/index.js";

const selectResourceSites = createOp(SelectResourceSitesContract, {
  strategies: { default: defaultStrategy },
});

export type * from "./contract.js";
export type * from "./types.js";

export default selectResourceSites;
