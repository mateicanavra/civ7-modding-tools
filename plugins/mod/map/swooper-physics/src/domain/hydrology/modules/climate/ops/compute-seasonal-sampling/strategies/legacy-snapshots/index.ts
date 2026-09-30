import { createStrategy } from "@swooper/mapgen-core/authoring";
import contract from "../../contract.js";
import { computeSampling } from "../../rules/index.js";
import definition from "./config.js";

/** Preserves legacy snapshot phases, equal weights, and latitude-frame behavior. */
export default createStrategy(contract, definition, {
  run: (input) => computeSampling(input, "legacy-snapshots"),
});
