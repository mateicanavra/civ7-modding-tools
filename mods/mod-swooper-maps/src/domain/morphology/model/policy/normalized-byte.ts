import { clamp01, clampU8 } from "@swooper/mapgen-core/lib/math";

export function encodeNormalizedToU8(valueUnit: number): number {
  return clampU8(clamp01(valueUnit) * 255);
}
