import { type CountMetric, measureMetricCount } from "@swooper/mapgen-metrics";
import { type Static, Type } from "typebox";

import type { StandardMapCapture } from "../../capture.js";

export const STANDARD_SEASONAL_RAINFALL_METRIC_KEY = "hydrology.seasonalRainfall";
const RAINFALL_CEILING = 200;

/** Seasonal arrays remain step-local; only saturation counts cross the metrics boundary. */
export const StandardSeasonalRainfallMeasurementsSchema = Type.Object(
  {
    version: Type.Literal(1),
    landTileCount: Type.Integer({ minimum: 0 }),
    saturatedLandTileCounts: Type.Array(Type.Integer({ minimum: 0 }), {
      minItems: 1,
      description: "Land rainfall counts at or above the 200-unit ceiling, in season order.",
    }),
  },
  { additionalProperties: false }
);

export type StandardSeasonalRainfallMeasurements = Readonly<
  Omit<Static<typeof StandardSeasonalRainfallMeasurementsSchema>, "saturatedLandTileCounts"> & {
    saturatedLandTileCounts: readonly number[];
  }
>;

/** Projects the seasonal saturation evidence before the baseline observation is discarded. */
export function measureStandardSeasonalRainfall(
  input: Readonly<{
    landMask: ArrayLike<number>;
    seasonalRainfall: readonly ArrayLike<number>[];
  }>
): StandardSeasonalRainfallMeasurements {
  if (input.seasonalRainfall.length === 0) {
    throw new Error("Seasonal rainfall measurement requires at least one observed season.");
  }
  let landTileCount = 0;
  for (let index = 0; index < input.landMask.length; index += 1) {
    if (input.landMask[index] === 1) landTileCount += 1;
  }
  const saturatedLandTileCounts = input.seasonalRainfall.map((rainfall) =>
    countSaturatedLandTiles(input.landMask, rainfall)
  );
  Object.freeze(saturatedLandTileCounts);
  return Object.freeze({ version: 1, landTileCount, saturatedLandTileCounts });
}

/** Exact capture evidence consumed by the climate-structure measurement. */
export type StandardClimateStructureInput = Readonly<{
  provenance: Pick<StandardMapCapture["provenance"], "width" | "height">;
  model: Pick<
    StandardMapCapture["model"],
    | "landMask"
    | "baselineRainfall"
    | "refinedRainfall"
    | "seasonalRainfall"
    | "surfaceTemperature"
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
