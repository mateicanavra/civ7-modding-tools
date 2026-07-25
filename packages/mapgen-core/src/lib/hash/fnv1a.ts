const FNV1A_32_OFFSET_BASIS = 0x811c9dc5;
const FNV1A_32_PRIME = 0x01000193;

/**
 * Hashes a JavaScript string with the 32-bit FNV-1a recurrence.
 *
 * Each UTF-16 code unit is mixed exactly once, matching the deterministic
 * evidence and salt behavior used by existing MapGen consumers. This is
 * intentionally not a UTF-8 byte hash; callers that need a portable byte
 * digest must encode their input explicitly before selecting a byte-oriented
 * hash.
 */
export function fnv1a32String(input: string): number {
  let hash = FNV1A_32_OFFSET_BASIS;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, FNV1A_32_PRIME);
  }
  return hash >>> 0;
}

/**
 * Formats {@link fnv1a32String} as the stable eight-character lowercase hex
 * representation used in MapGen evidence records.
 */
export function fnv1a32StringHex(input: string): string {
  return fnv1a32String(input).toString(16).padStart(8, "0");
}

/**
 * Hashes signed 32-bit values as four little-endian bytes with the FNV-1a recurrence.
 *
 * JavaScript numbers are interpreted through the same `ToInt32` bitwise coercion
 * used by typed-array evidence producers. Callers must quantize fractional
 * measurements before hashing when the fraction is semantically significant.
 */
export function fnv1a32Int32Values(values: Iterable<number>): number {
  let hash = FNV1A_32_OFFSET_BASIS;
  for (const value of values) {
    hash ^= value & 0xff;
    hash = Math.imul(hash, FNV1A_32_PRIME);
    hash ^= (value >> 8) & 0xff;
    hash = Math.imul(hash, FNV1A_32_PRIME);
    hash ^= (value >> 16) & 0xff;
    hash = Math.imul(hash, FNV1A_32_PRIME);
    hash ^= (value >> 24) & 0xff;
    hash = Math.imul(hash, FNV1A_32_PRIME);
  }
  return hash >>> 0;
}

/**
 * Formats {@link fnv1a32Int32Values} as a stable eight-character lowercase hex digest.
 */
export function fnv1a32Int32ValuesHex(values: Iterable<number>): string {
  return fnv1a32Int32Values(values).toString(16).padStart(8, "0");
}
