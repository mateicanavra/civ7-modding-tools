import { createStrategy } from "@swooper/mapgen-core/authoring";
import contract from "../../contract.js";
import { computeBasinNetwork } from "../../rules/index.js";
import definition from "./config.js";
export default createStrategy(contract, definition, { run: input => computeBasinNetwork(input) });
