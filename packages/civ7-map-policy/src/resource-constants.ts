/**
 * Source of truth for placement catalog ordering:
 * - .civ7/outputs/resources/Base/modules/base-standard/data/resources.xml
 * - .civ7/outputs/resources/Base/modules/base-standard/data/resources-v2.xml
 * - Load order from base-standard.modinfo:
 *   resources.xml then resources-v2.xml (indices 0..54)
 */

/** Sentinel value used by Civ7 map APIs to represent an empty resource slot. */
export const NO_RESOURCE = -1;

/**
 * Static catalog of placeable resource type IDs used by placement planning.
 * This catalog intentionally avoids runtime discovery from GameInfo tables.
 */
export const PLACEABLE_RESOURCE_TYPE_IDS = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26,
  27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50,
  51, 52, 53, 54,
] as const;

/**
 * Resource IDs whose official data has `AdjacentToLand=true`, but whose
 * exact-authored live Civ7 `ResourceBuilder.canHaveResource`/placement proof
 * accepted coast/marine/no-feature rows without adjacent land.
 *
 * Evidence: `studio-run-in-game-mq20rbzr-1fhc` final-surface parity proof,
 * 2026-06-06, classified in
 * `earthlike-live-feature-resource-legality-repair`.
 */
export const RESOURCE_ADJACENT_TO_LAND_RUNTIME_OPTIONAL_TYPE_IDS = [
  2, // RESOURCE_DYES
  3, // RESOURCE_FISH
  12, // RESOURCE_PEARLS
  52, // RESOURCE_COWRIE
  53, // RESOURCE_TURTLES
] as const;

export function isResourceAdjacentToLandRuntimeOptional(resourceType: number): boolean {
  return RESOURCE_ADJACENT_TO_LAND_RUNTIME_OPTIONAL_TYPE_IDS.includes(
    resourceType as (typeof RESOURCE_ADJACENT_TO_LAND_RUNTIME_OPTIONAL_TYPE_IDS)[number]
  );
}
