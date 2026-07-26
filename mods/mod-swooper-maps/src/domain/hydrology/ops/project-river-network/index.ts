import { createOp } from "@swooper/mapgen-core/authoring";
import ProjectRiverNetworkContract from "./contract.js";
import { dischargePercentilesStrategy } from "./strategies/index.js";

const projectRiverNetwork = createOp(ProjectRiverNetworkContract, {
  strategies: { "discharge-percentiles": dischargePercentilesStrategy },
});

export type * from "./contract.js";
export type * from "./types.js";

export default projectRiverNetwork;
