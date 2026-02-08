import { clamp01, clampByte } from "./util.js";

export function encode01Byte(value01: number): number {
  return clampByte(clamp01(value01) * 255);
}

