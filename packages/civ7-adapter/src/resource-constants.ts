/**
 * Adapter-owned resource constants used by deterministic placement flows.
 *
 * Source of truth for placement catalog ordering:
 * - .civ7/outputs/resources/Base/modules/base-standard/data/resources.xml
 * - <Resources> row order (indices 0..40)
 */

/** Sentinel value used by Civ7 map APIs to represent an empty resource slot. */
export const NO_RESOURCE = -1;

/**
 * Static catalog of placeable resource type IDs used by placement planning.
 * This catalog intentionally avoids runtime discovery from GameInfo tables.
 */
export const PLACEABLE_RESOURCE_TYPE_IDS = [
  0, 1, 2, 3, 4, 5, 6, 7,
  8, 9, 10, 11, 12, 13, 14, 15,
  16, 17, 18, 19, 20, 21, 22, 23,
  24, 25, 26, 27, 28, 29, 30, 31,
  32, 33, 34, 35, 36, 37, 38, 39,
  40,
] as const;
