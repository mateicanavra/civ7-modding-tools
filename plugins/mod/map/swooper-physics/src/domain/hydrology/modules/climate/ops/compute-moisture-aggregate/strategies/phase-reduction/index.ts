import { createStrategy } from "@swooper/mapgen-core/authoring";
import contract from "../../contract.js";
import { reduceMoisture } from "../../rules/index.js";
import definition from "./config.js";

/** Reduces admitted rainfall, humidity, and demand at their declared sampling level. */
export default createStrategy(contract, definition, {
  run: (input) => reduceMoisture(input),
});
