import { getHexNeighborIndicesOddQ, idx } from "@swooper/mapgen-core/lib/grid";
import { fnv1a32Int32Values } from "@swooper/mapgen-core/lib/hash";
import { clamp01, lerp } from "@swooper/mapgen-core/lib/math";
import { PerlinNoise } from "@swooper/mapgen-core/lib/noise";

const EQUATORIAL_TROUGH_HPA = 8;
const SUBTROPICAL_RIDGE_HPA = 12;
const SUBPOLAR_LOW_HPA = 14;
const POLAR_HIGH_HPA = 10;
const SUBTROPICAL_RIDGE_LATITUDE_DEG = 30;
const SUBPOLAR_LOW_LATITUDE_DEG = 60;
const POLAR_HIGH_LATITUDE_DEG = 90;
const STATIONARY_ORGANIZATION_LATITUDE_DEG = 25;
const THERMAL_SMOOTHING_BLEND = 0.55;

function interpolatePressureBelt(startHpa: number, endHpa: number, progress: number): number {
  const eased = (1 - Math.cos(Math.PI * clamp01(progress))) / 2;
  return lerp(startHpa, endHpa, eased);
}

/**
 * Returns the zonal-mean pressure scaffold at an absolute latitude.
 *
 * Extrema align with the circulation backbone at 0, 30, 60, and 90 degrees, where the
 * cosine-eased profile has zero slope.
 */
function pressureScaffoldAtLatitude(latitudeDeg: number): number {
  const latitudeAbs = Math.min(POLAR_HIGH_LATITUDE_DEG, Math.abs(latitudeDeg));
  if (latitudeAbs < SUBTROPICAL_RIDGE_LATITUDE_DEG) {
    return interpolatePressureBelt(
      -EQUATORIAL_TROUGH_HPA,
      SUBTROPICAL_RIDGE_HPA,
      latitudeAbs / SUBTROPICAL_RIDGE_LATITUDE_DEG
    );
  }
  if (latitudeAbs < SUBPOLAR_LOW_LATITUDE_DEG) {
    return interpolatePressureBelt(
      SUBTROPICAL_RIDGE_HPA,
      -SUBPOLAR_LOW_HPA,
      (latitudeAbs - SUBTROPICAL_RIDGE_LATITUDE_DEG) /
        (SUBPOLAR_LOW_LATITUDE_DEG - SUBTROPICAL_RIDGE_LATITUDE_DEG)
    );
  }
  return interpolatePressureBelt(
    -SUBPOLAR_LOW_HPA,
    POLAR_HIGH_HPA,
    (latitudeAbs - SUBPOLAR_LOW_LATITUDE_DEG) /
      (POLAR_HIGH_LATITUDE_DEG - SUBPOLAR_LOW_LATITUDE_DEG)
  );
}

function smoothThermalPressureTerms(
  width: number,
  height: number,
  thermalPressure: Float32Array,
  iterations: number
): void {
  if (iterations <= 0) return;
  const next = new Float32Array(width * height);

  for (let iteration = 0; iteration < iterations; iteration++) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = idx(x, y, width);
        const neighbors = getHexNeighborIndicesOddQ(x, y, width, height);
        let neighborSum = 0;
        for (const neighbor of neighbors) neighborSum += thermalPressure[neighbor] ?? 0;
        const neighborMean =
          neighbors.length > 0 ? neighborSum / neighbors.length : (thermalPressure[index] ?? 0);
        next[index] = lerp(
          thermalPressure[index] ?? 0,
          neighborMean,
          THERMAL_SMOOTHING_BLEND
        );
      }
    }
    thermalPressure.set(next);
  }
}

/**
 * Composes a circulation pressure proxy from a latitude-belt scaffold, zero-phase-mean seasonal
 * land anomaly, latitude-qualified stationary thermal anomaly, and transient weather.
 */
export function computePressureAnomalyProxy(
  width: number,
  height: number,
  latitudeByRow: ArrayLike<number>,
  surfaceTemperatureC: ArrayLike<number>,
  meanSurfaceTemperatureC: ArrayLike<number>,
  landMask: ArrayLike<number>,
  rngSeed: number,
  seasonSalt: number | undefined,
  transientPolarity: -1 | 1,
  options: Readonly<{
    scaffoldStrength: number;
    thermalAnomalyHpaPerC: number;
    stationaryThermalHpaPerC: number;
    transientScaleTiles: number;
    transientAmplitudeHpa: number;
    smoothIters: number;
  }>
): Float32Array {
  const size = width * height;
  const pressure = new Float32Array(size);
  const thermalPressure = new Float32Array(size);

  for (let y = 0; y < height; y++) {
    let rowMeanTemperatureC = 0;
    for (let x = 0; x < width; x++) {
      rowMeanTemperatureC += meanSurfaceTemperatureC[idx(x, y, width)] ?? 0;
    }
    rowMeanTemperatureC /= Math.max(1, width);

    const latitudeAbs = Math.abs(latitudeByRow[y] ?? 0);
    const organizationProgress = clamp01(
      latitudeAbs / STATIONARY_ORGANIZATION_LATITUDE_DEG
    );
    const stationaryOrganization =
      organizationProgress * organizationProgress * (3 - 2 * organizationProgress);

    for (let x = 0; x < width; x++) {
      const index = idx(x, y, width);
      const phaseTemperatureC = surfaceTemperatureC[index] ?? 0;
      const meanTemperatureC = meanSurfaceTemperatureC[index] ?? 0;
      const seasonalAnomaly =
        landMask[index] === 1
          ? -options.thermalAnomalyHpaPerC * (phaseTemperatureC - meanTemperatureC)
          : 0;
      const stationaryThermalAnomaly =
        -options.stationaryThermalHpaPerC *
        stationaryOrganization *
        (meanTemperatureC - rowMeanTemperatureC);
      thermalPressure[index] = seasonalAnomaly + stationaryThermalAnomaly;
    }
  }

  smoothThermalPressureTerms(
    width,
    height,
    thermalPressure,
    Math.max(0, options.smoothIters | 0)
  );

  const transientScaleTiles = Math.max(2, options.transientScaleTiles);
  const transientAmplitudeHpa = Math.max(0, options.transientAmplitudeHpa);
  const transientNoise = PerlinNoise.fromFullSeed(
    fnv1a32Int32Values([rngSeed, seasonSalt ?? 0])
  );

  for (let y = 0; y < height; y++) {
    const scaffold =
      Math.max(0, options.scaffoldStrength) *
      pressureScaffoldAtLatitude(latitudeByRow[y] ?? 0);
    for (let x = 0; x < width; x++) {
      const index = idx(x, y, width);
      const transient =
        transientPolarity *
        transientAmplitudeHpa *
        transientNoise.noise2D(x / transientScaleTiles, y / transientScaleTiles);
      pressure[index] = scaffold + (thermalPressure[index] ?? 0) + transient;
    }
  }

  return pressure;
}
