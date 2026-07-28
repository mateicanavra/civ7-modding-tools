import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeBeltDriversContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Derives coherent morphology belt fields from tectonic history and provenance. */
const computeBeltDrivers = createOp(ComputeBeltDriversContract, { strategies });

export default computeBeltDrivers;
