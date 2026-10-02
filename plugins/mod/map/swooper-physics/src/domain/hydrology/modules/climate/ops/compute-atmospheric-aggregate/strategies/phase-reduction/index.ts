import { createStrategy } from "@swooper/mapgen-core/authoring";
import contract from "../../contract.js";
import { reduceAtmosphere } from "../../rules/index.js";
import definition from "./config.js";

/** Reduces admitted atmospheric samples without recomputing their physical fields. */
export default createStrategy(contract, definition, {
  run: (input) => reduceAtmosphere(input),
});
