import type { DomainOpImplementationsForContracts } from "@swooper/mapgen-core/authoring";

import type { contracts } from "./contracts.js";
import deriveHabitatFields from "./derive-habitat-fields/index.js";

/** Habitat implementations keyed exactly like the branch contract registry. */
const implementations = {
  deriveHabitatFields,
} as const satisfies DomainOpImplementationsForContracts<typeof contracts>;

export default implementations;
