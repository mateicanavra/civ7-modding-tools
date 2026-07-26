import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeEraTectonicFieldsContract from "./contract.js";
import { eventDistanceDecayStrategy } from "./strategies/index.js";

/** Builds per-era uplift, rift, volcanism, and fracture fields from localized tectonic events. */
const computeEraTectonicFields = createOp(ComputeEraTectonicFieldsContract, {
  strategies: {
    "event-distance-decay": eventDistanceDecayStrategy,
  },
});

export default computeEraTectonicFields;
