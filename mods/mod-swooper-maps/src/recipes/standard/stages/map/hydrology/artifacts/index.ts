import { defineArtifactCatalog } from "@swooper/mapgen-core/authoring/contracts";
import { artifact as engineProjectionLakes } from "./engine-projection-lakes.artifact.js";
import { artifact as hydrologyLakesEngineTerrainSnapshot } from "./hydrology-lakes-engine-terrain-snapshot.artifact.js";

/** map-hydrology artifact authorities keyed for contracts and consumers. */
export const artifacts = defineArtifactCatalog({
  engineProjectionLakes,
  hydrologyLakesEngineTerrainSnapshot,
});
