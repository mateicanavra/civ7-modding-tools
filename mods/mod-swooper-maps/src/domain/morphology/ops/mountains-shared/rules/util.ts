import { clamp } from "@swooper/mapgen-core/lib/math";

export function clamp01(value: number): number {
  return clamp(value, 0, 1);
}

export function clampByte(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(255, Math.round(value))) | 0;
}

