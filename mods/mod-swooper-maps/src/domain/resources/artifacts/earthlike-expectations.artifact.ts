import { defineArtifact, type Static, Type } from "@swooper/mapgen-core/authoring/contracts";
import { validateArtifactSchema } from "@swooper/mapgen-core/authoring/contracts";
import type { EarthlikeResourceExpectationsArtifact } from "../lib/earthlike-expectations/types.js";
import { PlacementConstraintsSchema } from "./corpus.artifact.js";

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

const BlockedExpectationResourceTypeSchema = Type.Union([
  Type.Literal("RESOURCE_CLOVES"),
  Type.Literal("RESOURCE_GOLD_DISTANT_LANDS"),
  Type.Literal("RESOURCE_LAPIS_LAZULI"),
  Type.Literal("RESOURCE_NICKEL"),
  Type.Literal("RESOURCE_SILVER_DISTANT_LANDS"),
]);

const ActiveExpectationResourceTypeSchema = Type.Union([
  Type.Literal("RESOURCE_COTTON"),
  Type.Literal("RESOURCE_DATES"),
  Type.Literal("RESOURCE_DYES"),
  Type.Literal("RESOURCE_FISH"),
  Type.Literal("RESOURCE_GOLD"),
  Type.Literal("RESOURCE_GYPSUM"),
  Type.Literal("RESOURCE_INCENSE"),
  Type.Literal("RESOURCE_IVORY"),
  Type.Literal("RESOURCE_JADE"),
  Type.Literal("RESOURCE_KAOLIN"),
  Type.Literal("RESOURCE_MARBLE"),
  Type.Literal("RESOURCE_PEARLS"),
  Type.Literal("RESOURCE_SILK"),
  Type.Literal("RESOURCE_SILVER"),
  Type.Literal("RESOURCE_WINE"),
  Type.Literal("RESOURCE_CAMELS"),
  Type.Literal("RESOURCE_HIDES"),
  Type.Literal("RESOURCE_HORSES"),
  Type.Literal("RESOURCE_IRON"),
  Type.Literal("RESOURCE_SALT"),
  Type.Literal("RESOURCE_WOOL"),
  Type.Literal("RESOURCE_COCOA"),
  Type.Literal("RESOURCE_FURS"),
  Type.Literal("RESOURCE_SPICES"),
  Type.Literal("RESOURCE_SUGAR"),
  Type.Literal("RESOURCE_TEA"),
  Type.Literal("RESOURCE_TRUFFLES"),
  Type.Literal("RESOURCE_NITER"),
  Type.Literal("RESOURCE_WHALES"),
  Type.Literal("RESOURCE_COFFEE"),
  Type.Literal("RESOURCE_TOBACCO"),
  Type.Literal("RESOURCE_CITRUS"),
  Type.Literal("RESOURCE_COAL"),
  Type.Literal("RESOURCE_OIL"),
  Type.Literal("RESOURCE_QUININE"),
  Type.Literal("RESOURCE_RUBBER"),
  Type.Literal("RESOURCE_MANGOS"),
  Type.Literal("RESOURCE_CLAY"),
  Type.Literal("RESOURCE_FLAX"),
  Type.Literal("RESOURCE_RUBIES"),
  Type.Literal("RESOURCE_RICE"),
  Type.Literal("RESOURCE_LIMESTONE"),
  Type.Literal("RESOURCE_TIN"),
  Type.Literal("RESOURCE_LLAMAS"),
  Type.Literal("RESOURCE_HARDWOOD"),
  Type.Literal("RESOURCE_WILD_GAME"),
  Type.Literal("RESOURCE_CRABS"),
  Type.Literal("RESOURCE_COWRIE"),
  Type.Literal("RESOURCE_TURTLES"),
  Type.Literal("RESOURCE_PITCH"),
]);

const ExpectationEvidenceSchema = Type.Object(
  {
    legality: EvidenceStrengthSchema,
    habitat: EvidenceStrengthSchema,
    range: EvidenceStrengthSchema,
  },
  { additionalProperties: false }
);

const ExpectationCorpusRefSchema = Type.Object(
  {
    resourceType: Type.String({ pattern: "^RESOURCE_" }),
    staticResourceRowSlot: Type.Integer({ minimum: 0 }),
    runtimeIdStatus: Type.Literal("unverified"),
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
  corpusRef: ExpectationCorpusRefSchema,
  initialMapAuthoring: InitialMapAuthoringSchema,
  eligibleAges: Type.Array(Type.String({ pattern: "^AGE_" })),
  officialConstraintSummary: PlacementConstraintsSchema,
  earthlikePredicate: Type.String(),
  scarcityClass: Type.String(),
  operationObligation: Type.String(),
  statsProof: Type.String(),
  evidenceStrength: ExpectationEvidenceSchema,
  proxyRequirements: Type.Array(Type.String()),
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

export const Schema = Type.Unsafe<EarthlikeResourceExpectationsArtifact>(
  Type.Object(
    {
      source: Type.Object(
        {
          authority: Type.Literal("resource-earthlike-expectations"),
          corpusArtifactId: Type.Literal("artifact:resources.corpus"),
          artifactId: Type.Literal("artifact:resources.earthlikeExpectations"),
          baseline: Type.Literal("standard-earthlike-map"),
          runtimeIdStatus: Type.Literal("unverified"),
          hardCountGateEvidence: Type.Literal("runtime-calibrated"),
        },
        { additionalProperties: false }
      ),
      resources: Type.Array(EarthlikeExpectationEntrySchema),
    },
    {
      additionalProperties: false,
      description:
        "Per-resource earthlike expectation contract. Ranges remain provisional until runtime-calibrated telemetry exists; runtime numeric ids remain unverified.",
    }
  )
);

export type Artifact = Static<typeof Schema>;

export const artifact = defineArtifact({
  name: "resourceEarthlikeExpectations",
  id: "artifact:resources.earthlikeExpectations",
  schema: Schema,
});

export function validate(value: unknown): readonly { message: string }[] {
  return validateArtifactSchema(Schema, value);
}
