type FeatureIntentCoordinate = Readonly<{ x: number; y: number }>;

/**
 * Reconstructs the occupied feature tiles implied by earlier admitted intent artifacts.
 *
 * Occupancy is recipe-local coordination state, not a durable domain product. Artifact
 * admission has already proved every coordinate belongs to the current map; this projection
 * preserves the strict single-intent-per-tile law while avoiding cumulative snapshot vintages.
 */
export function deriveFeatureOccupancy(
  dimensions: Readonly<{ width: number; height: number }>,
  ...intentFamilies: readonly (readonly FeatureIntentCoordinate[])[]
): Uint8Array {
  const occupied = new Uint8Array(dimensions.width * dimensions.height);

  for (const intents of intentFamilies) {
    for (const intent of intents) {
      const index = intent.y * dimensions.width + intent.x;
      if (occupied[index] !== 0) {
        throw new Error(
          `Feature planning received multiple admitted intents for tile (${intent.x},${intent.y}).`
        );
      }
      occupied[index] = 1;
    }
  }

  return occupied;
}

/**
 * Refuses in-bounds candidates that would claim a tile reserved by an earlier intent family.
 *
 * This pre-publication guard owns only the cross-family relationship that artifact admission
 * cannot prove in isolation. The candidate artifact remains authoritative for feature family,
 * coordinate bounds, and same-family uniqueness; this function neither mutates nor re-admits
 * either input.
 */
export function assertFeatureIntentCandidatesAvailable(
  dimensions: Readonly<{ width: number; height: number }>,
  priorOccupancy: Uint8Array,
  candidates: readonly FeatureIntentCoordinate[]
): void {
  for (const candidate of candidates) {
    const { x, y } = candidate;
    if (x < 0 || x >= dimensions.width || y < 0 || y >= dimensions.height) {
      continue;
    }

    const index = y * dimensions.width + x;
    if (priorOccupancy[index] !== 0) {
      throw new Error(
        `Feature planning candidate attempted to claim an occupied tile (${x},${y}).`
      );
    }
  }
}
