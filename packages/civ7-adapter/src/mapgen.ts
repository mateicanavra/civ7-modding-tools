import type { EngineAdapter } from "./types.js";

/** Detached terrain, elevation, and land-mask evidence observed from the Civ7 adapter. */
export type EngineHeightfieldSnapshot = Readonly<{
  terrain: Uint8Array;
  elevation: Int16Array;
  landMask: Uint8Array;
}>;

/**
 * Captures the engine-projected terrain surface for diagnostics and projection readback.
 *
 * The snapshot is detached from the adapter so later engine mutations cannot change evidence
 * already recorded by the MapGen execution that supplied the admitted dimensions.
 */
export function snapshotEngineHeightfield(adapter: EngineAdapter): EngineHeightfieldSnapshot {
  const { width, height } = adapter;
  const size = width * height;

  const terrain = new Uint8Array(size);
  const elevation = new Int16Array(size);
  const landMask = new Uint8Array(size);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;

      const terrainType = adapter.getTerrainType(x, y);
      if (terrainType != null) terrain[idx] = terrainType & 0xff;

      const engineElevation = adapter.getElevation(x, y);
      if (Number.isFinite(engineElevation)) elevation[idx] = engineElevation | 0;

      landMask[idx] = adapter.isWater(x, y) ? 0 : 1;
    }
  }

  return { terrain, elevation, landMask };
}
