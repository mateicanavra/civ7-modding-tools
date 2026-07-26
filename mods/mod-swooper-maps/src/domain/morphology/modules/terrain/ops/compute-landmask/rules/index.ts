/**
 * Preserves the domain requirement that craton growth has at least one tectonic era.
 */
export function assertRiftPotentialEraPresent(riftPotentialByEra: readonly Uint8Array[]): void {
  if (riftPotentialByEra.length <= 0) {
    throw new Error("[Landmask] Expected riftPotentialByEra to be a non-empty array.");
  }
}
