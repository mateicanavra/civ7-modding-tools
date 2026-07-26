import type { DomainOpImplementationsForContracts } from "@swooper/mapgen-core/authoring";
import computePlateTopology from "./compute-plate-topology/index.js";
import computePlatesTensors from "./compute-plates-tensors/index.js";

type Contracts = typeof import("./contract.js").default;

/** Projection implementations keyed exactly like the branch contract registry. */
const implementations = {
  computePlatesTensors,
  computePlateTopology,
} as const satisfies DomainOpImplementationsForContracts<Contracts>;

export default implementations;
