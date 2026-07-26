import { artifacts as climateArtifacts } from "@mapgen/domain/hydrology/modules/climate/artifacts/index.js";
import { defineStep } from "@swooper/mapgen-core/authoring/contracts";
import { MAP_PROJECTION_EFFECT_TAGS } from "../../../../../tag-contracts.js";

/**
 * Declares the sole engine projection boundary for Hydrology rainfall. It consumes
 * the final-refined climate artifact and records completion as a map projection effect.
 */
export const config = defineStep({
  id: "project-rainfall",
  description: "Materializes the admitted final climate rainfall surface exactly once.",
  engine: ["setRainfall"] as const,
  requires: [],
  provides: [MAP_PROJECTION_EFFECT_TAGS.map.rainfallProjected],
  artifacts: {
    requires: [climateArtifacts.climateField],
    provides: [],
  },
});
