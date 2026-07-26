import type { DomainOpImplementationsForContracts } from "@swooper/mapgen-core/authoring";

import selectResourceSites from "./select-resource-sites/index.js";

type Contracts = typeof import("./contract.js").default;

/** Site-selection implementations keyed exactly like the branch contract registry. */
const implementations = {
  selectResourceSites,
} as const satisfies DomainOpImplementationsForContracts<Contracts>;

export default implementations;
