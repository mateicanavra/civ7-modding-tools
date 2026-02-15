import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeEraTectonicFieldsContract from "./contract.js";
import { defaultStrategy } from "./strategies/index.js";

const computeEraTectonicFields = createOp(ComputeEraTectonicFieldsContract, {
  strategies: {
    default: defaultStrategy,
  },
});

export default computeEraTectonicFields;
