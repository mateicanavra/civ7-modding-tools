import { createStrategy } from "@swooper/mapgen-core/authoring";
import contract from "../../contract.js";
import { computeSampling } from "../../rules/index.js";
import definition from "./config.js";

export default createStrategy(contract, definition, {
  run: (input, config) => computeSampling(input, "periodic-cycle", config.phaseCount),
});
