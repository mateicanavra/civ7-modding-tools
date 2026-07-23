import type { DomainOpImplementationsForContracts } from "@swooper/mapgen-core/authoring";

import type { contracts } from "./contracts.js";
import selectResourceSites from "./select-resource-sites/index.js";

/** Site-selection implementations keyed exactly like the branch contract registry. */
const implementations = {
  selectResourceSites,
} as const satisfies DomainOpImplementationsForContracts<typeof contracts>;

export default implementations;
