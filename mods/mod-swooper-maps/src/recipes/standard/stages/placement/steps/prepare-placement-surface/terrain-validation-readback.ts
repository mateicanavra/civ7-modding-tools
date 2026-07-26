import type { CurrentEngineTerrainClassification } from "../../../../current-engine-surface.js";

/** Exact adapter readback of engine terrain and classification at one maintenance boundary. */
export type TerrainValidationBoundaryReadback = Readonly<{
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
export function readTerrainValidationBoundary(
  currentSurface: CurrentEngineTerrainClassification,
  readAreaId: (x: number, y: number) => number,
  stage: string
): TerrainValidationBoundaryReadback {
  const { width, height } = currentSurface;
  const areaId = new Int32Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      areaId[y * width + x] = readAreaId(x, y) | 0;
    }
  }
  return {
    stage,
    terrain: Int32Array.from(currentSurface.terrain),
    waterMask: Uint8Array.from(currentSurface.waterMask),
    lakeMask: Uint8Array.from(currentSurface.lakeMask),
    areaId,
  };
}
