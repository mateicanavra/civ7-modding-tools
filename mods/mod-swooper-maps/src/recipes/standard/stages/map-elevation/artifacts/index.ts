import * as elevationEngineTerrainSnapshot from "./elevation-engine-terrain-snapshot.artifact.js";

export { elevationEngineTerrainSnapshot };

export const artifactContracts = {
  elevationEngineTerrainSnapshot,
} as const;

export const validators = {
  elevationEngineTerrainSnapshot: elevationEngineTerrainSnapshot.validate,
} as const;
