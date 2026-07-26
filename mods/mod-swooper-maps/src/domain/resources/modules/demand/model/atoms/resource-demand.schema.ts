import { type Static, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/schema";
import { ResourceRegionMinimumRequirementSchema } from "../../../../model/atoms/region-minimum-requirement.schema.js";
import {
  ResourceFamilySchema,
  ResourceSymbolSchema,
} from "../../../../model/atoms/resource-family.schema.js";
import { ResourceLaneKindSchema } from "../../../../model/atoms/resource-site-intent.schema.js";

/** Site-selection demand for one admitted symbolic resource. */
export const ResourceDemandRowSchema = Type.Object(
  {
    resourceType: ResourceSymbolSchema,
    family: ResourceFamilySchema,
    laneId: Type.String(),
    laneKind: ResourceLaneKindSchema,
    weight: Type.Number({
      minimum: 1,
      description: "Official resource weight used by deficit rotation.",
    }),
    targetCount: Type.Integer({ minimum: 0 }),
    minCount: Type.Integer({ minimum: 0 }),
    maxCount: Type.Integer({ minimum: 0 }),
    regionMinimumRequirement: ResourceRegionMinimumRequirementSchema,
    habitatMask: TypedArraySchemas.u8({
      cardinality: ["width", "height"],
      description: "Resource-specific habitat eligibility per map tile.",
    }),
    legalMask: TypedArraySchemas.u8({
      cardinality: ["width", "height"],
      description: "Official Civ7 placement legality per map tile.",
    }),
    intensity: TypedArraySchemas.f32({
      cardinality: ["width", "height"],
      description: "Family habitat intensity used to weight admitted sites.",
    }),
  },
  {
    additionalProperties: false,
    description:
      "One resource's admitted policy, habitat, and count demand presented to site selection.",
  }
);

/** Product evidence summarizing the admitted surface for one resource demand. */
export const ResourceDemandSummaryRowSchema = Type.Object(
  {
    resourceType: ResourceSymbolSchema,
    family: ResourceFamilySchema,
    laneId: Type.String(),
    laneKind: ResourceLaneKindSchema,
    weight: Type.Number({ minimum: 1 }),
    regionMinimumRequirement: ResourceRegionMinimumRequirementSchema,
    targetCount: Type.Integer({ minimum: 0 }),
    minCount: Type.Integer({ minimum: 0 }),
    maxCount: Type.Integer({ minimum: 0 }),
    habitatTileCount: Type.Integer({ minimum: 0 }),
    legalTileCount: Type.Integer({ minimum: 0 }),
    eligibleTileCount: Type.Integer({ minimum: 0 }),
  },
  {
    additionalProperties: false,
    description:
      "Counts and policy provenance explaining the selectable surface for one resource type.",
  }
);

/** Terminal reason a family-planner candidate did not become a site-selection demand. */
export const ResourceDemandExclusionReasonSchema = Type.Union([
  Type.Object(
    { kind: Type.Literal("outside-official-resource-corpus") },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("planner-status"),
      status: Type.Union([
        Type.Literal("blocked"),
        Type.Literal("missing-expectation"),
        Type.Literal("missing-signal"),
      ]),
    },
    { additionalProperties: false }
  ),
  Type.Object(
    {
      kind: Type.Literal("age-policy"),
      status: Type.Union([
        Type.Literal("deferred-future-age"),
        Type.Literal("blocked-official"),
        Type.Literal("not-placeable"),
        Type.Literal("unknown"),
      ]),
      age: Type.String({ pattern: "^AGE_[A-Z0-9_]+$" }),
    },
    { additionalProperties: false }
  ),
  Type.Object({ kind: Type.Literal("no-admitted-legal-tiles") }, { additionalProperties: false }),
]);

/** Symbolic resource candidate paired with its terminal exclusion evidence. */
export const ResourceDemandExclusionSchema = Type.Object(
  {
    resourceType: Type.String(),
    reason: ResourceDemandExclusionReasonSchema,
  },
  { additionalProperties: false }
);

/** Admitted site-selection demand value. */
export type ResourceDemandRow = Static<typeof ResourceDemandRowSchema>;

/** Admitted resource-demand summary value. */
export type ResourceDemandSummaryRow = Static<typeof ResourceDemandSummaryRowSchema>;

/** Admitted terminal exclusion reason. */
export type ResourceDemandExclusionReason = Static<typeof ResourceDemandExclusionReasonSchema>;

/** Admitted excluded resource candidate. */
export type ResourceDemandExclusion = Static<typeof ResourceDemandExclusionSchema>;
