import type { DomainOpImplementationsForContracts } from "@swooper/mapgen-core/authoring";

import classifyPedology from "./pedology-classify/index.js";

type Contracts = typeof import("./contract.js").default;

/** Pedology implementations keyed exactly like the branch contract registry. */
const implementations = {
  classifyPedology,
} as const satisfies DomainOpImplementationsForContracts<Contracts>;

export default implementations;
