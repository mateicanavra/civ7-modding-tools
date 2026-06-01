import type { DomainOpImplementationsForContracts } from "@swooper/mapgen-core/authoring";
import type { contracts } from "./contracts.js";

import planAquaticResources from "./plan-aquatic-resources/index.js";
import planCultivatedResources from "./plan-cultivated-resources/index.js";
import planGeologicalResources from "./plan-geological-resources/index.js";
import planResourceGroups from "./plan-resource-groups/index.js";
import planTerrestrialResources from "./plan-terrestrial-resources/index.js";

const implementations = {
  planAquaticResources,
  planCultivatedResources,
  planGeologicalResources,
  planResourceGroups,
  planTerrestrialResources,
} as const satisfies DomainOpImplementationsForContracts<typeof contracts>;

export default implementations;

export {
  planAquaticResources,
  planCultivatedResources,
  planGeologicalResources,
  planResourceGroups,
  planTerrestrialResources,
};
