import type { DomainOpImplementationsForContracts } from "@swooper/mapgen-core/authoring";

import planAquaticResources from "./plan-aquatic-resources/index.js";
import planCultivatedResources from "./plan-cultivated-resources/index.js";
import planGeologicalResources from "./plan-geological-resources/index.js";
import planResourceGroups from "./plan-resource-groups/index.js";
import planTerrestrialResources from "./plan-terrestrial-resources/index.js";

type Contracts = typeof import("./contract.js").default;

/** Demand implementations keyed exactly like the branch contract registry. */
const implementations = {
  planAquaticResources,
  planCultivatedResources,
  planGeologicalResources,
  planResourceGroups,
  planTerrestrialResources,
} as const satisfies DomainOpImplementationsForContracts<Contracts>;

export default implementations;
