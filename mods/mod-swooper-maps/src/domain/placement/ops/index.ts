import type { DomainOpImplementationsForContracts } from "@swooper/mapgen-core/authoring";
import type { contracts } from "./contracts.js";

import planDiscoveries from "./plan-discoveries/index.js";
import planNaturalWonders from "./plan-natural-wonders/index.js";
import planStarts from "./plan-starts/index.js";
import planWonders from "./plan-wonders/index.js";

const implementations = {
  planDiscoveries,
  planNaturalWonders,
  planStarts,
  planWonders,
} as const satisfies DomainOpImplementationsForContracts<typeof contracts>;

export default implementations;

export { planDiscoveries, planNaturalWonders, planStarts, planWonders };
