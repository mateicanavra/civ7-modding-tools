import { createOp } from "@swooper/mapgen-core/authoring";

import ScoreWetTundraBogContract from "./contract.js";
import { defaultStrategy } from "./strategies/index.js";

const scoreWetTundraBog = createOp(ScoreWetTundraBogContract, {
  strategies: {
    default: defaultStrategy,
  },
});

export type * from "./contract.js";

export default scoreWetTundraBog;

