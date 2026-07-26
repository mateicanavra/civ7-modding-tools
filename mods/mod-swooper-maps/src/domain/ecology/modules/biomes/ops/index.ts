import type { DomainOpImplementationsForContracts } from "@swooper/mapgen-core/authoring";

import classifyBiomes from "./classify-biomes/index.js";

type Contracts = typeof import("./contract.js").default;

/** Biome implementations keyed exactly like the branch contract registry. */
const implementations = {
  classifyBiomes,
} as const satisfies DomainOpImplementationsForContracts<Contracts>;

export default implementations;
