import type { DomainOpImplementationsForContracts } from "@swooper/mapgen-core/authoring";

import planStarts from "./plan-starts/index.js";

type Contracts = typeof import("./contract.js").default;

/** Start-planning implementation keyed exactly like the branch contract registry. */
const implementations = {
  planStarts,
} as const satisfies DomainOpImplementationsForContracts<Contracts>;

export default implementations;
