import type { ExtendedMapContext } from "@mapgen/core/types.js";

export type EngineHeightfieldSnapshot = {
  terrain: Uint8Array;
  elevation: Int16Array;
  landMask: Uint8Array;
};

export function snapshotEngineHeightfield(ctx: ExtendedMapContext): EngineHeightfieldSnapshot | null {
  if (!ctx?.adapter) return null;

  const { width, height } = ctx.dimensions;
  const size = Math.max(0, (width | 0) * (height | 0)) | 0;

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

