import { createStrategy } from "@swooper/mapgen-core/authoring";
import ComputeThermalStateContract from "../../contract.js";
import { computePeriodicThermalResponse } from "../../rules/periodic-response.js";
import definition from "./config.js";

/** Evaluates one calibrated thermal owner at both datums and integrates its annual ground cycle. */
export default createStrategy(ComputeThermalStateContract, definition, {
  run: (input, config) => {
    if (input.model !== "periodic-response")
      throw new RangeError("periodic-response requires its matching input model.");
    return {
      model: "periodic-response" as const,
      ...computePeriodicThermalResponse(input, config),
    };
  },
});
