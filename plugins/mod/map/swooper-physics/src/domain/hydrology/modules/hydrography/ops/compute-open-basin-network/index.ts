import { createOp } from "@swooper/mapgen-core/authoring";
import ComputeOpenBasinNetworkContract from "./contract.js";
import strategies from "./strategies/index.js";

export default createOp(ComputeOpenBasinNetworkContract, { strategies });
