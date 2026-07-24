import type { DomainOpImplementationsForContracts } from "@swooper/mapgen-core/authoring";
import computeShelfMask from "./compute-shelf-mask/index.js";
type Contracts = typeof import("./contract.js").default;

/** Shelf implementations keyed exactly like the branch contract registry. */
const implementations = {
  computeShelfMask,
} as const satisfies DomainOpImplementationsForContracts<Contracts>;
export default implementations;
