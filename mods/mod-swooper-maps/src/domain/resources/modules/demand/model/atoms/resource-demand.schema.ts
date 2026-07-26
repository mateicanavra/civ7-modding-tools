import { type Static, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/schema";
import { ResourceRegionMinimumRequirementSchema } from "../../../../model/atoms/region-minimum-requirement.schema.js";
import {
  ResourceFamilySchema,
  ResourceSymbolSchema,
} from "../../../../model/atoms/resource-family.schema.js";
import { ResourceLaneKindSchema } from "../../../../model/atoms/resource-site-intent.schema.js";
import {
  BlockedResourceExpectationIdentitySchema,
  ExpectedResourceExpectationIdentitySchema,
} from "./resource-expectation.schema.js";

const resourceDemandProperties = {
  weight: Type.Number({
    minimum: 1,
    description: "Official resource weight used by deficit rotation.",
  }),
  regionMinimumRequirement: ResourceRegionMinimumRequirementSchema,
  legalMask: TypedArraySchemas.u8({
    cardinality: ["width", "height"],
    description: "Official Civ7 placement legality per map tile.",
  }),
  intensity: TypedArraySchemas.f32({
    cardinality: ["width", "height"],
    description: "Family habitat intensity used to weight admitted sites.",
  }),
  legalTileCount: Type.Integer({
    minimum: 0,
    description: "Tiles admitted by Civ7 placement legality after river exclusions.",
  }),
  eligibleTileCount: Type.Integer({
    minimum: 0,
    description: "Tiles admitted by both habitat policy and Civ7 placement legality.",
  }),
} as const;

const resourceHabitatEvidenceProperties = {
  habitatMask: TypedArraySchemas.u8({
    cardinality: ["width", "height"],
    description: "Canonical resource-specific habitat eligibility per map tile.",
  }),
  habitatTileCount: Type.Integer({
    minimum: 0,
    description: "Tiles admitted by the resource's canonical habitat policy.",
  }),
} as const;

/** Runtime evidence needed to select sites for one admitted resource demand. */
export const ResourceDemandSchema = Type.Object(resourceDemandProperties, {
  additionalProperties: false,
  description:
    "One admitted resource's official weight, regional policy, legality, intensity, and selectable capacity evidence.",
});

/** Site-selection row formed from one candidate identity and its admitted demand. */
export const ResourceDemandRowSchema = Type.Object(
  {
    resourceType: ResourceSymbolSchema,
    family: ResourceFamilySchema,
    laneId: Type.String(),
    laneKind: ResourceLaneKindSchema,
    targetCount: Type.Integer({ minimum: 0 }),
    minCount: Type.Integer({ minimum: 0 }),
    maxCount: Type.Integer({ minimum: 0 }),
    ...resourceHabitatEvidenceProperties,
    ...resourceDemandProperties,
  },
  {
    additionalProperties: false,
    description:
      "One admitted resource candidate projected into the flat row consumed by site selection.",
  }
);

const resourceDemandSourceProperties = {
  ...ExpectedResourceExpectationIdentitySchema.properties,
  family: ResourceFamilySchema,
  laneId: Type.String(),
  laneKind: ResourceLaneKindSchema,
  targetIntentCount: Type.Integer({
    minimum: 0,
    description: "Scenario target derived from the canonical expectation and habitat capacity.",
  }),
  ...resourceHabitatEvidenceProperties,
} as const;

/** Canonical expectation and habitat identity bound to one terminal resource candidate. */
export const ResourceDemandSourceSchema = Type.Object(resourceDemandSourceProperties, {
  additionalProperties: false,
  description:
    "One official resource expectation bound to its canonical habitat family, lane, and scenario target.",
});

const BlockedResourceDemandReasonSchema = Type.Object(
  { kind: Type.Literal("expectation-blocked") },
  { additionalProperties: false }
);

const AgeResourceDemandReasonSchema = Type.Object(
  {
    kind: Type.Literal("age-policy"),
    status: Type.Literal("deferred-future-age"),
    age: Type.String({ pattern: "^AGE_[A-Z0-9_]+$" }),
  },
  { additionalProperties: false }
);

const NoLegalSitesResourceDemandReasonSchema = Type.Object(
  {
    kind: Type.Literal("no-legal-sites"),
    legalMask: TypedArraySchemas.u8({
      cardinality: ["width", "height"],
      description: "Final Civ7 legality surface after river exclusions; every tile is excluded.",
    }),
  },
  { additionalProperties: false }
);

/** Resource candidate admitted with complete site-selection demand evidence. */
export const AdmittedResourceDemandCandidateSchema = Type.Object(
  {
    source: ResourceDemandSourceSchema,
    demand: ResourceDemandSchema,
  },
  { additionalProperties: false }
);

/** Resource candidate excluded by its canonical blocked expectation. */
export const ExpectationBlockedResourceDemandCandidateSchema = Type.Object(
  {
    source: BlockedResourceExpectationIdentitySchema,
    reason: BlockedResourceDemandReasonSchema,
  },
  { additionalProperties: false }
);

/** Expected resource candidate withheld because it belongs to a future age. */
export const AgeDeferredResourceDemandCandidateSchema = Type.Object(
  {
    source: ExpectedResourceExpectationIdentitySchema,
    reason: AgeResourceDemandReasonSchema,
  },
  { additionalProperties: false }
);

/** Expected, age-eligible resource candidate with no Civ7-legal site. */
export const NoLegalSitesResourceDemandCandidateSchema = Type.Object(
  {
    source: ResourceDemandSourceSchema,
    reason: NoLegalSitesResourceDemandReasonSchema,
  },
  { additionalProperties: false }
);

/**
 * Closed exclusion partitions keep impossible source/reason combinations unrepresentable while
 * allowing Core to admit the no-legal-sites typed array without an optional evidence field.
 */
export const ExcludedResourceDemandCandidatesSchema = Type.Object(
  {
    expectationBlocked: Type.Array(ExpectationBlockedResourceDemandCandidateSchema),
    ageDeferred: Type.Array(AgeDeferredResourceDemandCandidateSchema),
    noLegalSites: Type.Array(NoLegalSitesResourceDemandCandidateSchema),
  },
  { additionalProperties: false }
);

/** Complete admitted demand without the candidate identity carried beside it. */
export type ResourceDemand = Static<typeof ResourceDemandSchema>;

/** Admitted site-selection demand value. */
export type ResourceDemandRow = Static<typeof ResourceDemandRowSchema>;

/** Canonical expectation and habitat identity carried by one terminal resource candidate. */
export type ResourceDemandSource = Static<typeof ResourceDemandSourceSchema>;

/** Resource candidate admitted with complete site-selection demand evidence. */
export type AdmittedResourceDemandCandidate = Static<typeof AdmittedResourceDemandCandidateSchema>;

/** Resource candidate excluded by its canonical blocked expectation. */
export type ExpectationBlockedResourceDemandCandidate = Static<
  typeof ExpectationBlockedResourceDemandCandidateSchema
>;

/** Expected resource candidate withheld because it belongs to a future age. */
export type AgeDeferredResourceDemandCandidate = Static<
  typeof AgeDeferredResourceDemandCandidateSchema
>;

/** Expected, age-eligible resource candidate with no Civ7-legal site. */
export type NoLegalSitesResourceDemandCandidate = Static<
  typeof NoLegalSitesResourceDemandCandidateSchema
>;

/** Any source-matched terminal resource-demand exclusion. */
export type ExcludedResourceDemandCandidate =
  | ExpectationBlockedResourceDemandCandidate
  | AgeDeferredResourceDemandCandidate
  | NoLegalSitesResourceDemandCandidate;

/** Terminal reason carried by a source-matched resource-demand exclusion. */
export type ResourceDemandExclusionReason = ExcludedResourceDemandCandidate["reason"];
