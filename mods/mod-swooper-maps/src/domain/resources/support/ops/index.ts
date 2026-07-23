import type { DomainOpImplementationsForContracts } from "@swooper/mapgen-core/authoring";
import adjustResourceSupport from "./adjust-resource-support/index.js";

type Contracts = typeof import("./contract.js").default;

/** Resource-support implementations keyed exactly like the branch contract registry. */
const implementations = {
  adjustResourceSupport,
} as const satisfies DomainOpImplementationsForContracts<Contracts>;

export default implementations;
