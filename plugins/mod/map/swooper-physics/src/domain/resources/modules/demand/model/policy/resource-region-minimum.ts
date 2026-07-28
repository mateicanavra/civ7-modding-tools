import {
  getUnconditionalResourceRequirementBasisForAge,
  type OfficialAgeType,
  type OfficialResourceType,
} from "@civ7/map-policy";
import {
  admitPositiveResourceRegionMinimum,
  type ResourceRegionMinimumRequirement,
} from "../../../../model/atoms/region-minimum-requirement.schema.js";

/**
 * Resolves one official regional-minimum decision without flattening an unavailable engine
 * observation to false. Live answers remain exact; only unconditional static Civ7 facts may
 * admit the requirement when the runtime observation is unavailable.
 */
export function resolveResourceRegionMinimumRequirement(args: {
  resourceType: OfficialResourceType;
  age: OfficialAgeType;
  minimumPerHemisphere: number;
  observedRequiredForAge: boolean | null;
}): ResourceRegionMinimumRequirement {
  const { resourceType, age, minimumPerHemisphere, observedRequiredForAge } = args;
  if (minimumPerHemisphere === 0) {
    return { kind: "not-applicable", reason: "no-official-minimum" };
  }
  const admittedMinimum = admitPositiveResourceRegionMinimum(minimumPerHemisphere);
  if (observedRequiredForAge === true) {
    return { kind: "required", minimumPerHemisphere: admittedMinimum, source: "engine" };
  }
  if (observedRequiredForAge === false) {
    return { kind: "not-required", minimumPerHemisphere: admittedMinimum, source: "engine" };
  }

  const basis = getUnconditionalResourceRequirementBasisForAge(resourceType, age);
  if (basis.length === 0) {
    return {
      kind: "unresolved",
      minimumPerHemisphere: admittedMinimum,
      source: "engine-unavailable",
    };
  }
  return {
    kind: "required",
    minimumPerHemisphere: admittedMinimum,
    source: "static-unconditional",
    basis,
  };
}
