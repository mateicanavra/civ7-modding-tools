import { artifacts as climateArtifacts } from "../../../../../../../domain/hydrology/modules/climate/artifacts/index.js";
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Declares the sole engine projection boundary for Hydrology rainfall. It consumes the
 * final climate artifact's derived byte codec in authored recipe order, never
 * using the engine codec as physical forcing.
 */
export const config = defineStep({
  id: "project-rainfall",
  description: "Materializes the admitted final climate rainfall codec exactly once.",
  engine: ["setRainfall"] as const,
  requires: [climateArtifacts.climateField],
  provides: [],
});
