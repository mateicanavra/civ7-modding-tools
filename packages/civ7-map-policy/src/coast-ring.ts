import { WATER_CLASS_COAST, WATER_CLASS_LAND, WATER_CLASS_OCEAN } from "./coast-classification.js";
import { forEachHexNeighborOddQ } from "./policy-grid.js";

/**
 * Coast-ring policy evidence.
 *
 * This is the minimal Civ7 gameplay/engine guarantee the retired coastBufferTiles
 * distance band conflated with cosmetic coast width:
 * - the live engine renders land bordering deep ocean as floating cliff plateaus;
 * - coastal settlement and many coast-adjacent content rules require a land tile to
 *   actually touch a coast tile.
 *
 * It is NOT a coast-width control. Coast width is the physically-derived continental
 * shelf (see compute-shelf-mask); this only guarantees the shoreline ring exists.
 */
export const CIV7_COAST_RING_POLICY_V0 = {
  version: 0,
  source: ["Base/modules/base-standard/maps/elevation-terrain-generator.js"],
  rationale:
    "Civ7 requires every land tile to border coast (no land against deep ocean). MapGen stamps a single deterministic coast ring around land using engine odd-R adjacency, independent of the physically-derived shelf that sets coast width.",
} as const;

export type CoastRingPolicyResult = Readonly<{
  waterClass: Uint8Array;
  coastRingMask: Uint8Array;
  promotedOceanToCoast: number;
}>;

/**
 * Promotes every OCEAN tile directly adjacent to land to COAST, using the engine's
 * odd-R adjacency. Land adjacency is read against the ORIGINAL classification, so a
 * freshly promoted ring tile cannot chain a second ring outward — this is exactly a
 * one-tile shoreline ring, never a distance band.
 *
 * Source coast (shelf ∪ shoreline metrics) normally already covers the ring; this
 * heals the residue, e.g. ocean around island peaks injected after coastline metrics.
 */
export function applyCiv7CoastRingPolicy(params: {
  width: number;
  height: number;
  waterClass: Uint8Array;
}): CoastRingPolicyResult {
  const width = Math.max(0, params.width | 0);
  const height = Math.max(0, params.height | 0);
  const size = width * height;
  if (params.waterClass.length !== size) {
    throw new Error(
      `[coastRing] waterClass length ${params.waterClass.length} does not match ${size}.`
    );
  }

  const original = params.waterClass;
  const waterClass = new Uint8Array(original);
  const coastRingMask = new Uint8Array(size);
  let promotedOceanToCoast = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if ((waterClass[idx] | 0) !== WATER_CLASS_OCEAN) continue;
      let adjacentToLand = false;
      forEachHexNeighborOddQ(x, y, width, height, (nx, ny) => {
        if (adjacentToLand) return;
        if ((original[ny * width + nx] | 0) === WATER_CLASS_LAND) adjacentToLand = true;
      });
      if (!adjacentToLand) continue;
      waterClass[idx] = WATER_CLASS_COAST;
      coastRingMask[idx] = 1;
      promotedOceanToCoast += 1;
    }
  }

  return { waterClass, coastRingMask, promotedOceanToCoast };
}
