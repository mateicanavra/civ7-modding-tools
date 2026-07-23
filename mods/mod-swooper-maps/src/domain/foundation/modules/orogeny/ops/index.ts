import type { DomainOpImplementationsForContracts } from "@swooper/mapgen-core/authoring";
import computeCrustEvolution from "./compute-crust-evolution/index.js";

type Contracts = typeof import("./contract.js").default;

/** Orogeny implementations keyed exactly like the branch contract registry. */
const implementations = {
  computeCrustEvolution,
} as const satisfies DomainOpImplementationsForContracts<Contracts>;

export default implementations;
