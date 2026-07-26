import { type Static, Type } from "@swooper/mapgen-core/authoring/schema";
import { ResourceSymbolSchema } from "../../../../model/atoms/resource-family.schema.js";
import { ResourceExpectedCountRangeSchema } from "./expected-count-range.schema.js";

/** Stable resource-family cohorts used by the Earthlike demand authority. */
export const ResourceExpectationGroupIdSchema = Type.Union([
  Type.Literal("aquatic-coastal-navigable-river"),
  Type.Literal("cultivated-plantation-medicinal"),
  Type.Literal("terrestrial-animal-forest-wild"),
  Type.Literal("geological-mineral-gemstone-industrial"),
]);

/** Canonical source disposition for one official resource expectation. */
export const ResourceExpectationStatusSchema = Type.Union([
  Type.Literal("expected"),
  Type.Literal("blocked"),
]);

const resourceExpectationIdentityProperties = {
  resourceType: ResourceSymbolSchema,
  groupId: ResourceExpectationGroupIdSchema,
  expectationStatus: ResourceExpectationStatusSchema,
  expectedCountRange: ResourceExpectedCountRangeSchema,
} as const;

/** Canonical identity shared by every terminal disposition of one resource expectation. */
export const ResourceExpectationIdentitySchema = Type.Object(
  resourceExpectationIdentityProperties,
  {
    additionalProperties: false,
    description:
      "One official resource expectation's canonical type, cohort, disposition, and authored range.",
  }
);

/** Canonical expected-resource identity before scenario-specific site evidence is derived. */
export const ExpectedResourceExpectationIdentitySchema = Type.Object(
  {
    ...resourceExpectationIdentityProperties,
    expectationStatus: Type.Literal("expected"),
  },
  { additionalProperties: false }
);

/** Canonical blocked-resource identity requiring no scenario-specific site evidence. */
export const BlockedResourceExpectationIdentitySchema = Type.Object(
  {
    ...resourceExpectationIdentityProperties,
    expectationStatus: Type.Literal("blocked"),
  },
  { additionalProperties: false }
);

/** Stable identity of one Earthlike resource-expectation cohort. */
export type ResourceExpectationGroupId = Static<typeof ResourceExpectationGroupIdSchema>;

/** Canonical source disposition for one official resource expectation. */
export type ResourceExpectationStatus = Static<typeof ResourceExpectationStatusSchema>;

/** Canonical identity shared by every terminal disposition of one resource expectation. */
export type ResourceExpectationIdentity = Static<typeof ResourceExpectationIdentitySchema>;
