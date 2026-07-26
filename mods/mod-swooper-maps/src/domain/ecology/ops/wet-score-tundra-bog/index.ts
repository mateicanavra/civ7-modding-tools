import { createOp } from "@swooper/mapgen-core/authoring";

import ScoreWetTundraBogContract from "./contract.js";
import { coldHydromorphicStrategy } from "./strategies/index.js";

const scoreWetTundraBog = createOp(ScoreWetTundraBogContract, {
  strategies: {
    "cold-hydromorphic": coldHydromorphicStrategy,
  },
});

export type * from "./contract.js";

export default scoreWetTundraBog;
