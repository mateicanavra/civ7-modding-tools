import { createStrategy } from "@swooper/mapgen-core/authoring";
import ComputeRadiativeForcingContract from "../../contract.js";
import { computeSolarHarmonics } from "../../rules/daily-solar.js";
import definition from "./config.js";

/** Integrates true-latitude daily-mean TOA forcing independently of climate observation phases. */
export default createStrategy(ComputeRadiativeForcingContract, definition, {
  run: (input) => {
    if (input.model !== "daily-solar-fourier")
      throw new RangeError("daily-solar-fourier requires its matching input model.");
    if (input.latitudeByRow.length !== input.height)
      throw new RangeError("Expected one true latitude per row.");
    return {
      model: "daily-solar-fourier" as const,
      phaseOrigin: "northward-equinox" as const,
      solarByRow: Array.from(input.latitudeByRow, (latitude) =>
        computeSolarHarmonics(latitude, input.axialTiltDeg)
      ),
    };
  },
});
