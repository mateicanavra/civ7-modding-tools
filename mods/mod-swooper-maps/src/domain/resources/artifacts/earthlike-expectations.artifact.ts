import type { OfficialResourceType } from "@civ7/map-policy";
import {
  defineArtifact,
  type Static,
  Type,
  validateArtifactSchema,
} from "@swooper/mapgen-core/authoring/contracts";
import { EARTHLIKE_RESOURCE_EXPECTATIONS } from "../model/data/earthlike-expectations/official-earthlike.js";
import type { EarthlikeResourceExpectationsArtifact } from "../model/data/earthlike-expectations/types.js";

/**
 * Artifact contract for the earthlike per-resource expectation corpus
 * (`artifact:resources.earthlikeExpectations`). One artifact per file by repo
 * convention.
 */
const ExpectationGroupIdSchema = Type.Union([
  Type.Literal("aquatic-coastal-navigable-river"),
  Type.Literal("cultivated-plantation-medicinal"),
  Type.Literal("terrestrial-animal-forest-wild"),
  Type.Literal("geological-mineral-gemstone-industrial"),
]);

const EvidenceStrengthSchema = Type.Union([
  Type.Literal("official"),
  Type.Literal("external"),
  Type.Literal("inferred"),
]);

const closedStringEnum = <T extends string>(values: readonly T[]) =>
  Type.Unsafe<T>({ type: "string", enum: [...values] });

const blockedExpectationResourceTypes = EARTHLIKE_RESOURCE_EXPECTATIONS.filter(
  (entry) => entry.status === "blocked"
).map((entry) => entry.resourceType) as OfficialResourceType[];
const activeExpectationResourceTypes = EARTHLIKE_RESOURCE_EXPECTATIONS.filter(
  (entry) => entry.status !== "blocked"
).map((entry) => entry.resourceType) as OfficialResourceType[];

const BlockedExpectationResourceTypeSchema = closedStringEnum(blockedExpectationResourceTypes);
const ActiveExpectationResourceTypeSchema = closedStringEnum(activeExpectationResourceTypes);

const ExpectationEvidenceSchema = Type.Object(
  {
    legality: EvidenceStrengthSchema,
    habitat: EvidenceStrengthSchema,
    range: EvidenceStrengthSchema,
  },
  { additionalProperties: false }
);

const SourceRefSchema = Type.Object(
  {
    file: Type.String(),
    table: Type.String(),
  },
  { additionalProperties: false }
);

const ResourceDistributionFactsSchema = Type.Object(
  {
    adjacentToLand: Type.Optional(Type.Boolean()),
    lakeEligible: Type.Optional(Type.Boolean()),
    staple: Type.Optional(Type.Boolean()),
    minimumPerHemisphere: Type.Optional(Type.Integer({ minimum: 0 })),
    hemisphereUnique: Type.Optional(Type.Boolean()),
    bonusResourceSlots: Type.Optional(Type.Integer({ minimum: 0 })),
    unlocksCiv: Type.Optional(Type.Boolean()),
    tradeable: Type.Optional(Type.Boolean()),
  },
  { additionalProperties: false }
);

const PlacementConstraintsSchema = Type.Object(
  {
    hasOfficialBiomeConstraints: Type.Boolean(),
    validBiomeConstraintCount: Type.Integer({ minimum: 0 }),
    sourceTables: Type.Array(SourceRefSchema),
    placementFlags: ResourceDistributionFactsSchema,
  },
  { additionalProperties: false }
);

const InitialMapAuthoringStatusSchema = Type.Union([
  Type.Literal("eligible"),
  Type.Literal("deferred-future-age"),
  Type.Literal("blocked-official"),
  Type.Literal("not-placeable"),
]);

const InitialMapAuthoringSchema = Type.Object(
  {
    authoringAge: Type.Literal("AGE_ANTIQUITY"),
    status: InitialMapAuthoringStatusSchema,
    rationale: Type.String(),
  },
  { additionalProperties: false }
);

const BlockedExpectedCountRangeSchema = Type.Object(
  {
    baseline: Type.Literal("standard-earthlike-map"),
    min: Type.Literal(0),
    target: Type.Literal(0),
    max: Type.Literal(0),
    evidence: Type.Literal("blocked"),
  },
  { additionalProperties: false }
);

