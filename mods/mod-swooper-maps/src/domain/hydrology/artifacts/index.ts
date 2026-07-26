import { defineArtifactCatalog } from "@swooper/mapgen-core/authoring/contracts";
import * as baselineClimateField from "./baseline-climate-field.artifact.js";
import * as climateField from "./climate-field.artifact.js";
import * as climateIndices from "./climate-indices.artifact.js";
import * as climateSeasonality from "./climate-seasonality.artifact.js";
import * as cryosphere from "./cryosphere.artifact.js";
import * as hydrography from "./hydrography.artifact.js";
import * as lakePlan from "./lake-plan.artifact.js";
import * as riverNetwork from "./river-network.artifact.js";
import * as windField from "./wind-field.artifact.js";

const catalog = defineArtifactCatalog({
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

/** Hydrology artifact modules pairing every semantic data product with its admission validator. */
export const artifactModules = catalog.modules;

/** Hydrology artifact handles consumed by recipe steps through declared dependencies. */
export const artifacts = catalog.artifacts;
