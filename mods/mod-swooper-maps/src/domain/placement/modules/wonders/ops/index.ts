import type { DomainOpImplementationsForContracts } from "@swooper/mapgen-core/authoring";

import planNaturalWonders from "./plan-natural-wonders/index.js";
import planWonders from "./plan-wonders/index.js";

type Contracts = typeof import("./contract.js").default;

/** Wonder-planning implementations keyed in demand-to-site-selection order. */
const implementations = {
  planWonders,
  planNaturalWonders,
} as const satisfies DomainOpImplementationsForContracts<Contracts>;

export default implementations;