const activeRange = (min: number, target: number, max: number) =>
  Type.Object(
    {
      baseline: Type.Literal("standard-earthlike-map"),
      min: Type.Literal(min),
      target: Type.Literal(target),
      max: Type.Literal(max),
      evidence: Type.Union([Type.Literal("source-backed"), Type.Literal("inference-backed")]),
    },
    { additionalProperties: false }
  );

const ActiveExpectedCountRangeSchema = Type.Union([
  activeRange(1, 2, 3),
  activeRange(1, 2, 4),
  activeRange(2, 3, 4),
  activeRange(2, 3, 5),
  activeRange(3, 4, 6),
  activeRange(3, 5, 7),
  activeRange(4, 6, 8),
  activeRange(4, 7, 10),
  activeRange(5, 7, 9),
  activeRange(5, 9, 12),
  activeRange(6, 8, 10),
  activeRange(6, 8, 12),
  activeRange(6, 9, 12),
  activeRange(8, 10, 12),
  activeRange(8, 11, 14),
  activeRange(8, 14, 20),
  activeRange(16, 18, 20),
]);

const BaseExpectationFieldsSchema = {
  resourceType: Type.String({ pattern: "^RESOURCE_" }),
  groupId: ExpectationGroupIdSchema,
  initialMapAuthoring: InitialMapAuthoringSchema,
  eligibleAges: Type.Array(Type.String({ pattern: "^AGE_" })),
  officialConstraintSummary: PlacementConstraintsSchema,
  earthlikePredicate: Type.String(),
  scarcityClass: Type.String(),
  operationObligation: Type.String(),
  statsProof: Type.String(),
  evidenceStrength: ExpectationEvidenceSchema,
  signalRequirements: Type.Array(Type.String()),
  caveats: Type.Array(Type.String()),
} as const;

const BlockedExpectationEntrySchema = Type.Object(
  {
    ...BaseExpectationFieldsSchema,
    resourceType: BlockedExpectationResourceTypeSchema,
    status: Type.Literal("blocked"),
    expectedCountRange: BlockedExpectedCountRangeSchema,
    conditionMultipliers: Type.Array(Type.Never(), { maxItems: 0 }),
  },
  { additionalProperties: false }
);

const ActiveExpectationEntrySchema = Type.Object(
  {
    ...BaseExpectationFieldsSchema,
    resourceType: ActiveExpectationResourceTypeSchema,
    status: Type.Union([Type.Literal("expected"), Type.Literal("conditional")]),
    expectedCountRange: ActiveExpectedCountRangeSchema,
    conditionMultipliers: Type.Array(Type.String()),
  },
  { additionalProperties: false }
);

const EarthlikeExpectationEntrySchema = Type.Union([
  BlockedExpectationEntrySchema,
  ActiveExpectationEntrySchema,
]);

/**
 * Closed runtime row contract for earthlike resource expectations. Its active and blocked
 * unions reject contradictory dispositions; corpus completeness and unique membership remain
 * properties of the authored data, not this schema.
 */
export const Schema = Type.Unsafe<EarthlikeResourceExpectationsArtifact>(
  Type.Object(
    {
      source: Type.Object(
        {
          authority: Type.Literal("resource-earthlike-expectations"),
          artifactId: Type.Literal("artifact:resources.earthlikeExpectations"),
          baseline: Type.Literal("standard-earthlike-map"),
          hardCountGateEvidence: Type.Literal("runtime-calibrated"),
        },
        { additionalProperties: false }
      ),
      resources: Type.Array(EarthlikeExpectationEntrySchema),
    },
    {
      additionalProperties: false,
      description:
        "Per-resource earthlike expectation contract. Ranges remain provisional until runtime-calibrated telemetry exists; runtime numeric ids are resolved by map-policy proof.",
    }
  )
);

export type Artifact = Static<typeof Schema>;

/**
 * Registers the Resources-owned expectation rows with legality, habitat, range, and initial-map
 * disposition evidence. Family planners consume this warning-only authority before site
 * selection; it neither proves corpus membership nor stamps resources.
 */
export const artifact = defineArtifact({
  name: "resourceEarthlikeExpectations",
  id: "artifact:resources.earthlikeExpectations",
  schema: Schema,
});

/**
 * Validates expectation row shapes and active/blocked disposition combinations without
 * throwing. It does not prove that official resources appear exactly once or that the corpus is
 * complete.
 */
export function validate(value: unknown): readonly { message: string }[] {
  return validateArtifactSchema(Schema, value);
}
