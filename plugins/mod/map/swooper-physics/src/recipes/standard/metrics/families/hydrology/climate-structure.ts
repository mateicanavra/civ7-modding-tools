import { type CountMetric, measureMetricCount } from "@swooper/mapgen-metrics";
import { Type } from "typebox";

import type { StandardMapCapture } from "../../capture.js";

export const STANDARD_SEASONAL_RAINFALL_METRIC_KEY = "hydrology.seasonalRainfall";
const RAINFALL_CEILING = 200;

const seasonalCountFields = {
  landTileCount: Type.Integer({ minimum: 0 }),
  saturatedLandTileCounts: Type.Array(Type.Integer({ minimum: 0 }), {
    minItems: 1,
    description: "Land rainfall counts at or above the 200-unit ceiling, in season order.",
  }),
};
/** Full integration counts and their measure remain distinct from optional visualization samples. */
export const StandardSeasonalRainfallMeasurementsSchema = Type.Union([
  Type.Object(
    { version: Type.Literal(1), ...seasonalCountFields },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      version: Type.Literal(2),
      ...seasonalCountFields,
      sampling: Type.Object(
        {
          model: Type.Literal("periodic-cycle"),
          phaseOrigin: Type.Literal("northward-equinox"),
          phases: Type.Array(Type.Number({ minimum: 0, exclusiveMaximum: 1 }), { minItems: 1 }),
          weights: Type.Array(Type.Number({ exclusiveMinimum: 0 }), { minItems: 1 }),
          observationIndices: Type.Array(Type.Integer({ minimum: 0 }), {
            minItems: 2,
            maxItems: 4,
          }),
        },
        { additionalProperties: false }
      ),
    },
    { additionalProperties: false }
  ),
]);

type PeriodicSampling = Readonly<{
  model: "periodic-cycle";
  phaseOrigin: "northward-equinox";
  phases: readonly number[];
  weights: readonly number[];
  observationIndices: readonly number[];
}>;
export type StandardSeasonalRainfallMeasurements = Readonly<{
  landTileCount: number;
  saturatedLandTileCounts: readonly number[];
}> &
  (Readonly<{ version: 1 }> | Readonly<{ version: 2; sampling: PeriodicSampling }>);

/** Projects the seasonal saturation evidence before the baseline observation is discarded. */
export function measureStandardSeasonalRainfall(
  input: Readonly<{
    landMask: ArrayLike<number>;
    seasonalRainfall: readonly ArrayLike<number>[];
    seasonalIntegration?: PeriodicSampling & Readonly<{ rainfall: readonly ArrayLike<number>[] }>;
  }>
): StandardSeasonalRainfallMeasurements {
  const rainfall = input.seasonalIntegration?.rainfall ?? input.seasonalRainfall;
  if (rainfall.length === 0) {
    throw new Error("Seasonal rainfall measurement requires at least one observed season.");
  }
  let landTileCount = 0;
  for (let index = 0; index < input.landMask.length; index += 1) {
    if (input.landMask[index] === 1) landTileCount += 1;
  }
  const saturatedLandTileCounts = rainfall.map((rainfall) =>
    countSaturatedLandTiles(input.landMask, rainfall)
  );
  Object.freeze(saturatedLandTileCounts);
  if (input.seasonalIntegration) {
    const { model, phaseOrigin, phases, weights, observationIndices } = input.seasonalIntegration;
    validatePeriodicSampling(input.seasonalIntegration, rainfall.length);
    return Object.freeze({
      version: 2,
      landTileCount,
      saturatedLandTileCounts,
      sampling: Object.freeze({
        model,
        phaseOrigin,
        phases: Object.freeze([...phases]),
        weights: Object.freeze([...weights]),
        observationIndices: Object.freeze([...observationIndices]),
      }),
    });
  }
  return Object.freeze({ version: 1, landTileCount, saturatedLandTileCounts });
}

function validatePeriodicSampling(sampling: PeriodicSampling, count: number): void {
  if (
    sampling.phases.length !== count ||
    sampling.weights.length !== count ||
    sampling.phases.some(
      (phase, index) =>
        !Number.isFinite(phase) ||
        phase < 0 ||
        phase >= 1 ||
        (index > 0 && phase <= sampling.phases[index - 1]!)
    ) ||
    sampling.weights.some((weight) => !Number.isFinite(weight) || weight <= 0) ||
    Math.abs(sampling.weights.reduce((sum, weight) => sum + weight, 0) - 1) >
      Number.EPSILON * count * 4 ||
    ![2, 4].includes(sampling.observationIndices.length) ||
    new Set(sampling.observationIndices).size !== sampling.observationIndices.length ||
    sampling.observationIndices.some(
      (index) => !Number.isInteger(index) || index < 0 || index >= count
    )
  ) {
    throw new Error(
      "Seasonal integration requires ordered phases, normalized weights, and valid observation indices."
    );
  }
}

