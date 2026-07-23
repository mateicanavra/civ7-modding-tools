import { defineArtifactCatalog } from "@swooper/mapgen-core/authoring/contracts";
import * as engineProjectionLakes from "./engine-projection-lakes.artifact.js";
import * as hydrologyLakesEngineTerrainSnapshot from "./hydrology-lakes-engine-terrain-snapshot.artifact.js";

const catalog = defineArtifactCatalog({
  engineProjectionLakes,
  hydrologyLakesEngineTerrainSnapshot,
});

/** map-hydrology artifact modules pairing every contract with its complete admission validator. */
export const artifactModules = catalog.modules;

/** map-hydrology artifact handles derived from the module catalog for contracts and consumers. */
export const artifacts = catalog.artifacts;
