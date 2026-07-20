import { CIV7_BROWSER_TABLES_V0, WATER_CLASS_COAST, WATER_CLASS_OCEAN } from "@civ7/map-policy";
import type { MapContext } from "@swooper/mapgen-core";

const DEFAULT_MAX_WATER_DRIFT_SHARE = 0.05;
const DEFAULT_SAMPLE_LIMIT = 16;

interface CoastClassificationSurface {
  waterClass: Uint8Array;
}

type CoastProjectionRepairSample = {
  index: number;
  x: number;
  y: number;
  expectedTerrain: number;
  actualTerrain: number;
};

type CoastProjectionRepairReport = {
  label: string;
  width: number;
  height: number;
  repairedCount: number;
  coastRepairCount: number;
  oceanRepairCount: number;
  samples: CoastProjectionRepairSample[];
};

interface WaterDriftPolicyOptions {
  /**
   * Maximum tolerated land/water classification mismatch share. A small drift
   * budget keeps Civ cache/readback quirks observable without making otherwise
   * playable maps fail generation.
   */
  maxMismatchShare?: number;
  sampleLimit?: number;
}

type WaterDriftSample = {
  index: number;
  x: number;
  y: number;
  expected: "land" | "water";
  actual: "land" | "water";
};

type WaterDriftReport = {
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

function expectedTerrainForWaterClass(waterClass: number): number | null {
  if (waterClass === WATER_CLASS_COAST) {
    return CIV7_BROWSER_TABLES_V0.terrainTypeIndices.TERRAIN_COAST;
  }
  if (waterClass === WATER_CLASS_OCEAN) {
    return CIV7_BROWSER_TABLES_V0.terrainTypeIndices.TERRAIN_OCEAN;
  }
  return null;
}

/**
 * Restores the Standard recipe's authored coast and ocean terrain after Civ7 maintenance calls.
 *
 * Land terrain is deliberately skipped so mountains, hills, volcanoes, and natural wonders
 * remain owned by their projection steps. The coast-classification artifact owns shape and
 * cardinality admission before this recipe-level parity policy runs.
 */
export function restoreProjectedCoastTerrain(
  context: MapContext,
  coastClassification: CoastClassificationSurface,
  label: string,
  options: { sampleLimit?: number } = {}
): CoastProjectionRepairReport {
  const { width, height } = context.setup.dimensions;
  const sampleLimit = Math.max(0, options.sampleLimit ?? DEFAULT_SAMPLE_LIMIT);
  let repairedCount = 0;
  let coastRepairCount = 0;
  let oceanRepairCount = 0;
  const samples: CoastProjectionRepairSample[] = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = y * width + x;
      const expectedTerrain = expectedTerrainForWaterClass(
        coastClassification.waterClass[index] | 0
      );
      if (expectedTerrain == null) continue;

      const actualTerrain = context.adapter.getTerrainType(x, y) | 0;
      if (actualTerrain === expectedTerrain) continue;

      context.adapter.setTerrainType(x, y, expectedTerrain);
      repairedCount += 1;
      if (expectedTerrain === CIV7_BROWSER_TABLES_V0.terrainTypeIndices.TERRAIN_COAST) {
        coastRepairCount += 1;
      }
      if (expectedTerrain === CIV7_BROWSER_TABLES_V0.terrainTypeIndices.TERRAIN_OCEAN) {
        oceanRepairCount += 1;
      }
      if (samples.length < sampleLimit) {
        samples.push({ index, x, y, expectedTerrain, actualTerrain });
      }
    }
  }

  if (repairedCount > 0) {
    context.adapter.storeWaterData();
    const payload = {
      type: "map.projection.coastTerrainRestored",
      label,
      width,
      height,
      repairedCount,
      coastRepairCount,
      oceanRepairCount,
      samples,
    };
    context.trace.event(() => payload);
    console.log(`[SWOOPER_MOD] COAST_TERRAIN_RESTORED_V1 ${JSON.stringify(payload)}`);
  }

  return {
    label,
    width,
    height,
    repairedCount,
    coastRepairCount,
    oceanRepairCount,
    samples,
  };
}

/**
 * Asserts that engine water classification matches the projected map surface.
 *
 * Map projection steps mutate Civ7 terrain through the adapter, then rely on
 * engine readback for gameplay continuity. The expected land mask must be the
 * projection surface for that specific lifecycle point, not always Morphology's
 * raw topography: after lake projection, planned lake tiles are intentionally
 * engine water even though they began as land in Morphology truth. Pipeline
 * artifact admission or local construction owns mask cardinality before this check.
 */
export function assertNoWaterDrift(
  context: MapContext,
  expectedLandMask: Uint8Array,
  label: string
): void {
  const { width, height } = context.setup.dimensions;

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
 * bounded without forcing generation to fail for every playable mismatch. Input
 * admission remains upstream; this helper owns only parity evidence.
 */
function captureWaterDriftReport(
  context: MapContext,
  expectedLandMask: Uint8Array,
  label: string,
  options: WaterDriftPolicyOptions = {}
): WaterDriftReport {
  const { width, height } = context.setup.dimensions;
  const size = width * height;
  const maxMismatchShare = options.maxMismatchShare ?? DEFAULT_MAX_WATER_DRIFT_SHARE;
  const sampleLimit = Math.max(0, options.sampleLimit ?? DEFAULT_SAMPLE_LIMIT);

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
