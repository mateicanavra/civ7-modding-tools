import {
  clamp01,
  devLogJson,
  FLAT_TERRAIN,
  HILL_TERRAIN,
  MOUNTAIN_TERRAIN,
  normalizeRange,
} from "@swooper/mapgen-core";
import type { TraceScope } from "@swooper/mapgen-core";
import type { Static } from "@swooper/mapgen-core/authoring";
import ecology from "@mapgen/domain/ecology";
import type { PlotEffectKey } from "@mapgen/domain/ecology";

type PlotEffectsInput = Static<typeof ecology.ops.planPlotEffects.input>;

type PlotEffectPlacement = {
  x: number;
  y: number;
  plotEffect: PlotEffectKey;
};

type TerrainBucket = {
  total: number;
  gateEligible: number;
  scoreEligible: number;
  mediumEligible: number;
  heavyEligible: number;
  aboveElevationMin: number;
  aboveElevationMax: number;
  scoreSum: number;
  scoreCount: number;
  scoreMin: number;
  scoreMax: number;
};

type ScoreStats = {
  mean: number;
  min: number;
  max: number;
};

const pickPercentile = (sorted: number[], ratio: number): number => {
  if (sorted.length === 0) return 0;
  const idx = Math.min(
    sorted.length - 1,
    Math.max(0, Math.floor(ratio * (sorted.length - 1)))
  );
  return sorted[idx]!;
};

const computeSnowElevationStats = (sorted: number[]) => {
  if (sorted.length === 0) {
    return { count: 0, min: 0, max: 0, p50: 0, p90: 0, p99: 0 };
  }

  return {
    count: sorted.length,
    min: sorted[0]!,
    max: sorted[sorted.length - 1]!,
    p50: pickPercentile(sorted, 0.5),
    p90: pickPercentile(sorted, 0.9),
    p99: pickPercentile(sorted, 0.99),
  };
};

const collectLandElevations = (input: PlotEffectsInput): number[] => {
  const elevations: number[] = [];
  const { width, height, landMask, elevation } = input;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * width;
    for (let x = 0; x < width; x++) {
      if (landMask[rowOffset + x] === 0) continue;
      const idx = rowOffset + x;
      elevations.push(elevation[idx]);
    }
  }

  return elevations;
};

type SnowResolvedConfig = {
  enabled: boolean;
  selectors: {
    light: { typeName: string };
    medium: { typeName: string };
    heavy: { typeName: string };
  };
  elevationStrategy: "percentile" | "absolute";
  elevationPercentileMin: number;
  elevationPercentileMax: number;
  elevationMin: number;
  elevationMax: number;
  moistureMin: number;
  moistureMax: number;
  freezeWeight: number;
  elevationWeight: number;
  moistureWeight: number;
  scoreBias: number;
  scoreNormalization: number;
  maxTemperature: number;
  maxAridity: number;
  lightThreshold: number;
  mediumThreshold: number;
  heavyThreshold: number;
  coverageChance: number;
};

type PlotEffectsResolvedConfig = {
  snow: SnowResolvedConfig;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") return null;
  return value as Record<string, unknown>;
}

function asBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function asNumber(value: unknown, fallback: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return value;
}

