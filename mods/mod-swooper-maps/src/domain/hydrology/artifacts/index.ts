import { defineArtifactCatalog } from "@swooper/mapgen-core/authoring/contracts";
import { artifact as baselineClimateField } from "./baseline-climate-field.artifact.js";
import { artifact as climateField } from "./climate-field.artifact.js";
import { artifact as climateIndices } from "./climate-indices.artifact.js";
import { artifact as climateSeasonality } from "./climate-seasonality.artifact.js";
import { artifact as cryosphere } from "./cryosphere.artifact.js";
import { artifact as hydrography } from "./hydrography.artifact.js";
import { artifact as lakePlan } from "./lake-plan.artifact.js";
import { artifact as riverNetwork } from "./river-network.artifact.js";
import { artifact as windField } from "./wind-field.artifact.js";

/** Hydrology artifact authorities consumed by recipe steps through declared dependencies. */
export const artifacts = defineArtifactCatalog({
  baselineClimateField,
  climateField,
  climateIndices,
  climateSeasonality,
  cryosphere,
  hydrography,
  lakePlan,
  riverNetwork,
  windField,
});
