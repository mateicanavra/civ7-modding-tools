import * as engineProjectionRivers from "./engine-projection-rivers.artifact.js";
import * as projectedNavigableRivers from "./projected-navigable-rivers.artifact.js";
import * as riversEngineTerrainSnapshot from "./rivers-engine-terrain-snapshot.artifact.js";

export { engineProjectionRivers, projectedNavigableRivers, riversEngineTerrainSnapshot };

/** Contract modules retaining each map-rivers artifact's schema, handle, and validator. */
export const artifactContracts = {
  engineProjectionRivers,
  projectedNavigableRivers,
  riversEngineTerrainSnapshot,
} as const;

/** River-stage handles separating selected intent, engine readback, and terrain snapshot. */
export const artifacts = {
  engineProjectionRivers: engineProjectionRivers.artifact,
  projectedNavigableRivers: projectedNavigableRivers.artifact,
  riversEngineTerrainSnapshot: riversEngineTerrainSnapshot.artifact,
} as const;

/** Payload validators keyed like the map-rivers artifact catalog. */
export const validators = {
  engineProjectionRivers: engineProjectionRivers.validate,
  projectedNavigableRivers: projectedNavigableRivers.validate,
  riversEngineTerrainSnapshot: riversEngineTerrainSnapshot.validate,
} as const;
