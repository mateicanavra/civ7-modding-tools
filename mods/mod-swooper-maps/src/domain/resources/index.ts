export { default } from "./contract.js";
export {
  ResourceAffinityRuleSchema,
  type ResourceFamily,
  ResourceFamilySchema,
  ResourceLaneKindSchema,
  ResourcePlanIntentSchema,
  ResourcePlanPerTypeSchema,
  ResourcePlanPhaseSchema,
  ResourcePlanRegionMinimumSchema,
  ResourcePlanSettingsSchema,
  ResourcePlanShortfallSchema,
  admitPositiveResourceRegionMinimum,
  type PositiveResourceRegionMinimum,
  type ResourceRegionMinimumRequirement,
  ResourceRegionMinimumRequirementSchema,
  type ResourceSymbol,
  ResourceSymbolSchema,
} from "./model/atoms/index.js";
export {
  EARTHLIKE_RESOURCE_EXPECTATIONS,
  type EarthlikeResourceExpectation,
  type ResourceExpectationGroupId,
  type ResourceExpectationStatus,
} from "./modules/demand/index.js";
export {
  type ResourceExpectationRangeEvidence,
  type ResourceExpectedCountRange,
} from "./modules/demand/index.js";
export {
  buildHabitatEligibility,
  type HabitatEligibility,
  type HabitatMaskFields,
  RESOURCE_HABITAT_SIGNALS,
  type ResourceFamilyId,
  type ResourceHabitatSignal,
} from "./modules/demand/index.js";
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
} from "./modules/demand/index.js";
export {
  HABITAT_INTENSITY_FIELD_NAMES,
  HABITAT_MASK_FIELD_NAMES,
  type HabitatFieldsOutput,
  type HabitatIntensityFieldName,
  type HabitatMaskFieldName,
} from "./modules/habitat/index.js";
