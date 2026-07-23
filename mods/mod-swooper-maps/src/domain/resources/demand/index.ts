export { default } from "./contract.js";

export {
  EARTHLIKE_RESOURCE_EXPECTATIONS,
  type EarthlikeResourceExpectation,
  type ResourceExpectationGroupId,
  type ResourceExpectationRangeEvidence,
  type ResourceExpectationStatus,
  type ResourceExpectedCountRange,
} from "./policy/earthlike-expectations.js";
export {
  buildHabitatEligibility,
  type HabitatEligibility,
  type HabitatMaskFields,
  RESOURCE_HABITAT_SIGNALS,
  type ResourceFamilyId,
  type ResourceHabitatSignal,
} from "./policy/habitat-eligibility.js";
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
} from "./policy/initial-map-authoring.js";
