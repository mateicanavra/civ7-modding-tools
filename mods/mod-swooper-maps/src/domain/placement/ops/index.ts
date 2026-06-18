import type { DomainOpImplementationsForContracts } from "@swooper/mapgen-core/authoring";
import type { contracts } from "./contracts.js";

import planNaturalWonders from "./plan-natural-wonders/index.js";
import planStarts from "./plan-starts/index.js";
import planWonders from "./plan-wonders/index.js";

const implementations = {
  planNaturalWonders,
  planStarts,
  planWonders,
} as const satisfies DomainOpImplementationsForContracts<typeof contracts>;

export default implementations;

export { planNaturalWonders, planStarts, planWonders };
