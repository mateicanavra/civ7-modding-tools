import * as coastClassification from "./coast-classification.artifact.js";
import * as coastEngineTerrainSnapshot from "./coast-engine-terrain-snapshot.artifact.js";
import * as continentValidationTerrainSnapshot from "./continent-validation-terrain-snapshot.artifact.js";

export { coastClassification, coastEngineTerrainSnapshot, continentValidationTerrainSnapshot };

export const artifactContracts = {
  coastClassification,
  coastEngineTerrainSnapshot,
  continentValidationTerrainSnapshot,
} as const;

export const artifacts = {
  coastClassification: coastClassification.artifact,
  coastEngineTerrainSnapshot: coastEngineTerrainSnapshot.artifact,
  continentValidationTerrainSnapshot: continentValidationTerrainSnapshot.artifact,
} as const;

export const validators = {
  coastClassification: coastClassification.validate,
  coastEngineTerrainSnapshot: coastEngineTerrainSnapshot.validate,
  continentValidationTerrainSnapshot: continentValidationTerrainSnapshot.validate,
} as const;
