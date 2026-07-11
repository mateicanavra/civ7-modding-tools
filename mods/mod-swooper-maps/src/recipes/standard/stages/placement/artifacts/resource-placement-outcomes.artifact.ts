import {
  defineArtifact,
  Type,
  validateArtifactSchema,
} from "@swooper/mapgen-core/authoring/contracts";

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

const ResourcePlacementCoordinateEvidenceSchema = Type.Object(
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
    coordinateEvidence: ResourcePlacementCoordinateEvidenceSchema,
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

export const Schema = ResourcePlacementOutcomesArtifactSchema;

export const artifact = defineArtifact({
  name: "resourcePlacementOutcomes",
  id: "artifact:placement.resourcePlacementOutcomes",
  schema: Schema,
});

function validatePayload(value: unknown): { message: string }[] {
  if (typeof value !== "object" || value === null) {
    return [{ message: "resourcePlacementOutcomes artifact must be an object." }];
  }
  const issues: { message: string }[] = [];
  const artifact = value as {
    summary?: { plannedCount?: number; placedCount?: number; mismatchCount?: number };
    reconciliation?: { plannedCount?: number; placedCount?: number; rejectedCount?: number };
    outcomes?: unknown[];
  };
  const outcomes = Array.isArray(artifact.outcomes) ? artifact.outcomes : [];
  if (artifact.summary?.plannedCount !== outcomes.length) {
    issues.push({
      message: `summary.plannedCount ${String(artifact.summary?.plannedCount)} != outcomes.length ${outcomes.length}.`,
    });
  }
  if ((artifact.summary?.mismatchCount ?? 0) !== 0) {
    issues.push({
      message: "mismatch outcomes are fail-hard and must never be published in the artifact.",
    });
  }
  const reconciliation = artifact.reconciliation;
  if (
    reconciliation &&
    (reconciliation.placedCount ?? 0) + (reconciliation.rejectedCount ?? 0) !==
      (reconciliation.plannedCount ?? 0)
  ) {
    issues.push({ message: "reconciliation placed+rejected must equal planned." });
  }
  if (reconciliation && artifact.summary?.placedCount !== reconciliation.placedCount) {
    issues.push({ message: "summary.placedCount != reconciliation.placedCount." });
  }
  return issues;
}

export function validate(value: unknown): readonly { message: string }[] {
  return Object.freeze([...validateArtifactSchema(Schema, value), ...validatePayload(value)]);
}
