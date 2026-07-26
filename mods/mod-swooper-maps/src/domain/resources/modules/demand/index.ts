export { default } from "./contract.js";
export {
  type ResourceExpectationRangeEvidence,
  type ResourceExpectedCountRange,
} from "./model/atoms/expected-count-range.schema.js";
export {
  EARTHLIKE_RESOURCE_EXPECTATIONS,
  type EarthlikeResourceExpectation,
  type ResourceExpectationGroupId,
  type ResourceExpectationInput,
  type ResourceExpectationStatus,
  resourceExpectationsForGroup,
} from "./model/policy/earthlike-expectations.js";
export {
  buildHabitatEligibility,
  type HabitatEligibility,
  type HabitatMaskFields,
  RESOURCE_HABITAT_SIGNALS,
  type ResourceFamilyId,
  type ResourceHabitatSignal,
} from "./model/policy/habitat-eligibility.js";
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
} from "./model/policy/initial-map-authoring.js";
export { resolveResourceRegionMinimumRequirement } from "./model/policy/resource-region-minimum.js";
