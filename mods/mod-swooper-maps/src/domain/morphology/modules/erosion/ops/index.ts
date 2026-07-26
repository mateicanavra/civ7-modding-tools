import type { DomainOpImplementationsForContracts } from "@swooper/mapgen-core/authoring";
import computeGeomorphicCycle from "./compute-geomorphic-cycle/index.js";
type Contracts = typeof import("./contract.js").default;

/** Erosion implementations keyed exactly like the branch contract registry. */
const implementations = {
  computeGeomorphicCycle,
} as const satisfies DomainOpImplementationsForContracts<Contracts>;
export default implementations;
