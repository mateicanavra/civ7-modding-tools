import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeEraTectonicFieldsContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Builds per-era uplift, rift, volcanism, and fracture fields from localized tectonic events. */
const computeEraTectonicFields = createOp(ComputeEraTectonicFieldsContract, {
  strategies,
});

export default computeEraTectonicFields;
