import * as coastClassification from "./coast-classification.artifact.js";
import * as coastEngineTerrainSnapshot from "./coast-engine-terrain-snapshot.artifact.js";
import * as continentValidationTerrainSnapshot from "./continent-validation-terrain-snapshot.artifact.js";

export { coastClassification, coastEngineTerrainSnapshot, continentValidationTerrainSnapshot };

/** Contract modules retaining each map-morphology artifact's schema, handle, and validator. */
export const artifactContracts = {
  coastClassification,
  coastEngineTerrainSnapshot,
  continentValidationTerrainSnapshot,
} as const;

/**
 * Map-morphology publication handles spanning authored coast classification
 * and the two successive engine-terrain observation boundaries.
 */
export const artifacts = {
  coastClassification: coastClassification.artifact,
  coastEngineTerrainSnapshot: coastEngineTerrainSnapshot.artifact,
  continentValidationTerrainSnapshot: continentValidationTerrainSnapshot.artifact,
} as const;

/** Payload validators keyed like the map-morphology artifact catalog. */
export const validators = {
  coastClassification: coastClassification.validate,
  coastEngineTerrainSnapshot: coastEngineTerrainSnapshot.validate,
  continentValidationTerrainSnapshot: continentValidationTerrainSnapshot.validate,
} as const;
