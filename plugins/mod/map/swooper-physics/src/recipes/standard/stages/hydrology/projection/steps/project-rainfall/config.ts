import { artifacts as climateArtifacts } from "../../../../../../../domain/hydrology/modules/climate/artifacts/index.js";
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";
import { STANDARD_COMPLETIONS } from "../../../../../completions.js";

/**
 * Declares the sole engine projection boundary for Hydrology rainfall. It consumes the
 * final-refined climate artifact and materializes it in authored recipe order.
 */
export const config = defineStep({
  id: "project-rainfall",
  description: "Materializes the admitted final climate rainfall surface exactly once.",
  engine: ["setRainfall"] as const,
  requires: [climateArtifacts.climateField],
  provides: [STANDARD_COMPLETIONS.rainfallProjected],
});
