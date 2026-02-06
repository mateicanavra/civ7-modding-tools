function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0.5;
  return Math.max(0, Math.min(1, value));
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Plate activity scales kinematics used to project motion tensors.
 *
 * Mapping: 0.0 -> 0.8, 0.5 -> 1.0, 1.0 -> 1.2 (piecewise linear).
 */
export function resolvePlateActivityKinematicsMultiplier(value: number | undefined): number {
  const v = clamp01(value ?? 0.5);
  if (v <= 0.5) return lerp(0.8, 1.0, v / 0.5);
  return lerp(1.0, 1.2, (v - 0.5) / 0.5);
}

/**
 * Plate activity shifts boundary influence distance (tiles).
 *
 * Mapping: 0.0 -> -1, 0.5 -> 0, 1.0 -> +2 (piecewise linear, rounded).
 */
export function resolvePlateActivityBoundaryDelta(value: number | undefined): number {
  const v = clamp01(value ?? 0.5);
  const delta = v <= 0.5 ? lerp(-1, 0, v / 0.5) : lerp(0, 2, (v - 0.5) / 0.5);
  return Math.round(delta);
}
