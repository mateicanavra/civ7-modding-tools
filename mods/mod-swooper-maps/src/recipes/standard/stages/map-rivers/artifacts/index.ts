import * as engineProjectionRivers from "./engine-projection-rivers.artifact.js";
import * as projectedNavigableRivers from "./projected-navigable-rivers.artifact.js";
import * as riversEngineTerrainSnapshot from "./rivers-engine-terrain-snapshot.artifact.js";

export { engineProjectionRivers, projectedNavigableRivers, riversEngineTerrainSnapshot };

export const artifactContracts = {
  engineProjectionRivers,
  projectedNavigableRivers,
  riversEngineTerrainSnapshot,
} as const;

export const validators = {
  engineProjectionRivers: engineProjectionRivers.validate,
  projectedNavigableRivers: projectedNavigableRivers.validate,
  riversEngineTerrainSnapshot: riversEngineTerrainSnapshot.validate,
} as const;
