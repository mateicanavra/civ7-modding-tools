import { clamp01, clampByte } from "./util.js";

export function encodeNormalizedToU8(valueUnit: number): number {
  return clampByte(clamp01(valueUnit) * 255);
}
