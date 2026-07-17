import * as elevationEngineTerrainSnapshot from "./elevation-engine-terrain-snapshot.artifact.js";

export { elevationEngineTerrainSnapshot };

/** Full map-elevation readback module exposing its schema, handle, and validator. */
export const artifactContracts = {
  elevationEngineTerrainSnapshot,
} as const;

/**
 * Map-elevation artifact handles for the engine terrain readback produced after elevation
 * materialization. Consumers use this catalog for parity evidence, not Morphology truth.
 */
export const artifacts = {
  elevationEngineTerrainSnapshot: elevationEngineTerrainSnapshot.artifact,
} as const;

/** Payload validator keyed identically to the map-elevation readback handle. */
export const validators = {
  elevationEngineTerrainSnapshot: elevationEngineTerrainSnapshot.validate,
} as const;
