import { defineArtifactCatalog } from "@swooper/mapgen-core/authoring/contracts";

import { artifact as baselineClimateField } from "./baseline-climate-field.artifact.js";
import { artifact as climateField } from "./climate-field.artifact.js";
import { artifact as climateIndices } from "./climate-indices.artifact.js";
import { artifact as climateSeasonality } from "./climate-seasonality.artifact.js";
import { artifact as windField } from "./wind-field.artifact.js";

/** Immutable atmospheric and climate evidence owned by the Hydrology climate branch. */
export const artifacts = defineArtifactCatalog({
  baselineClimateField,
  climateField,
  climateIndices,
  climateSeasonality,
  windField,
});
