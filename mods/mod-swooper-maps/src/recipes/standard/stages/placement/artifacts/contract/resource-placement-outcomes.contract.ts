import { defineArtifact, Type } from "@swooper/mapgen-core/authoring/contracts";

/** Resource stamping outcomes (`artifact:placement.resourcePlacementOutcomes`). One artifact per file by repo convention. */
const ResourcePlacementOutcomeSchema = Type.Object(
  {
    status: Type.Union([
      Type.Literal("placed"),
      Type.Literal("rejected"),
      Type.Literal("mismatch"),
    ]),
    plotIndex: Type.Integer(),
    x: Type.Integer(),
    y: Type.Integer(),
    resourceType: Type.Integer(),
    observedResourceType: Type.Optional(Type.Integer()),
    reason: Type.Optional(
      Type.Union([
        Type.Literal("out-of-bounds"),
        Type.Literal("invalid-resource-type"),
        Type.Literal("cannot-have-resource"),
        Type.Literal("wrong-resource-type"),
      ])
    ),
  },
  { additionalProperties: false }
);

const ResourcePlacementReasonCountSchema = Type.Object(
  {
    reason: Type.Union([
      Type.Literal("out-of-bounds"),
      Type.Literal("invalid-resource-type"),
      Type.Literal("cannot-have-resource"),
      Type.Literal("wrong-resource-type"),
    ]),
    count: Type.Integer({ minimum: 0 }),
  },
  { additionalProperties: false }
);

const ResourcePlacementResourceSummarySchema = Type.Object(
  {
    resourceType: Type.Integer(),
    plannedCount: Type.Integer({ minimum: 0 }),
    placedCount: Type.Integer({ minimum: 0 }),
    rejectedCount: Type.Integer({ minimum: 0 }),
    mismatchCount: Type.Integer({ minimum: 0 }),
    reasons: Type.Array(ResourcePlacementReasonCountSchema),
  },
  { additionalProperties: false }
);

const ResourcePlacementCoordinateDigestSchema = Type.Object(
  {
    count: Type.Integer({ minimum: 0 }),
    hash32: Type.String({ pattern: "^[0-9a-f]{8}$" }),
  },
  { additionalProperties: false }
);

const ResourcePlacementCoordinateProofSchema = Type.Object(
  {
    version: Type.Literal(1),
    placed: ResourcePlacementCoordinateDigestSchema,
    rejected: ResourcePlacementCoordinateDigestSchema,
    mismatch: ResourcePlacementCoordinateDigestSchema,
  },
  {
    additionalProperties: false,
    description:
      "Compact deterministic coordinate identity for typed resource placement outcomes, intended for exact-run log/artifact comparison.",
  }
);

const ResourcePlacementSummarySchema = Type.Object(
  {
    plannedCount: Type.Integer({ minimum: 0 }),
    placedCount: Type.Integer({ minimum: 0 }),
    rejectedCount: Type.Integer({ minimum: 0 }),
    mismatchCount: Type.Integer({ minimum: 0 }),
    coordinateProof: ResourcePlacementCoordinateProofSchema,
    byResource: Type.Array(ResourcePlacementResourceSummarySchema),
    byReason: Type.Array(ResourcePlacementReasonCountSchema),
  },
  { additionalProperties: false }
);

const ResourceReconciliationShortfallSchema = Type.Object(
  {
    resourceType: Type.Integer({ minimum: 0 }),
    reason: Type.Union([
      Type.Literal("out-of-bounds"),
      Type.Literal("invalid-resource-type"),
      Type.Literal("cannot-have-resource"),
    ]),
    count: Type.Integer({ minimum: 0 }),
  },
  { additionalProperties: false }
);

const ResourceReconciliationSummarySchema = Type.Object(
  {
    plannedCount: Type.Integer({ minimum: 0 }),
    placedCount: Type.Integer({ minimum: 0 }),
    rejectedCount: Type.Integer({ minimum: 0 }),
    shortfalls: Type.Array(ResourceReconciliationShortfallSchema, {
      description:
        "Typed per-type engine-legality shortfalls. The plan type at the planned plot is never re-decided; rejections are recorded, not rescued.",
    }),
    byPhase: Type.Object(
      {
        rotation: Type.Integer({ minimum: 0 }),
        rangeFloor: Type.Integer({ minimum: 0 }),
        regionMinimum: Type.Integer({ minimum: 0 }),
        support: Type.Integer({
          minimum: 0,
          description:
            "Placed counts for support-pass ADDITIONS (S5). Support-driven moves keep their original planning phase; full per-adjustment provenance lives in the adjusted-plan artifact.",
        }),
      },
      {
        additionalProperties: false,
        description:
          "Placed counts by planning phase (joined from the adjusted resource plan intents).",
      }
    ),
    supportAdjustedPlacedCount: Type.Integer({
      minimum: 0,
      description:
        "How many placed outcomes came from support-adjusted intents (moves + adds), making the S5 provenance visible in the stamped outcomes (additive field).",
    }),
  },
  { additionalProperties: false }
);

const ResourcePlacementOutcomesArtifactSchema = Type.Object(
  {
    summary: ResourcePlacementSummarySchema,
    reconciliation: ResourceReconciliationSummarySchema,
    outcomes: Type.Array(ResourcePlacementOutcomeSchema),
  },
  {
    additionalProperties: false,
    description:
      "Typed resource intent reconciliation (D4): the plan is authority; the materializer stamps intents and records typed rejections. No type re-decision, no whole-map fallback; mismatches are fail-hard.",
  }
);

export const resourcePlacementOutcomesArtifact = defineArtifact({
  name: "resourcePlacementOutcomes",
  id: "artifact:placement.resourcePlacementOutcomes",
  schema: ResourcePlacementOutcomesArtifactSchema,
});
