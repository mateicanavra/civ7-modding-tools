import { createStrategy } from "@swooper/mapgen-core/authoring";
import ComputeOpenBasinNetworkContract from "../../contract.js";
import { computeOpenBasinNetwork } from "../../rules/index.js";
import CertifiedSillSpillDefinition from "./config.js";

export default createStrategy(ComputeOpenBasinNetworkContract, CertifiedSillSpillDefinition, {
  run: (input) => computeOpenBasinNetwork(input),
});
