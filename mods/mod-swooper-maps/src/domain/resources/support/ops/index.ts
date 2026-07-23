import type { DomainOpImplementationsForContracts } from "@swooper/mapgen-core/authoring";
import adjustResourceSupport from "./adjust-resource-support/index.js";
import type { contracts } from "./contracts.js";

/** Resource-support implementations keyed exactly like the branch contract registry. */
const implementations = {
  adjustResourceSupport,
} as const satisfies DomainOpImplementationsForContracts<typeof contracts>;

export default implementations;
