import type { DomainOpImplementationsForContracts } from "@swooper/mapgen-core/authoring";
import computeCrust from "./compute-crust/index.js";
import computePlateGraph from "./compute-plate-graph/index.js";

type Contracts = typeof import("./contract.js").default;

/** Lithosphere implementations keyed exactly like the branch contract registry. */
const implementations = {
  computeCrust,
  computePlateGraph,
} as const satisfies DomainOpImplementationsForContracts<Contracts>;

export default implementations;
