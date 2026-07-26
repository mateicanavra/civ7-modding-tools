import { createOp } from "@swooper/mapgen-core/authoring";

import ScoreWetMarshContract from "./contract.js";
import { temperateHydromorphicStrategy } from "./strategies/index.js";

const scoreWetMarsh = createOp(ScoreWetMarshContract, {
  strategies: {
    "temperate-hydromorphic": temperateHydromorphicStrategy,
  },
});

export type * from "./contract.js";

export default scoreWetMarsh;
