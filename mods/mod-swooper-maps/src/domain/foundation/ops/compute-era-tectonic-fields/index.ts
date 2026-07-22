import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeEraTectonicFieldsContract from "./contract.js";
import { eventDistanceDecayStrategy } from "./strategies/index.js";

const computeEraTectonicFields = createOp(ComputeEraTectonicFieldsContract, {
  strategies: {
    "event-distance-decay": eventDistanceDecayStrategy,
  },
});

export default computeEraTectonicFields;
