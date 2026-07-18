import type { MapContext } from "@mapgen/core/map-context.js";

/** Detached terrain, elevation, and land-mask evidence observed from the Civ7 adapter. */
export type EngineHeightfieldSnapshot = {
  terrain: Uint8Array;
  elevation: Int16Array;
  landMask: Uint8Array;
};

/**
 * Captures the engine-projected terrain surface for diagnostics and projection readback.
 *
 * The snapshot is detached from the adapter so later engine mutations cannot change the evidence
 * already recorded for a pipeline step.
 */
export function snapshotEngineHeightfield(ctx: MapContext): EngineHeightfieldSnapshot | null {
  if (!ctx?.adapter) return null;

  const { width, height } = ctx.setup.dimensions;
  const size = width * height;

  const terrain = new Uint8Array(size);
  const elevation = new Int16Array(size);
  const landMask = new Uint8Array(size);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;

      const t = ctx.adapter.getTerrainType(x, y);
      if (t != null) terrain[idx] = t & 0xff;

      const e = ctx.adapter.getElevation(x, y);
      if (Number.isFinite(e)) elevation[idx] = e | 0;

      landMask[idx] = ctx.adapter.isWater(x, y) ? 0 : 1;
    }
  }

  return { terrain, elevation, landMask };
}
