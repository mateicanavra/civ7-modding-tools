import type { DomainOpImplementationsForContracts } from "@swooper/mapgen-core/authoring";

import applyAlbedoFeedback from "./apply-albedo-feedback/index.js";
import computeCryosphereState from "./compute-cryosphere-state/index.js";

type Contracts = typeof import("./contract.js").default;

/** Cryosphere implementations keyed exactly like the branch contract registry. */
const implementations = {
  computeCryosphereState,
  applyAlbedoFeedback,
} as const satisfies DomainOpImplementationsForContracts<Contracts>;

export default implementations;
