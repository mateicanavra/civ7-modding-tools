export { default } from "./contract.js";
export {
  ResourceAffinityRuleSchema,
  type ResourceFamily,
  ResourceFamilySchema,
  ResourceLaneKindSchema,
  ResourceSitePlanSchema,
  type ResourceSymbol,
  ResourceSymbolSchema,
} from "./model/atoms/index.js";
export {
  EARTHLIKE_RESOURCE_EXPECTATIONS,
  type EarthlikeResourceExpectation,
  type ResourceExpectationGroupId,
  type ResourceExpectationRangeEvidence,
  type ResourceExpectationStatus,
  type ResourceExpectedCountRange,
} from "./modules/demand/model/policy/earthlike-expectations.js";
export {
  buildHabitatEligibility,
  type HabitatEligibility,
  type HabitatMaskFields,
  RESOURCE_HABITAT_SIGNALS,
  type ResourceFamilyId,
  type ResourceHabitatSignal,
} from "./modules/demand/model/policy/habitat-eligibility.js";
export {
  buildInitialMapResourceAuthoringPolicy,
  DEFERRED_INITIAL_MAP_RESOURCE_TYPES,
  getInitialMapResourcePolicyForType,
  INITIAL_MAP_RESOURCE_AUTHORING_AGE,
  INITIAL_MAP_RESOURCE_AUTHORING_POLICY,
  INITIAL_MAP_RESOURCE_POLICY_BY_TYPE,
  INITIAL_MAP_RESOURCE_TYPES,
  type InitialMapResourceAuthoringPolicyEntry,
  type InitialMapResourceAuthoringStatus,
  isInitialMapResourceType,
} from "./modules/demand/model/policy/initial-map-authoring.js";
export {
  HABITAT_INTENSITY_FIELD_NAMES,
  HABITAT_MASK_FIELD_NAMES,
  type HabitatFieldsOutput,
  type HabitatIntensityFieldName,
  type HabitatMaskFieldName,
} from "./modules/habitat/model/atoms/index.js";
export {
  admitPositiveResourceRegionMinimum,
  type PositiveResourceRegionMinimum,
  type ResourceRegionMinimumRequirement,
  ResourceRegionMinimumRequirementSchema,
} from "./modules/sites/model/atoms/index.js";
