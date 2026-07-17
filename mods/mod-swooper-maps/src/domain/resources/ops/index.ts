import type { DomainOpImplementationsForContracts } from "@swooper/mapgen-core/authoring";
import adjustResourceSupport from "./adjust-resource-support/index.js";
import type { contracts } from "./contracts.js";
import deriveHabitatFields from "./derive-habitat-fields/index.js";
import planAquaticResources from "./plan-aquatic-resources/index.js";
import planCultivatedResources from "./plan-cultivated-resources/index.js";
import planGeologicalResources from "./plan-geological-resources/index.js";
import planResourceGroups from "./plan-resource-groups/index.js";
import planTerrestrialResources from "./plan-terrestrial-resources/index.js";
import selectResourceSites from "./select-resource-sites/index.js";

/** Resources operation implementations keyed exactly like the domain's contract registry. */
const implementations = {
  adjustResourceSupport,
  deriveHabitatFields,
  planAquaticResources,
  planCultivatedResources,
  planGeologicalResources,
  planResourceGroups,
  planTerrestrialResources,
  selectResourceSites,
} as const satisfies DomainOpImplementationsForContracts<typeof contracts>;

export default implementations;
