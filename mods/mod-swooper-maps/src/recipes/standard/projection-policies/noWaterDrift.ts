import type { ExtendedMapContext } from "@swooper/mapgen-core";

export interface WaterDriftSummary {
  driftCount: number;
  expectedLandButWater: number;
  expectedWaterButLand: number;
  examples: string[];
}

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
  const drift = summarizeWaterDrift(context, expectedLandMask, label);
  if (drift.driftCount > 0) {
    throw new Error(formatWaterDriftError(label, drift));
  }
}

export function summarizeWaterDrift(
  context: ExtendedMapContext,
  expectedLandMask: Uint8Array,
  label: string
): WaterDriftSummary {
  const { width, height } = context.dimensions;
  const size = Math.max(0, (width | 0) * (height | 0));
  if (expectedLandMask.length !== size) {
    throw new Error(
      `[${label}] expectedLandMask length ${expectedLandMask.length} does not match ${size}.`
    );
  }

  let expectedLandButWater = 0;
  let expectedWaterButLand = 0;
  const examples: string[] = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const expectsLand = expectedLandMask[idx] === 1;
      const isWater = context.adapter.isWater(x, y);
      if (expectsLand && isWater) {
        expectedLandButWater += 1;
        if (examples.length < 8) examples.push(`expected land but adapter reports water at (${x},${y})`);
      }
      if (!expectsLand && !isWater) {
        expectedWaterButLand += 1;
        if (examples.length < 8) examples.push(`expected water but adapter reports land at (${x},${y})`);
      }
    }
  }
  return {
    driftCount: expectedLandButWater + expectedWaterButLand,
    expectedLandButWater,
    expectedWaterButLand,
    examples,
  };
}

export function formatWaterDriftError(label: string, drift: WaterDriftSummary): string {
  return `[${label}] drift: ${drift.driftCount} mismatched tiles (${drift.expectedLandButWater} expected-land/engine-water, ${drift.expectedWaterButLand} expected-water/engine-land); ${drift.examples.join("; ")}.`;
}
