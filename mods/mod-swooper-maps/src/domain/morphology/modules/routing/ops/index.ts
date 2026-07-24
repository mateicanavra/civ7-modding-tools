import type { DomainOpImplementationsForContracts } from "@swooper/mapgen-core/authoring";
import computeFlowRouting from "./compute-flow-routing/index.js";
type Contracts = typeof import("./contract.js").default;

/** Routing implementations keyed exactly like the branch contract registry. */
const implementations = {
  computeFlowRouting,
} as const satisfies DomainOpImplementationsForContracts<Contracts>;
export default implementations;
