import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeDrainageBasinsContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Exposes the pure raw-terrain basin geometry operation without selecting it in a recipe. */
export default createOp(ComputeDrainageBasinsContract, { strategies });
