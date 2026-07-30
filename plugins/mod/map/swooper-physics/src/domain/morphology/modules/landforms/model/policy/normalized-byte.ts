import { clamp01, clampU8 } from "@swooper/mapgen-core/lib/math";

/**
 * Encodes a normalized landform score for storage in artifact byte fields.
 *
 * @param valueUnit - Candidate unit score; out-of-range values are clamped before quantization.
 * @returns The score encoded in the inclusive unsigned-byte domain.
 */
export function encodeNormalizedToU8(valueUnit: number): number {
  return clampU8(clamp01(valueUnit) * 255);
}
