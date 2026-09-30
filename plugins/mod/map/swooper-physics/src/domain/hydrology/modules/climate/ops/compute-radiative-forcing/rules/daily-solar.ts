import type { SolarHarmonics } from "../../../model/atoms/solar-harmonics.schema.js";

/** Fixed midpoint quadrature resolution for the circular-orbit solar Fourier coefficients. */
export const SOLAR_FOURIER_QUADRATURE_COUNT = 384;
const RADIANS_PER_DEGREE = Math.PI / 180;

function requireAngle(value: number, name: string): void {
  if (!Number.isFinite(value) || Math.abs(value) > 90) {
    throw new RangeError(`${name} must be finite and in [-90, 90] degrees.`);
  }
}

/** FAO-56 equations 21/25, normalized by the solar constant with circular distance factor 1. */
export function dailyMeanSolarQ(latitudeDegrees: number, declinationDegrees: number): number {
  requireAngle(latitudeDegrees, "Latitude");
  requireAngle(declinationDegrees, "Declination");
  const latitude = latitudeDegrees * RADIANS_PER_DEGREE;
  const declination = declinationDegrees * RADIANS_PER_DEGREE;
  const offset = Math.sin(latitude) * Math.sin(declination);
  const amplitude = Math.cos(latitude) * Math.cos(declination);
  // Sunrise extrema handle polar day/night without tan(latitude)'s polar singularity.
  if (offset + amplitude <= 0) return 0;
  if (offset - amplitude >= 0) return offset;
  const sunsetAngle = Math.acos(Math.max(-1, Math.min(1, -offset / amplitude)));
  return Math.max(0, (sunsetAngle * offset + amplitude * Math.sin(sunsetAngle)) / Math.PI);
}

/** Midpoint Fourier integration; phase zero is the northward equinox, not January 1. */
export function computeSolarHarmonics(
  latitudeDegrees: number,
  axialTiltDeg: number,
  quadratureCount = SOLAR_FOURIER_QUADRATURE_COUNT
): SolarHarmonics {
  requireAngle(latitudeDegrees, "Latitude");
  if (!Number.isFinite(axialTiltDeg) || axialTiltDeg < 0 || axialTiltDeg > 90) {
    throw new RangeError("Axial tilt must be finite and in [0, 90] degrees.");
  }
  if (!Number.isInteger(quadratureCount) || quadratureCount < 8 || quadratureCount % 4 !== 0) {
    throw new RangeError(
      "Solar quadrature requires a multiple of four with at least eight phases."
    );
  }
  if (axialTiltDeg === 0) {
    return { meanQ: dailyMeanSolarQ(latitudeDegrees, 0), cos1Q: 0, sin1Q: 0, cos2Q: 0, sin2Q: 0 };
  }
  let meanQ = 0,
    cos1Q = 0,
    sin1Q = 0,
    cos2Q = 0,
    sin2Q = 0;
  for (let index = 0; index < quadratureCount; index++) {
    const phase = (2 * Math.PI * (index + 0.5)) / quadratureCount;
    const q = dailyMeanSolarQ(latitudeDegrees, axialTiltDeg * Math.sin(phase));
    meanQ += q;
    cos1Q += q * Math.cos(phase);
    sin1Q += q * Math.sin(phase);
    cos2Q += q * Math.cos(2 * phase);
    sin2Q += q * Math.sin(2 * phase);
  }
  return {
    meanQ: meanQ / quadratureCount,
    cos1Q: (2 * cos1Q) / quadratureCount,
    sin1Q: (2 * sin1Q) / quadratureCount,
    cos2Q: (2 * cos2Q) / quadratureCount,
    sin2Q: (2 * sin2Q) / quadratureCount,
  };
}
