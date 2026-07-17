import * as engineProjectionLakes from "./engine-projection-lakes.artifact.js";
import * as hydrologyLakesEngineTerrainSnapshot from "./hydrology-lakes-engine-terrain-snapshot.artifact.js";

export { engineProjectionLakes, hydrologyLakesEngineTerrainSnapshot };

/** Full map-hydrology readback modules exposing schemas, handles, and validators. */
export const artifactContracts = {
  engineProjectionLakes,
  hydrologyLakesEngineTerrainSnapshot,
} as const;

/** Map-hydrology publication handles for lake projection and its engine snapshot. */
export const artifacts = {
  engineProjectionLakes: engineProjectionLakes.artifact,
  hydrologyLakesEngineTerrainSnapshot: hydrologyLakesEngineTerrainSnapshot.artifact,
} as const;

/** Validators keyed identically to lake-projection and terrain-snapshot handles. */
export const validators = {
  engineProjectionLakes: engineProjectionLakes.validate,
  hydrologyLakesEngineTerrainSnapshot: hydrologyLakesEngineTerrainSnapshot.validate,
} as const;
