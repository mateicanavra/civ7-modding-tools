import type { SolarHarmonics } from "../../../model/atoms/solar-harmonics.schema.js";
import { dailyMeanSolarQ, requireSolarAngle } from "../../../model/policy/daily-solar.js";

/** Fixed midpoint quadrature resolution for the circular-orbit solar Fourier coefficients. */
const SOLAR_FOURIER_QUADRATURE_COUNT = 384;

/** Midpoint Fourier integration; phase zero is the northward equinox, not January 1. */
export function computeSolarHarmonics(
  latitudeDegrees: number,
  axialTiltDeg: number,
  quadratureCount = SOLAR_FOURIER_QUADRATURE_COUNT
): SolarHarmonics {
  requireSolarAngle(latitudeDegrees, "Latitude");
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
