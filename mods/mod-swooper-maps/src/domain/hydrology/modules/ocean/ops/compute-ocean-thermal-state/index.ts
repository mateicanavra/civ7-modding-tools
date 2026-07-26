import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeOceanThermalStateContract from "./contract.js";
import strategies from "./strategies/index.js";

/** Advects latitudinal ocean temperature along currents and classifies sea ice over admitted water. */
export default createOp(ComputeOceanThermalStateContract, { strategies });
