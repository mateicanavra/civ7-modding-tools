/** Test reference only: FAO-56 chapter 3, equations 21, 25 and 34, with distance factor 1. */
export const solarGeometrySource = {
  url: "https://www.fao.org/4/x0490e/x0490e07.htm",
  verifiedOn: "2026-09-29",
  bytes: 138060,
  sha256: "63d52d7c2858df69e6423312e17a631b8c6495575f8a2598915bcdf597a35cbe",
  equations: [21, 25, 34],
} as const;

const radians = Math.PI / 180;

function checkAngle(value: number, name: string) {
  if (!Number.isFinite(value) || Math.abs(value) > 90) {
    throw new RangeError(`${name} must be finite and in [-90, 90] degrees.`);
  }
}

/** Daily mean TOA flux / solar constant, not daylight-only mean or surface absorbed flux. */
export function dailyMeanSolar(latitudeDegrees: number, declinationDegrees: number) {
  checkAngle(latitudeDegrees, "latitude");
  checkAngle(declinationDegrees, "declination");
  const latitude = latitudeDegrees * radians;
  const declination = declinationDegrees * radians;
  const offset = Math.sin(latitude) * Math.sin(declination);
  const amplitude = Math.cos(latitude) * Math.cos(declination);
  // Classify sunrise by extrema of the zenith cosine, avoiding tan() at the poles.
  if (offset + amplitude <= 0) return { fluxOverSolarConstant: 0, daylightHours: 0 };
  if (offset - amplitude >= 0) {
    return { fluxOverSolarConstant: offset, daylightHours: 24 };
  }
  const sunsetAngle = Math.acos(Math.max(-1, Math.min(1, -offset / amplitude)));
  return {
    fluxOverSolarConstant:
      (sunsetAngle * offset + amplitude * Math.sin(sunsetAngle)) / Math.PI,
    daylightHours: (24 * sunsetAngle) / Math.PI,
  };
}

/** Independent midpoint quadrature of max(0, surface-normal dot sun-direction). */
export function integrateDailySolar(
  latitudeDegrees: number,
  declinationDegrees: number,
  hourSamples = 32768
) {
  checkAngle(latitudeDegrees, "latitude");
  checkAngle(declinationDegrees, "declination");
  if (!Number.isInteger(hourSamples) || hourSamples < 1) throw new RangeError("Invalid hour count.");
  const latitude = latitudeDegrees * radians;
  const declination = declinationDegrees * radians;
  const sun = [Math.cos(declination), 0, Math.sin(declination)];
  let total = 0;
  for (let i = 0; i < hourSamples; i++) {
    const angle = (2 * Math.PI * (i + 0.5)) / hourSamples;
    const normal = [
      Math.cos(latitude) * Math.cos(angle),
      Math.cos(latitude) * Math.sin(angle),
      Math.sin(latitude),
    ];
    total += Math.max(0, normal[0]! * sun[0]! + normal[1]! * sun[1]! + normal[2]! * sun[2]!);
  }
  return total / hourSamples;
}

/** Equal solid-angle latitude strips: dA is proportional to d(sin(latitude)). */
export function integrateGlobalDailySolar(declinationDegrees: number, latitudeSamples = 32768) {
  if (!Number.isInteger(latitudeSamples) || latitudeSamples < 1) throw new RangeError("Invalid latitude count.");
  let total = 0;
  for (let i = 0; i < latitudeSamples; i++) {
    const latitude = Math.asin(-1 + (2 * (i + 0.5)) / latitudeSamples) / radians;
    total += dailyMeanSolar(latitude, declinationDegrees).fluxOverSolarConstant;
  }
  return total / latitudeSamples;
}

export function seasonalPhases(count: number) {
  if (!Number.isInteger(count) || count < 4 || count % 4 !== 0) {
    throw new RangeError("Phase count must be a positive multiple of four.");
  }
  return Array.from({ length: count }, (_, index) => index / count);
}

/** Keep the existing harmonic declination schedule fixed; this is not a dated ephemeris. */
export function declinationAtPhase(phase: number) {
  return 23.44 * Math.sin(2 * Math.PI * phase);
}
