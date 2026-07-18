import type { EngineAdapter } from "@civ7/adapter";

/** Exact engine terrain and classification snapshot at one maintenance boundary. */
export type TerrainValidationBoundarySnapshot = Readonly<{
  stage: string;
  terrain: Int32Array;
  waterMask: Uint8Array;
  lakeMask: Uint8Array;
  areaId: Int32Array;
}>;

/**
 * Diagnostic readback for placement surface maintenance. This records engine
 * facts around validation/cache boundaries; it does not mutate terrain or
 * authorize terrain policy changes by itself.
 */
export function readTerrainValidationBoundarySnapshot(
  adapter: EngineAdapter,
  width: number,
  height: number,
  stage: string
): TerrainValidationBoundarySnapshot {
  const size = width * height;
  const terrain = new Int32Array(size);
  const waterMask = new Uint8Array(size);
  const lakeMask = new Uint8Array(size);
  const areaId = new Int32Array(size);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = y * width + x;
      terrain[index] = adapter.getTerrainType(x, y) | 0;
      waterMask[index] = adapter.isWater(x, y) ? 1 : 0;
      lakeMask[index] = adapter.isLake(x, y) ? 1 : 0;
      areaId[index] = adapter.getAreaId(x, y) | 0;
    }
  }

  return {
    stage,
    terrain,
    waterMask,
    lakeMask,
    areaId,
  };
}
