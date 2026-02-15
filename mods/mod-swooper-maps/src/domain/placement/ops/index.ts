import type { DomainOpImplementationsForContracts } from "@swooper/mapgen-core/authoring";
import type { contracts } from "./contracts.js";

import planDiscoveries from "./plan-discoveries/index.js";
import planFloodplains from "./plan-floodplains/index.js";
import planNaturalWonders from "./plan-natural-wonders/index.js";
import planResources from "./plan-resources/index.js";
import planStarts from "./plan-starts/index.js";
import planWonders from "./plan-wonders/index.js";

const implementations = {
  planDiscoveries,
  planFloodplains,
  planNaturalWonders,
  planResources,
  planStarts,
  planWonders,
} as const satisfies DomainOpImplementationsForContracts<typeof contracts>;

export default implementations;

export { planDiscoveries, planFloodplains, planNaturalWonders, planResources, planStarts, planWonders };
