import { OFFICIAL_RESOURCE_BY_TYPE } from "./official-base-standard.js";
import type { OfficialAgeType, OfficialResourceType } from "./types.js";

/** Static official flags that require a resource independently of the active player roster. */
export type UnconditionalResourceRequirementBasis = "staple" | "unlocks-civ";

/** Canonical roster-independent requirement basis, including the empty not-required case. */
export type UnconditionalResourceRequirementBasisSet =
  | readonly []
  | readonly ["staple"]
  | readonly ["unlocks-civ"]
  | readonly ["staple", "unlocks-civ"];

/**
 * Returns the official roster-independent reasons a resource is required in an age.
 *
 * This deliberately does not approximate Civ7's live requirement decision: civilization and
 * leader requirements depend on the running game and must be observed through the engine adapter.
 */
export function getUnconditionalResourceRequirementBasisForAge(
  resourceType: OfficialResourceType,
  age: OfficialAgeType
): UnconditionalResourceRequirementBasisSet {
  if (!Object.hasOwn(OFFICIAL_RESOURCE_BY_TYPE, resourceType)) {
    throw new Error(`Unknown official resource type ${resourceType}.`);
  }
  const resource = OFFICIAL_RESOURCE_BY_TYPE[resourceType];
  if (!resource.validAges.includes(age)) return [];

  const flags = resource.officialPlacementConstraints.placementFlags;
  if (flags.staple === true && flags.unlocksCiv === true) return ["staple", "unlocks-civ"];
  if (flags.staple === true) return ["staple"];
  if (flags.unlocksCiv === true) return ["unlocks-civ"];
  return [];
}
