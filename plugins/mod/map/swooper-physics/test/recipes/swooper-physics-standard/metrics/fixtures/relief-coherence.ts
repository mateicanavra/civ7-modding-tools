import type { StandardReliefCoherenceInput } from "../../../../../src/recipes/standard/metrics/families/relief-coherence.js";

/** Small independent fields for exact relief, climate, and receiver-index tests. */
export function reliefCoherenceFixture(width = 6, height = 3) {
  const size = width * height;
  return {
    provenance: { width, height },
    model: {
      seaLevel: 0,
      landMask: new Uint8Array(size).fill(1),
      elevation: new Int16Array(size).fill(100),
      mountainMask: new Uint8Array(size),
      foothillMask: new Uint8Array(size),
      roughLandMask: new Uint8Array(size),
      volcanoMask: new Uint8Array(size),
      plannedLakeMask: new Uint8Array(size),
      riverClass: new Uint8Array(size),
      flowDir: new Int32Array(size).fill(-1),
      physicalHydrology: {
        model: "legacy-sink-budget",
        routingElevation: new Float32Array(size).fill(100),
        outletMask: new Uint8Array(size),
      },
      surfaceTemperature: new Float32Array(size).fill(20),
      baselineRainfall: new Uint8Array(size).fill(100),
      refinedRainfall: new Uint8Array(size).fill(100),
      windU: new Int8Array(size),
      windV: new Int8Array(size),
    },
    observation: {
      isWater: new Uint8Array(size),
      isLake: new Uint8Array(size),
      terrain: new Int32Array(size).fill(3),
      mountainTerrain: 1,
      hillTerrain: 2,
      flatTerrain: 3,
      coastTerrain: 4,
      oceanTerrain: 5,
    },
  } satisfies StandardReliefCoherenceInput;
}
