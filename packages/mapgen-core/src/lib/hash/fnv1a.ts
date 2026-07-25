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
