import { defineArtifactCatalog } from "@swooper/mapgen-core/authoring/contracts";
import * as climateField from "./climate-field.artifact.js";
import * as climateSeasonality from "./climate-seasonality.artifact.js";
import * as windField from "./wind-field.artifact.js";

const catalog = defineArtifactCatalog({
  climateField,
  climateSeasonality,
  windField,
});

/** hydrology-climate-baseline artifact modules pairing every contract with its complete admission validator. */
export const artifactModules = catalog.modules;

/** hydrology-climate-baseline artifact handles derived from the module catalog for contracts and consumers. */
export const artifacts = catalog.artifacts;
