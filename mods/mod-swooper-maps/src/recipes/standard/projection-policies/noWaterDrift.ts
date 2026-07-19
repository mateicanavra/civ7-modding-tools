import type { MapContext } from "@swooper/mapgen-core";

const DEFAULT_MAX_WATER_DRIFT_SHARE = 0.05;
const DEFAULT_SAMPLE_LIMIT = 16;

export interface WaterDriftPolicyOptions {
  /**
   * Maximum tolerated land/water classification mismatch share. A small drift
   * budget keeps Civ cache/readback quirks observable without making otherwise
   * playable maps fail generation.
   */
  maxMismatchShare?: number;
  sampleLimit?: number;
}

export type WaterDriftSample = {
  index: number;
  x: number;
  y: number;
  expected: "land" | "water";
  actual: "land" | "water";
};

export type WaterDriftReport = {
  label: string;
  width: number;
  height: number;
  totalTileCount: number;
  mismatchCount: number;
  mismatchShare: number;
  expectedLandWaterCount: number;
  expectedWaterLandCount: number;
  maxMismatchShare: number;
  withinPolicy: boolean;
  samples: WaterDriftSample[];
};

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
  context: MapContext,
  expectedLandMask: Uint8Array,
  label: string
): void {
  const { width, height } = context.setup.dimensions;
  const size = width * height;
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

/**
 * Captures bounded engine water classification drift against the projected map surface.
 *
 * Some lifecycle calls can expose small engine readback/cache deltas after the
 * owning projection has stamped terrain. Those deltas should be observable and
 * bounded without forcing generation to fail for every playable mismatch.
 */
export function captureWaterDriftReport(
  context: MapContext,
  expectedLandMask: Uint8Array,
  label: string,
  options: WaterDriftPolicyOptions = {}
): WaterDriftReport {
  const { width, height } = context.setup.dimensions;
  const size = width * height;
  const maxMismatchShare = options.maxMismatchShare ?? DEFAULT_MAX_WATER_DRIFT_SHARE;
  const sampleLimit = Math.max(0, options.sampleLimit ?? DEFAULT_SAMPLE_LIMIT);

  if (expectedLandMask.length !== size) {
    throw new Error(
      `[${label}] expectedLandMask length ${expectedLandMask.length} does not match ${size}.`
    );
  }

  let mismatchCount = 0;
  let expectedLandWaterCount = 0;
  let expectedWaterLandCount = 0;
  const samples: WaterDriftSample[] = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const expectsLand = expectedLandMask[idx] === 1;
      const isWater = context.adapter.isWater(x, y);

      if (expectsLand && isWater) {
        mismatchCount += 1;
        expectedLandWaterCount += 1;
        if (samples.length < sampleLimit) {
          samples.push({ index: idx, x, y, expected: "land", actual: "water" });
        }
        continue;
      }

      if (!expectsLand && !isWater) {
        mismatchCount += 1;
        expectedWaterLandCount += 1;
        if (samples.length < sampleLimit) {
          samples.push({ index: idx, x, y, expected: "water", actual: "land" });
        }
      }
    }
  }

  const mismatchShare = mismatchCount / size;
  return {
    label,
    width,
    height,
    totalTileCount: size,
    mismatchCount,
    mismatchShare: Number(mismatchShare.toFixed(6)),
    expectedLandWaterCount,
    expectedWaterLandCount,
    maxMismatchShare,
    withinPolicy: mismatchShare <= maxMismatchShare,
    samples,
  };
}

/**
 * Compares engine land/water readback with expected truth, emits diagnostics on any mismatch, and
 * throws only when the configured mismatch-share ceiling is exceeded.
 */
export function assertWaterDriftWithinPolicy(
  context: MapContext,
  expectedLandMask: Uint8Array,
  label: string,
  options: WaterDriftPolicyOptions = {}
): WaterDriftReport {
  const report = captureWaterDriftReport(context, expectedLandMask, label, options);

  if (report.mismatchCount > 0) {
    const payload = {
      type: "map.projection.waterDrift",
      ...report,
    };
    context.trace.event(() => payload);
    console.log(`[SWOOPER_MOD] WATER_DRIFT_POLICY_V1 ${JSON.stringify(payload)}`);
  }

  if (!report.withinPolicy) {
    const sample = report.samples
      .map((entry) => `(${entry.x},${entry.y}) expected ${entry.expected} actual ${entry.actual}`)
      .join("; ");
    throw new Error(
      `[${label}] land/water drift ${report.mismatchCount}/${report.totalTileCount} (${(
        report.mismatchShare * 100
      ).toFixed(2)}%) exceeds policy max ${(report.maxMismatchShare * 100).toFixed(
        2
      )}%; expectedLandWater=${report.expectedLandWaterCount}; expectedWaterLand=${
        report.expectedWaterLandCount
      }; sample: ${sample}`
    );
  }

  return report;
}
