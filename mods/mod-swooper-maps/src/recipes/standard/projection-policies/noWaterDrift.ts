import type { ExtendedMapContext } from "@swooper/mapgen-core";

/**
 * Asserts that engine water classification matches the projected map surface.
 *
 * Map projection steps mutate Civ7 terrain through the adapter, then rely on
 * engine readback for gameplay continuity. The expected land mask must be the
 * projection surface for that specific lifecycle point, not always Morphology's
 * raw topography: after lake projection, planned lake tiles are intentionally
 * engine water even though they began as land in Morphology truth.
 */
export function assertNoWaterDrift(
  context: ExtendedMapContext,
  expectedLandMask: Uint8Array,
  label: string
): void {
  const { width, height } = context.dimensions;
  const size = Math.max(0, (width | 0) * (height | 0));
  if (expectedLandMask.length !== size) {
    throw new Error(
      `[${label}] expectedLandMask length ${expectedLandMask.length} does not match ${size}.`
    );
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const expectsLand = expectedLandMask[idx] === 1;
      const isWater = context.adapter.isWater(x, y);
      if (expectsLand && isWater) {
        throw new Error(
          `[${label}] drift: expected land but adapter reports water at (${x},${y}).`
        );
      }
      if (!expectsLand && !isWater) {
        throw new Error(
          `[${label}] drift: expected water but adapter reports land at (${x},${y}).`
        );
      }
    }
  }
}
