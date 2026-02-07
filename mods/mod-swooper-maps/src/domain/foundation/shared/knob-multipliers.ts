import { clampFinite } from "@swooper/mapgen-core/lib/math";

function clampActivity01(value: number | undefined): number {
  return clampFinite(value ?? 0.5, 0, 1, 0.5);
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
  const v = clampActivity01(value);
  if (v <= 0.5) return lerp(0.8, 1.0, v / 0.5);
  return lerp(1.0, 1.2, (v - 0.5) / 0.5);
}

/**
 * Plate activity shifts boundary influence distance (tiles).
 *
 * Mapping: 0.0 -> -1, 0.5 -> 0, 1.0 -> +2 (piecewise linear, rounded).
 */
export function resolvePlateActivityBoundaryDelta(value: number | undefined): number {
  const v = clampActivity01(value);
  const delta = v <= 0.5 ? lerp(-1, 0, v / 0.5) : lerp(0, 2, (v - 0.5) / 0.5);
  return Math.round(delta);
}
