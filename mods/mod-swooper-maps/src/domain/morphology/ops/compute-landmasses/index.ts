import { createOp } from "@swooper/mapgen-core/authoring";

import ComputeLandmassesContract from "./contract.js";
import { wrappedHexComponentsStrategy } from "./strategies/index.js";

const computeLandmasses = createOp(ComputeLandmassesContract, {
  strategies: {
    "wrapped-hex-components": wrappedHexComponentsStrategy,
  },
});

export type * from "./contract.js";
export type * from "./types.js";

export default computeLandmasses;
