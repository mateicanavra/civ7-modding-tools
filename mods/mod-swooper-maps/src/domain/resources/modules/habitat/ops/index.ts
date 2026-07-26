import type { DomainOpImplementationsForContracts } from "@swooper/mapgen-core/authoring";

import deriveHabitatFields from "./derive-habitat-fields/index.js";

type Contracts = typeof import("./contract.js").default;

/** Habitat implementations keyed exactly like the branch contract registry. */
const implementations = {
  deriveHabitatFields,
} as const satisfies DomainOpImplementationsForContracts<Contracts>;

export default implementations;
