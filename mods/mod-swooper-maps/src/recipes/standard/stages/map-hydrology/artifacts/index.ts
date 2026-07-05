import * as engineProjectionLakes from "./engine-projection-lakes.artifact.js";
import * as hydrologyLakesEngineTerrainSnapshot from "./hydrology-lakes-engine-terrain-snapshot.artifact.js";

export { engineProjectionLakes, hydrologyLakesEngineTerrainSnapshot };

export const artifactContracts = {
  engineProjectionLakes,
  hydrologyLakesEngineTerrainSnapshot,
} as const;

export const artifacts = {
  engineProjectionLakes: engineProjectionLakes.artifact,
  hydrologyLakesEngineTerrainSnapshot: hydrologyLakesEngineTerrainSnapshot.artifact,
} as const;

export const validators = {
  engineProjectionLakes: engineProjectionLakes.validate,
  hydrologyLakesEngineTerrainSnapshot: hydrologyLakesEngineTerrainSnapshot.validate,
} as const;
