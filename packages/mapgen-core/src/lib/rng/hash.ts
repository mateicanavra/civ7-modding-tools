/**
 * Stable 32-bit integer mixer for spatially keyed deterministic variation.
 *
 * This is not cryptographic randomness; it is a pure hash for cases where a
 * strategy needs tile-local heterogeneity without depending on iteration order.
 */
export function hashUint32(seed: number, value: number, salt = 0): number {
  let hash =
    (seed | 0) ^
    Math.imul(value | 0, 0x9e3779b1) ^
    Math.imul(salt | 0, 0x85ebca77);
  hash ^= hash >>> 16;
  hash = Math.imul(hash, 0x7feb352d);
  hash ^= hash >>> 15;
  hash = Math.imul(hash, 0x846ca68b);
  hash ^= hash >>> 16;
  return hash >>> 0;
}

export function hashUnit(seed: number, value: number, salt = 0): number {
  return hashUint32(seed, value, salt) / 0xffffffff;
}
