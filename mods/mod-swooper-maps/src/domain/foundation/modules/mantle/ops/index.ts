import type { DomainOpImplementationsForContracts } from "@swooper/mapgen-core/authoring";
import computeMantleForcing from "./compute-mantle-forcing/index.js";
import computeMantlePotential from "./compute-mantle-potential/index.js";

type Contracts = typeof import("./contract.js").default;

/** Mantle implementations keyed exactly like the branch contract registry. */
const implementations = {
  computeMantlePotential,
  computeMantleForcing,
} as const satisfies DomainOpImplementationsForContracts<Contracts>;

export default implementations;