function asString(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function resolvePlotEffectsConfig(config: unknown): PlotEffectsResolvedConfig | null {
  const root = asRecord(config);
  const snowRaw = root ? asRecord(root.snow) : null;
  if (!snowRaw) return null;

  const selectorsRaw = asRecord(snowRaw.selectors);
  const lightRaw = selectorsRaw ? asRecord(selectorsRaw.light) : null;
  const mediumRaw = selectorsRaw ? asRecord(selectorsRaw.medium) : null;
  const heavyRaw = selectorsRaw ? asRecord(selectorsRaw.heavy) : null;

  const elevationStrategyRaw = asString(snowRaw.elevationStrategy, "absolute");
  const elevationStrategy =
    elevationStrategyRaw === "percentile" ? "percentile" : "absolute";

  return {
    snow: {
      enabled: asBoolean(snowRaw.enabled, false),
      selectors: {
        light: { typeName: asString(lightRaw?.typeName, "light") },
        medium: { typeName: asString(mediumRaw?.typeName, "medium") },
        heavy: { typeName: asString(heavyRaw?.typeName, "heavy") },
      },
      elevationStrategy,
      elevationPercentileMin: asNumber(snowRaw.elevationPercentileMin, 0),
      elevationPercentileMax: asNumber(snowRaw.elevationPercentileMax, 1),
      elevationMin: asNumber(snowRaw.elevationMin, 0),
      elevationMax: asNumber(snowRaw.elevationMax, 0),
      moistureMin: asNumber(snowRaw.moistureMin, 0),
      moistureMax: asNumber(snowRaw.moistureMax, 0),
      freezeWeight: asNumber(snowRaw.freezeWeight, 0),
      elevationWeight: asNumber(snowRaw.elevationWeight, 0),
      moistureWeight: asNumber(snowRaw.moistureWeight, 0),
      scoreBias: asNumber(snowRaw.scoreBias, 0),
      scoreNormalization: asNumber(snowRaw.scoreNormalization, 1),
      maxTemperature: asNumber(snowRaw.maxTemperature, 0),
      maxAridity: asNumber(snowRaw.maxAridity, 0),
      lightThreshold: asNumber(snowRaw.lightThreshold, 0),
      mediumThreshold: asNumber(snowRaw.mediumThreshold, 0),
      heavyThreshold: asNumber(snowRaw.heavyThreshold, 0),
      coverageChance: asNumber(snowRaw.coverageChance, 0),
    },
  };
}

const resolveSnowElevationRange = (input: PlotEffectsInput, snow: SnowResolvedConfig) => {
  const elevations = collectLandElevations(input);
  const sorted = elevations.slice().sort((a, b) => a - b);
  const stats = computeSnowElevationStats(sorted);

  if (snow.elevationStrategy === "percentile") {
    const minPercentile = clamp01(snow.elevationPercentileMin);
    const maxPercentile = clamp01(snow.elevationPercentileMax);
    const min =
      sorted.length > 0 ? pickPercentile(sorted, minPercentile) : snow.elevationMin;
    const max =
      sorted.length > 0 ? pickPercentile(sorted, maxPercentile) : snow.elevationMax;

    return {
      strategy: "percentile",
      min,
      max,
      stats,
      percentiles: {
        min: minPercentile,
        max: maxPercentile,
      },
    };
  }

  return {
    strategy: "absolute",
    min: snow.elevationMin,
    max: snow.elevationMax,
    stats,
  };
};

const createBucket = (): TerrainBucket => ({
  total: 0,
  gateEligible: 0,
  scoreEligible: 0,
  mediumEligible: 0,
  heavyEligible: 0,
  aboveElevationMin: 0,
  aboveElevationMax: 0,
  scoreSum: 0,
  scoreCount: 0,
  scoreMin: Number.POSITIVE_INFINITY,
  scoreMax: Number.NEGATIVE_INFINITY,
});

const finalizeScoreStats = (bucket: TerrainBucket): ScoreStats | null => {
  if (bucket.scoreCount === 0) return null;
  return {
    mean: Number((bucket.scoreSum / bucket.scoreCount).toFixed(3)),
    min: Number(bucket.scoreMin.toFixed(3)),
    max: Number(bucket.scoreMax.toFixed(3)),
  };
};

/**
 * Logs a verbose summary of snow eligibility and scoring buckets for diagnostics.
 */
export function logSnowEligibilitySummary(
  trace: TraceScope | null | undefined,
  input: PlotEffectsInput,
  config: unknown,
  placements: PlotEffectPlacement[],
  terrainType: Uint8Array
): void {
  if (!trace?.isVerbose) return;

  const resolved = resolvePlotEffectsConfig(config);
  if (!resolved) return;

  if (!resolved.snow.enabled) {
    devLogJson(trace, "snow summary", {
      enabled: false,
      reason: "snow placement disabled",
    });
    return;
  }

  const snowTypes = {
    light: resolved.snow.selectors.light.typeName,
    medium: resolved.snow.selectors.medium.typeName,
    heavy: resolved.snow.selectors.heavy.typeName,
  };

  const bucketLand = createBucket();
  const bucketMountain = createBucket();
  const bucketHill = createBucket();
  const bucketFlat = createBucket();

  const snowElevation = resolveSnowElevationRange(input, resolved.snow);
  const elevationMin = snowElevation.min;
  const elevationMax = snowElevation.max;

  const totals = {
    land: 0,
    mountain: 0,
    hill: 0,
    flat: 0,
  };

  for (let y = 0; y < input.height; y++) {
    const rowOffset = y * input.width;
    for (let x = 0; x < input.width; x++) {
      const idx = rowOffset + x;
      if (input.landMask[idx] === 0) continue;

      const terrain = terrainType[idx];
      const isMountain = terrain === MOUNTAIN_TERRAIN;
      const isHill = terrain === HILL_TERRAIN;
      const isFlat = terrain === FLAT_TERRAIN;

      totals.land += 1;
      bucketLand.total += 1;

      if (isMountain) {
        totals.mountain += 1;
        bucketMountain.total += 1;
      } else if (isHill) {
        totals.hill += 1;
        bucketHill.total += 1;
      } else if (isFlat) {
        totals.flat += 1;
        bucketFlat.total += 1;
      }

      const temp = input.surfaceTemperature[idx];
      const moisture = input.effectiveMoisture[idx];
      const aridity = input.aridityIndex[idx];
      const freeze = input.freezeIndex[idx];
      const elevation = input.elevation[idx];

      const elevationFactor = normalizeRange(elevation, elevationMin, elevationMax);
      const moistureFactor = normalizeRange(
        moisture,
        resolved.snow.moistureMin,
        resolved.snow.moistureMax
      );
      const scoreRaw =
        freeze * resolved.snow.freezeWeight +
        elevationFactor * resolved.snow.elevationWeight +
        moistureFactor * resolved.snow.moistureWeight +
        resolved.snow.scoreBias;
      const score = clamp01(scoreRaw / Math.max(0.0001, resolved.snow.scoreNormalization));

      const gateEligible = temp <= resolved.snow.maxTemperature && aridity <= resolved.snow.maxAridity;

      const applyBucket = (bucket: TerrainBucket): void => {
        bucket.scoreSum += score;
        bucket.scoreCount += 1;
        bucket.scoreMin = Math.min(bucket.scoreMin, score);
        bucket.scoreMax = Math.max(bucket.scoreMax, score);
        if (elevation >= elevationMin) bucket.aboveElevationMin += 1;
        if (elevation >= elevationMax) bucket.aboveElevationMax += 1;
        if (gateEligible) bucket.gateEligible += 1;
        if (score >= resolved.snow.lightThreshold) bucket.scoreEligible += 1;
        if (score >= resolved.snow.mediumThreshold) bucket.mediumEligible += 1;
        if (score >= resolved.snow.heavyThreshold) bucket.heavyEligible += 1;
      };

      applyBucket(bucketLand);
      if (isMountain) applyBucket(bucketMountain);
      if (isHill) applyBucket(bucketHill);
      if (isFlat) applyBucket(bucketFlat);
    }
  }

  const placementCounts = {
    snowLight: 0,
    snowMedium: 0,
    snowHeavy: 0,
    total: placements.length,
  };

  for (const placement of placements) {
    if (placement.plotEffect === snowTypes.light) placementCounts.snowLight += 1;
    if (placement.plotEffect === snowTypes.medium) placementCounts.snowMedium += 1;
    if (placement.plotEffect === snowTypes.heavy) placementCounts.snowHeavy += 1;
  }

  devLogJson(trace, "snow summary", {
    enabled: true,
    snowTypes,
    config: {
      coverageChance: resolved.snow.coverageChance,
      thresholds: {
        light: resolved.snow.lightThreshold,
        medium: resolved.snow.mediumThreshold,
        heavy: resolved.snow.heavyThreshold,
      },
      elevation: {
        strategy: snowElevation.strategy,
        absolute: {
          min: resolved.snow.elevationMin,
          max: resolved.snow.elevationMax,
        },
        percentiles: {
          min: resolved.snow.elevationPercentileMin,
          max: resolved.snow.elevationPercentileMax,
        },
        derived: {
          min: elevationMin,
          max: elevationMax,
        },
        stats: snowElevation.stats,
      },
      temperatureMax: resolved.snow.maxTemperature,
      aridityMax: resolved.snow.maxAridity,
      scoreWeights: {
        freeze: resolved.snow.freezeWeight,
        elevation: resolved.snow.elevationWeight,
        moisture: resolved.snow.moistureWeight,
      },
      scoreNormalization: resolved.snow.scoreNormalization,
    },
    totals,
    land: {
      ...bucketLand,
      scoreStats: finalizeScoreStats(bucketLand),
    },
    mountain: {
      ...bucketMountain,
      scoreStats: finalizeScoreStats(bucketMountain),
    },
    hill: {
      ...bucketHill,
      scoreStats: finalizeScoreStats(bucketHill),
    },
    flat: {
      ...bucketFlat,
      scoreStats: finalizeScoreStats(bucketFlat),
    },
    placements: placementCounts,
    expectedCoverage: Number(
      ((bucketLand.scoreEligible * resolved.snow.coverageChance) / 100).toFixed(2)
    ),
  });
}
