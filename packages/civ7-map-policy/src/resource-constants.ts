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