/** Exact capture evidence consumed by the climate-structure measurement. */
export type StandardClimateStructureInput = Readonly<{
  provenance: Pick<StandardMapCapture["provenance"], "width" | "height">;
  model: Pick<
    StandardMapCapture["model"],
    "landMask" | "baselineRainfall" | "refinedRainfall" | "seasonalRainfall" | "surfaceTemperature"
  >;
}>;

/** Neutral physical-climate measurements; biome categories are measured by Ecology. */
export type StandardClimateStructureMetrics = Readonly<{
  baselineSaturatedLandTiles: CountMetric;
  refinedSaturatedLandTiles: CountMetric;
  maximumSeasonalLandSaturationFraction: number | null;
  /** sqrt(sum of squared land-temperature departures from row land means / land count). */
  pooledWithinRowTemperatureSdC: number | null;
}>;

/** Removes latitude-row means without giving short land rows disproportionate weight. */
export function measureStandardClimateStructure(
  capture: StandardClimateStructureInput
): StandardClimateStructureMetrics {
  const { width, height } = capture.provenance;
  const { landMask, baselineRainfall, refinedRainfall, seasonalRainfall, surfaceTemperature } =
    capture.model;
  const tileCount = width * height;
  if (
    landMask.length !== tileCount ||
    baselineRainfall.length !== tileCount ||
    refinedRainfall.length !== tileCount ||
    surfaceTemperature.length !== tileCount
  ) {
    throw new Error("Climate structure requires complete rainfall, land, and temperature grids.");
  }
  if (seasonalRainfall.version === 2) {
    validatePeriodicSampling(
      seasonalRainfall.sampling,
      seasonalRainfall.saturatedLandTileCounts.length
    );
  }
  let landTileCount = 0;
  let withinRowSquaredDeparture = 0;
  for (let row = 0; row < height; row += 1) {
    let rowLandCount = 0;
    let rowTemperatureSum = 0;
    for (let column = 0; column < width; column += 1) {
      const index = row * width + column;
      if (landMask[index] !== 1) continue;
      rowLandCount += 1;
      rowTemperatureSum += surfaceTemperature[index]!;
    }
    if (rowLandCount === 0) continue;
    landTileCount += rowLandCount;
    const rowMean = rowTemperatureSum / rowLandCount;
    for (let column = 0; column < width; column += 1) {
      const index = row * width + column;
      if (landMask[index] !== 1) continue;
      const departure = surfaceTemperature[index]! - rowMean;
      withinRowSquaredDeparture += departure * departure;
    }
  }

  if (
    seasonalRainfall.landTileCount !== landTileCount ||
    seasonalRainfall.saturatedLandTileCounts.length === 0 ||
    seasonalRainfall.saturatedLandTileCounts.some(
      (count) => !Number.isInteger(count) || count < 0 || count > landTileCount
    )
  ) {
    throw new Error(
      "Climate structure requires seasonal saturation counts for the same land population."
    );
  }

  return Object.freeze({
    baselineSaturatedLandTiles: measureMetricCount(
      countSaturatedLandTiles(landMask, baselineRainfall),
      landTileCount
    ),
    refinedSaturatedLandTiles: measureMetricCount(
      countSaturatedLandTiles(landMask, refinedRainfall),
      landTileCount
    ),
    maximumSeasonalLandSaturationFraction:
      seasonalRainfall.landTileCount > 0
        ? Math.max(...seasonalRainfall.saturatedLandTileCounts) / seasonalRainfall.landTileCount
        : null,
    pooledWithinRowTemperatureSdC:
      landTileCount > 0 ? Math.sqrt(withinRowSquaredDeparture / landTileCount) : null,
  });
}

function countSaturatedLandTiles(landMask: ArrayLike<number>, rainfall: ArrayLike<number>): number {
  if (rainfall.length !== landMask.length) {
    throw new Error("Rainfall saturation requires rainfall and land grids of identical length.");
  }
  let count = 0;
  for (let index = 0; index < landMask.length; index += 1) {
    if (landMask[index] === 1 && rainfall[index]! >= RAINFALL_CEILING) count += 1;
  }
  return count;
}
