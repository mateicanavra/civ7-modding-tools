import type { OfficialResourceType } from "@civ7/map-policy";
import {
  admitPositiveResourceRegionMinimum,
  type ResourceRegionMinimumRequirement,
} from "../../../../model/atoms/region-minimum-requirement.schema.js";

/**
 * Admits the official minimum for every active resource. Site selection limits its application
 * to positive engine-region slots with legal candidates, not physical connected islands.
 * Unique resources need the native shuffled two-group assignment before they can be admitted.
 */
export function resolveResourceRegionMinimumRequirement(args: {
  resourceType: OfficialResourceType;
  minimumPerLandmass: number;
  landmassUnique: boolean;
}): ResourceRegionMinimumRequirement {
  const { resourceType, minimumPerLandmass, landmassUnique } = args;
  if (landmassUnique) {
    throw new Error(
      `[resources] Cannot admit landmass-unique resource ${resourceType} before regional group assignment is supported.`
    );
  }
  if (minimumPerLandmass === 0) {
    return { kind: "not-applicable", reason: "no-official-minimum" };
  }
  return {
    kind: "required",
    minimumPerLandmass: admitPositiveResourceRegionMinimum(minimumPerLandmass),
    source: "official-resource",
  };
}
