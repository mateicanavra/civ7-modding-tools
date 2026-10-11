/** Shared circular-orbit solar geometry, used unchanged by forcing and thermal activity. */
const RADIANS_PER_DEGREE = Math.PI / 180;

export function requireSolarAngle(value: number, name: string): void {
  if (!Number.isFinite(value) || Math.abs(value) > 90) {
    throw new RangeError(`${name} must be finite and in [-90, 90] degrees.`);
  }
}

/** FAO-56 equations 21/25, normalized by the solar constant with circular distance factor 1. */
export function dailyMeanSolarQ(latitudeDegrees: number, declinationDegrees: number): number {
  requireSolarAngle(latitudeDegrees, "Latitude");
  requireSolarAngle(declinationDegrees, "Declination");
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
