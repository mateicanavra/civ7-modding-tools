import { estimateCurlZOddQ } from "@swooper/mapgen-core/lib/grid";
import {
  type CountMetric,
  measureMetricCount,
  type NumericMetricSummary,
  summarizeNumericMetrics,
} from "@swooper/mapgen-metrics";
import type { NonEmptyTuple } from "type-fest";

import type { StandardMapCapture } from "../../capture.js";

/** The exact capture evidence consumed by the wind-structure measurement. */
export type StandardWindStructureInput = Readonly<{
  provenance: Pick<
    StandardMapCapture["provenance"],
    "width" | "height" | "topLatitude" | "bottomLatitude"
  >;
  model: Pick<StandardMapCapture["model"], "windU" | "windV">;
}>;

/** Neutral structure measurements projected from the Standard recipe's durable wind field. */
export type StandardWindStructureMetrics = Readonly<{
  /** Tiles whose vector magnitude reaches the signed-byte quantization ceiling. */
  saturatedTiles: CountMetric;
  /** Tiles whose vector deviation from the row mean exceeds that row-mean magnitude. */
  deviationDominantTiles: CountMetric;
  /** Scored rows whose mean zonal direction agrees with Earth's broad circulation bands. */
  zonalBandSignRows: CountMetric;
  /** Per-row absolute zonal mean in signed-byte wind quanta. */
  rowMeanAbsU: NumericMetricSummary;
  /** Per-row absolute meridional mean in signed-byte wind quanta. */
  rowMeanAbsV: NumericMetricSummary;
  /** Per-row RMS zonal deviation from the row-mean wind in signed-byte wind quanta. */
  withinRowRmsU: NumericMetricSummary;
  /** Tropical mean meridional flow; equatorward is positive north and negative south. */
  tropicalMeridional: Readonly<{ northMeanV: number | null; southMeanV: number | null }>;
  /** Mean local z-curl in the temperate bands, retained as a hemispheric chirality proxy. */
  hemisphericCurl: Readonly<{ northMeanCurl: number | null; southMeanCurl: number | null }>;
}>;

/** Measures broad directional signal, texture, saturation, and chirality without target policy. */
export function measureStandardWindStructure(
  capture: StandardWindStructureInput
): StandardWindStructureMetrics {
  const { width, height } = capture.provenance;
  const { windU, windV } = capture.model;
  const tileCount = width * height;
  const windUF32 = Float32Array.from(windU);
  const windVF32 = Float32Array.from(windV);
  const curlZ = estimateCurlZOddQ(width, height, windUF32, windVF32);

  let saturatedTileCount = 0;
  let deviationDominantTileCount = 0;
  let zonalBandSignCorrectRowCount = 0;
  let zonalBandSignScoredRowCount = 0;
  let northTropicalVSum = 0;
  let northTropicalTileCount = 0;
  let southTropicalVSum = 0;
  let southTropicalTileCount = 0;
  let northCurlSum = 0;
  let northCurlTileCount = 0;
  let southCurlSum = 0;
  let southCurlTileCount = 0;
  const rowMeanAbsUValues: number[] = [];
  const rowMeanAbsVValues: number[] = [];
  const withinRowRmsUValues: number[] = [];

  for (let row = 0; row < height; row += 1) {
    const latitudeDeg = rowLatitudeDeg(capture, row);
    const rowStart = row * width;
    let rowMeanU = 0;
    let rowMeanV = 0;

    for (let column = 0; column < width; column += 1) {
      const index = rowStart + column;
      const u = windU[index] ?? 0;
      const v = windV[index] ?? 0;
      rowMeanU += u / width;
      rowMeanV += v / width;
      if (Math.hypot(u, v) >= 126.5) saturatedTileCount += 1;

      if (latitudeDeg > 5 && latitudeDeg < 25) {
        northTropicalVSum += v;
        northTropicalTileCount += 1;
      } else if (latitudeDeg < -5 && latitudeDeg > -25) {
        southTropicalVSum += v;
        southTropicalTileCount += 1;
      }

      if (latitudeDeg >= 10 && latitudeDeg <= 60) {
        northCurlSum += curlZ[index] ?? 0;
        northCurlTileCount += 1;
      } else if (latitudeDeg <= -10 && latitudeDeg >= -60) {
        southCurlSum += curlZ[index] ?? 0;
        southCurlTileCount += 1;
      }
    }

    let rowVarianceU = 0;
    const rowMeanMagnitude = Math.hypot(rowMeanU, rowMeanV);
    for (let column = 0; column < width; column += 1) {
      const index = rowStart + column;
      const deviationU = (windU[index] ?? 0) - rowMeanU;
      const deviationV = (windV[index] ?? 0) - rowMeanV;
      rowVarianceU += (deviationU * deviationU) / width;
      if (Math.hypot(deviationU, deviationV) > rowMeanMagnitude) {
        deviationDominantTileCount += 1;
      }
    }

    rowMeanAbsUValues.push(Math.abs(rowMeanU));
    rowMeanAbsVValues.push(Math.abs(rowMeanV));
    withinRowRmsUValues.push(Math.sqrt(rowVarianceU));

    if (Math.abs(rowMeanU) > 1) {
      const absLatitude = Math.abs(latitudeDeg);
      const expectedZonalSign = absLatitude < 30 || absLatitude >= 60 ? -1 : 1;
      zonalBandSignScoredRowCount += 1;
      if (Math.sign(rowMeanU) === expectedZonalSign) zonalBandSignCorrectRowCount += 1;
    }
  }

  return Object.freeze({
    saturatedTiles: measureMetricCount(saturatedTileCount, tileCount),
    deviationDominantTiles: measureMetricCount(deviationDominantTileCount, tileCount),
    zonalBandSignRows: measureMetricCount(
      zonalBandSignCorrectRowCount,
      zonalBandSignScoredRowCount
    ),
    rowMeanAbsU: summarizeNumericMetrics(requireNonEmptyRows(rowMeanAbsUValues)),
    rowMeanAbsV: summarizeNumericMetrics(requireNonEmptyRows(rowMeanAbsVValues)),
    withinRowRmsU: summarizeNumericMetrics(requireNonEmptyRows(withinRowRmsUValues)),
    tropicalMeridional: Object.freeze({
      northMeanV:
        northTropicalTileCount > 0 ? northTropicalVSum / northTropicalTileCount : null,
      southMeanV:
        southTropicalTileCount > 0 ? southTropicalVSum / southTropicalTileCount : null,
    }),
    hemisphericCurl: Object.freeze({
      northMeanCurl: northCurlTileCount > 0 ? northCurlSum / northCurlTileCount : null,
      southMeanCurl: southCurlTileCount > 0 ? southCurlSum / southCurlTileCount : null,
    }),
  });
}

function rowLatitudeDeg(capture: StandardWindStructureInput, row: number): number {
  const { topLatitude, bottomLatitude, height } = capture.provenance;
  if (height <= 1) return (topLatitude + bottomLatitude) / 2;
  return topLatitude + ((bottomLatitude - topLatitude) / (height - 1)) * row;
}

function requireNonEmptyRows(values: readonly number[]): NonEmptyTuple<number> {
  const [first, ...rest] = values;
  if (first === undefined) {
    throw new Error("Standard wind-structure metrics require at least one grid row.");
  }
  return [first, ...rest];
}
