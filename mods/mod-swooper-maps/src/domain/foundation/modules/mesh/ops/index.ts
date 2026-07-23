import type { DomainOpImplementationsForContracts } from "@swooper/mapgen-core/authoring";
import computeMesh from "./compute-mesh/index.js";

type Contracts = typeof import("./contract.js").default;

/** Mesh implementations keyed exactly like the branch contract registry. */
const implementations = {
  computeMesh,
} as const satisfies DomainOpImplementationsForContracts<Contracts>;

export default implementations;
