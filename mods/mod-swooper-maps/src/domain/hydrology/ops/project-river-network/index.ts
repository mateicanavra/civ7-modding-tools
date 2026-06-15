import { createOp } from "@swooper/mapgen-core/authoring";
import ProjectRiverNetworkContract from "./contract.js";
import { defaultStrategy } from "./strategies/index.js";

const projectRiverNetwork = createOp(ProjectRiverNetworkContract, {
  strategies: { default: defaultStrategy },
});

export type * from "./contract.js";
export type * from "./types.js";

export default projectRiverNetwork;
