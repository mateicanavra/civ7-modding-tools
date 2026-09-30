import { createStrategy } from "@swooper/mapgen-core/authoring";
import contract from "../../contract.js";
import { computeBasinNetwork } from "../../rules/index.js";
import definition from "./config.js";
/** Runs the stationary basin network solver without conditioning ground or adding a separate tuning law. */
export default createStrategy(contract, definition, { run: input => computeBasinNetwork(input) });
