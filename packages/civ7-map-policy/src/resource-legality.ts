import { CIV7_BROWSER_TABLES_V0 } from "./civ7-tables.gen.js";
import { forEachHexNeighborOddQ } from "./policy-grid.js";
import { isResourceAdjacentToLandRuntimeOptional } from "./resource-constants.js";

/**
 * Per-resource policy legality masks from the generated
 * Resource_ValidPlacements rows (placement-realignment S3: plan WITHIN policy;
 * the live engine oracle stays the reconcile-time check).
 *
 * The predicate mirrors the mock adapter's static `canHaveResource`
 * emulation exactly: a (biome, terrain, feature) triple must match one valid
 * row, and adjacent-to-land flags apply unless runtime-proof marked optional.
 */

type ResourceValidPlacementRow = readonly [
  biomeType: number,
  terrainType: number,
  featureType: number,
];

const RESOURCE_VALID_PLACEMENT_ROWS = CIV7_BROWSER_TABLES_V0.resourceValidPlacementRows as Record<
  string,
  readonly ResourceValidPlacementRow[] | undefined
>;

const RESOURCE_PLACEMENT_FLAGS = CIV7_BROWSER_TABLES_V0.resourcePlacementFlags as Record<
  string,
  { adjacentToLand: boolean; lakeEligible: boolean } | undefined
>;

export type ResourceLegalitySurface = {
  readonly width: number;
  readonly height: number;
  /** Engine-format biome index per tile. */
  readonly biomeType: Uint8Array;
  /** Engine-format terrain index per tile. */
  readonly terrainType: Uint8Array;
  /** Engine-format feature index per tile (-1 = none). */
  readonly featureType: Int16Array;
  /** Engine water reading per tile (1 = water), used for adjacent-to-land flags. */
  readonly engineWaterMask: Uint8Array;
};

export function buildResourceLegalityMask(
  surface: ResourceLegalitySurface,
  resourceTypeId: number
): Uint8Array {
  const { width, height, biomeType, terrainType, featureType, engineWaterMask } = surface;
  const size = width * height;
  const mask = new Uint8Array(size);
  const rows = RESOURCE_VALID_PLACEMENT_ROWS[String(resourceTypeId | 0)];
  if (!rows?.length) return mask;

  const flags = RESOURCE_PLACEMENT_FLAGS[String(resourceTypeId | 0)];
  const requiresAdjacentLand =
    flags?.adjacentToLand === true && !isResourceAdjacentToLandRuntimeOptional(resourceTypeId | 0);

  for (let i = 0; i < size; i++) {
    const biome = biomeType[i] ?? 0;
    const terrain = terrainType[i] ?? 0;
    const feature = featureType[i] ?? -1;
    let validSurface = false;
    for (const row of rows) {
      if (row[0] !== biome || row[1] !== terrain || row[2] !== feature) continue;
      validSurface = true;
      break;
    }
    if (!validSurface) continue;
    if (requiresAdjacentLand) {
      const y = (i / width) | 0;
      const x = i - y * width;
      let hasLandNeighbor = false;
      forEachHexNeighborOddQ(x, y, width, height, (nx, ny) => {
        const n = ny * width + nx;
        if (engineWaterMask[n] !== 1) {
          hasLandNeighbor = true;
        }
      });
      if (!hasLandNeighbor) continue;
    }
    mask[i] = 1;
  }
  return mask;
}
