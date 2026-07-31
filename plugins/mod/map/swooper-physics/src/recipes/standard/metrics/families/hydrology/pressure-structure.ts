import { type CountMetric, measureMetricCount } from "@swooper/mapgen-metrics";

import type { StandardMapCapture } from "../../capture.js";

type PressureBandKey = "itcz" | "ridge" | "subpolar";
type Hemisphere = "north" | "south";

/** The exact capture evidence consumed by the pressure-structure measurement. */
export type StandardPressureStructureInput = Readonly<{
  provenance: Pick<
    StandardMapCapture["provenance"],
    "width" | "height" | "topLatitude" | "bottomLatitude"
  >;
  model: Pick<StandardMapCapture["model"], "pressure" | "windU">;
}>;

/**
 * Neutral structure facts projected from the Standard recipe's published circulation-pressure
 * anomaly field.
 */
export type StandardPressureStructureMetrics = Readonly<{
  /** Mean pressure deviation in each declared latitude band and hemisphere. */
  bandMeans: Readonly<{
    northItcz: number | null;
    northRidge: number | null;
    northSubpolar: number | null;
    southItcz: number | null;
    southRidge: number | null;
    southSubpolar: number | null;
  }>;
  /**
   * Normalized north-to-south band-profile asymmetry. Zero is a perfect mirror and one is
   * completely one-sided.
   */
  mirrorAsymmetry: number | null;
  /**
   * Extratropical rows whose zonal-mean wind sign agrees with the shared pressure-belt frame.
   * This checks coordinate and scaffold consistency; it does not claim that the annual-mean
   * pressure field reconstructs the complete wind field.
   */
  scaffoldFrameSign: Readonly<{ north: CountMetric; south: CountMetric }>;
  /**
   * RMS hPa departure from each row's zonal mean across the published grid. Removing the belt
   * scaffold isolates the non-zonal pressure signal available to organize weather-scale flow.
   */
  zonalAnomalyRmsHpa: number;
}>;

/** Measures belt, mirror, shared-frame, and non-zonal anomaly evidence without target policy. */
export function measureStandardPressureStructure(
  capture: StandardPressureStructureInput
): StandardPressureStructureMetrics {
  const { width, height } = capture.provenance;
  const { pressure, windU } = capture.model;
  const bandSums = createBandRecord();
  const bandCounts = createBandRecord();
  const zonalMeanPressure = new Float64Array(height);
  const zonalMeanWindU = new Float64Array(height);
  let anomalySquareSum = 0;

  for (let row = 0; row < height; row += 1) {
    const latitudeDeg = rowLatitudeDeg(capture, row);
    const hemisphere: Hemisphere = latitudeDeg >= 0 ? "north" : "south";
    const bandKey = pressureBandKeyForLatitude(Math.abs(latitudeDeg));
    const rowStart = row * width;
    let pressureSum = 0;
    let windUSum = 0;

    for (let column = 0; column < width; column += 1) {
      const index = rowStart + column;
      pressureSum += pressure[index] ?? 0;
      windUSum += windU[index] ?? 0;
    }

    const rowMeanPressure = pressureSum / Math.max(1, width);
    zonalMeanPressure[row] = rowMeanPressure;
    zonalMeanWindU[row] = windUSum / Math.max(1, width);
    for (let column = 0; column < width; column += 1) {
      const anomaly = (pressure[rowStart + column] ?? 0) - rowMeanPressure;
      anomalySquareSum += anomaly * anomaly;
    }

    if (bandKey) {
      bandSums[hemisphere][bandKey] += pressureSum;
      bandCounts[hemisphere][bandKey] += width;
    }
  }

  const bandMean = (hemisphere: Hemisphere, band: PressureBandKey): number | null =>
    bandCounts[hemisphere][band] > 0
      ? bandSums[hemisphere][band] / bandCounts[hemisphere][band]
      : null;
  const bandMeans = Object.freeze({
    northItcz: bandMean("north", "itcz"),
    northRidge: bandMean("north", "ridge"),
    northSubpolar: bandMean("north", "subpolar"),
    southItcz: bandMean("south", "itcz"),
    southRidge: bandMean("south", "ridge"),
    southSubpolar: bandMean("south", "subpolar"),
  });

  let mirrorNumerator = 0;
  let mirrorDenominator = 0;
  let mirrorComplete = true;
  for (const band of ["itcz", "ridge", "subpolar"] as const) {
    const north = bandMean("north", band);
    const south = bandMean("south", band);
    if (north === null || south === null) {
      mirrorComplete = false;
      break;
    }
    mirrorNumerator += Math.abs(north - south);
    mirrorDenominator += Math.abs(north) + Math.abs(south);
  }
  const mirrorAsymmetry =
    mirrorComplete && mirrorDenominator > 1e-9 ? mirrorNumerator / mirrorDenominator : null;

  let northAgreeing = 0;
  let northScored = 0;
  let southAgreeing = 0;
  let southScored = 0;
  for (let row = 1; row < height - 1; row += 1) {
    const latitudeDeg = rowLatitudeDeg(capture, row);
    const latitudeAbs = Math.abs(latitudeDeg);
    if (latitudeAbs < 35 || latitudeAbs > 65) continue;

    const latitudeSpan = rowLatitudeDeg(capture, row + 1) - rowLatitudeDeg(capture, row - 1);
    if (Math.abs(latitudeSpan) < 1e-9) continue;
    const pressureGradient =
      ((zonalMeanPressure[row + 1] ?? 0) - (zonalMeanPressure[row - 1] ?? 0)) / latitudeSpan;
    const meanU = zonalMeanWindU[row] ?? 0;
    if (Math.abs(meanU) <= 1 || Math.abs(pressureGradient) <= 1e-6) continue;

    const expectedSign = -Math.sign(latitudeDeg) * Math.sign(pressureGradient);
    const agrees = Math.sign(meanU) === expectedSign;
    if (latitudeDeg >= 0) {
      northScored += 1;
      if (agrees) northAgreeing += 1;
    } else {
      southScored += 1;
      if (agrees) southAgreeing += 1;
    }
  }

  return Object.freeze({
    bandMeans,
    mirrorAsymmetry,
    scaffoldFrameSign: Object.freeze({
      north: measureMetricCount(northAgreeing, northScored),
      south: measureMetricCount(southAgreeing, southScored),
    }),
    zonalAnomalyRmsHpa: Math.sqrt(anomalySquareSum / Math.max(1, width * height)),
  });
}

function createBandRecord(): Record<Hemisphere, Record<PressureBandKey, number>> {
  return {
    north: { itcz: 0, ridge: 0, subpolar: 0 },
    south: { itcz: 0, ridge: 0, subpolar: 0 },
  };
}

function pressureBandKeyForLatitude(latitudeAbs: number): PressureBandKey | null {
  if (latitudeAbs <= 8) return "itcz";
  if (latitudeAbs >= 25 && latitudeAbs <= 35) return "ridge";
  if (latitudeAbs >= 55 && latitudeAbs <= 65) return "subpolar";
  return null;
}

function rowLatitudeDeg(capture: StandardPressureStructureInput, row: number): number {
  const { topLatitude, bottomLatitude, height } = capture.provenance;
  if (height <= 1) return (topLatitude + bottomLatitude) / 2;
  return topLatitude + ((bottomLatitude - topLatitude) / (height - 1)) * row;
}
