import { snapshotRunInGameExactAuthorshipEvidence } from "@civ7/studio-contract";
import { type Static, type TSchema, Type } from "typebox";
import { Value } from "typebox/value";
import { StandardNaturalWonderPlanInputMeasurementsSchema } from "../metrics/families/placement/natural-wonder-plan-input.js";
import type {
  CompleteExactAuthorshipEvidence,
  StandardExactParityCapture,
  StandardExactProductEvidence,
} from "./types.js";

const Hash32Schema = Type.String({ pattern: "^[0-9a-f]{8}$" });
const CoordinateDigestSchema = Type.Object(
  {
    count: Type.Integer({ minimum: 0 }),
    hash32: Hash32Schema,
  },
  { additionalProperties: false }
);
const NaturalWonderPlanRowSchema = Type.Object(
  {
    plotIndex: Type.Integer({ minimum: 0 }),
    x: Type.Integer({ minimum: 0 }),
    y: Type.Integer({ minimum: 0 }),
    featureType: Type.Integer(),
    direction: Type.Integer(),
    elevation: Type.Optional(Type.Integer()),
    priorityPpm: Type.Optional(Type.Integer({ minimum: 0, maximum: 1_000_000 })),
  },
  { additionalProperties: false }
);
const ResourcePlacementRejectionRowSchema = Type.Object(
  {
    status: Type.Union([Type.Literal("rejected"), Type.Literal("mismatch")]),
    resourceType: Type.Integer(),
    resource: Type.Optional(Type.String()),
    plotIndex: Type.Integer({ minimum: 0 }),
    x: Type.Integer({ minimum: 0 }),
    y: Type.Integer({ minimum: 0 }),
    reason: Type.Optional(Type.String()),
    observedResourceType: Type.Optional(Type.Integer()),
    observedResource: Type.Optional(Type.String()),
    assignmentPhase: Type.Optional(Type.String()),
    assignmentOrder: Type.Optional(Type.Integer()),
    initialResourceType: Type.Optional(Type.Integer()),
    preferredResourceType: Type.Optional(Type.Union([Type.Integer(), Type.Null()])),
    perTypeCountBefore: Type.Optional(Type.Integer({ minimum: 0 })),
    legalPlotCountForResource: Type.Optional(Type.Integer({ minimum: 0 })),
    targetMinPerType: Type.Optional(Type.Integer({ minimum: 0 })),
  },
  { additionalProperties: false }
);

const LakeEvidenceSchema = Type.Object({
  acceptedLakeTileCount: Type.Integer({ minimum: 0 }),
  finalLakeWaterDriftCount: Type.Integer({ minimum: 0 }),
  finalLakeClassificationDriftCount: Type.Integer({ minimum: 0 }),
});
const FloodplainEvidenceSchema = Type.Object({
  stats: Type.Object({
    attempted: Type.Integer({ minimum: 0 }),
    applied: Type.Integer({ minimum: 0 }),
    rejected: Type.Integer({ minimum: 0 }),
    rejectedCanHaveFeature: Type.Integer({ minimum: 0 }),
    attemptedByFeature: Type.Optional(Type.Record(Type.String(), Type.Integer({ minimum: 0 }))),
    appliedByFeature: Type.Optional(Type.Record(Type.String(), Type.Integer({ minimum: 0 }))),
    rejectedCanHaveFeatureByFeature: Type.Optional(
      Type.Record(Type.String(), Type.Integer({ minimum: 0 }))
    ),
  }),
});
const NaturalWonderPlanEvidenceSchema = Type.Object({
  stats: Type.Object({
    version: Type.Literal(1),
    plannedCount: Type.Integer({ minimum: 0 }),
  }),
  coordinateEvidence: Type.Object({
    version: Type.Literal(1),
    planned: CoordinateDigestSchema,
  }),
  planRows: Type.Optional(Type.Array(NaturalWonderPlanRowSchema, { maxItems: 16 })),
});
const ExactLogPayloadSchema = Type.Object({ payload: Type.Unknown() });
const ResourcePlacementEvidenceSchema = Type.Object({
  stats: Type.Object({
    version: Type.Literal(1),
    plannedCount: Type.Integer({ minimum: 0 }),
    placedCount: Type.Integer({ minimum: 0 }),
    rejectedCount: Type.Integer({ minimum: 0 }),
    mismatchCount: Type.Integer({ minimum: 0 }),
    rejectionRows: Type.Optional(Type.Array(ResourcePlacementRejectionRowSchema, { maxItems: 8 })),
  }),
  coordinateEvidence: Type.Object({
    version: Type.Literal(1),
    placed: CoordinateDigestSchema,
    rejected: Type.Optional(CoordinateDigestSchema),
    mismatch: Type.Optional(CoordinateDigestSchema),
  }),
});

/** Closed result of admitting one exact-authorship packet for Standard parity. */
export type StandardExactParityAdmission =
  | Readonly<{ status: "admitted"; capture: StandardExactParityCapture }>
  | Readonly<{ status: "blocked"; unresolvedLinks: ReadonlyArray<string> }>;

/**
 * Admits the public exact-authorship packet and projects its optional
 * Standard-specific log evidence without weakening complete authorship.
 */
export function admitStandardExactParityCapture(value: unknown): StandardExactParityAdmission {
  const snapshot = snapshotRunInGameExactAuthorshipEvidence(value);
  if (snapshot === undefined) {
    return {
      status: "blocked",
      unresolvedLinks: ["exact-authorship.invalid"],
    };
  }
  if (snapshot.status !== "complete") {
    return {
      status: "blocked",
      unresolvedLinks: ["exact-authorship.complete", ...snapshot.unresolvedLinks],
    };
  }

  return {
    status: "admitted",
    capture: {
      authorship: snapshot,
      lakes: projectExactProduct(
        exactLogValue(snapshot, "placementSurfacePreparation"),
        LakeEvidenceSchema,
        "exact-authorship.log.placement-surface-preparation",
        (evidence) => ({
          acceptedLakeTileCount: evidence.acceptedLakeTileCount,
          finalLakeWaterDriftCount: evidence.finalLakeWaterDriftCount,
          finalLakeClassificationDriftCount: evidence.finalLakeClassificationDriftCount,
        })
      ),
      floodplains: projectFloodplainEvidence(
        exactLogValue(snapshot, "featureApply"),
        "exact-authorship.log.feature-apply"
      ),
      naturalWonderPlan: projectExactProduct(
        exactLogValue(snapshot, "naturalWonderPlan"),
        NaturalWonderPlanEvidenceSchema,
        "exact-authorship.log.natural-wonder-plan",
        ({ stats, coordinateEvidence, planRows }) => ({
          version: 1,
          plannedCount: stats.plannedCount,
          coordinateDigest: coordinateEvidence.planned,
          rows: (planRows ?? []).map((row) => ({
            ...row,
            elevation: row.elevation ?? null,
            priorityPpm: row.priorityPpm ?? null,
          })),
        })
      ),
      naturalWonderPlanInput: projectNaturalWonderPlanInput(
        exactLogValue(snapshot, "naturalWonderPlanInput"),
        "exact-authorship.log.natural-wonder-plan-input"
      ),
      resourcePlacement: projectResourcePlacementEvidence(
        exactLogValue(snapshot, "resourcePlacement"),
        "exact-authorship.log.resource-placement"
      ),
    },
  };
}

function projectFloodplainEvidence(
  value: unknown,
  evidenceLink: string
): StandardExactParityCapture["floodplains"] {
  if (!Value.Check(FloodplainEvidenceSchema, value)) {
    return { status: "missing", evidenceLink };
  }
  const { stats } = Value.Parse(FloodplainEvidenceSchema, value);
  const attempted = projectFloodplainCount(stats.attemptedByFeature, stats.attempted);
  const applied = projectFloodplainCount(stats.appliedByFeature, stats.applied);
  const rejected = projectFloodplainCount(
    stats.rejectedCanHaveFeatureByFeature,
    stats.rejectedCanHaveFeature
  );
  if (attempted === undefined || applied === undefined || rejected === undefined) {
    return { status: "missing", evidenceLink };
  }
  return {
    status: "present",
    value: {
      attemptedFloodplainFeatureCount: attempted,
      appliedFloodplainFeatureCount: applied,
      rejectedFloodplainFeatureCount: rejected,
    },
  };
}

function projectResourcePlacementEvidence(
  value: unknown,
  evidenceLink: string
): StandardExactParityCapture["resourcePlacement"] {
  if (!Value.Check(ResourcePlacementEvidenceSchema, value)) {
    return { status: "missing", evidenceLink };
  }
  const { stats, coordinateEvidence } = Value.Parse(ResourcePlacementEvidenceSchema, value);
  return {
    status: "present",
    value: {
      version: 1,
      placed: coordinateEvidence.placed,
      rejected:
        coordinateEvidence.rejected === undefined
          ? stats.rejectedCount === 0
            ? { status: "implicit-empty" }
            : {
                status: "missing",
                evidenceLink: `${evidenceLink}.rejected-coordinates`,
              }
          : { status: "present", digest: coordinateEvidence.rejected },
      mismatch:
        coordinateEvidence.mismatch === undefined
          ? stats.mismatchCount === 0
            ? { status: "implicit-empty" }
            : {
                status: "missing",
                evidenceLink: `${evidenceLink}.mismatch-coordinates`,
              }
          : { status: "present", digest: coordinateEvidence.mismatch },
      rejectionRows: stats.rejectionRows ?? [],
    },
  };
}

function projectNaturalWonderPlanInput(
  value: unknown,
  evidenceLink: string
): StandardExactParityCapture["naturalWonderPlanInput"] {
  if (!Value.Check(ExactLogPayloadSchema, value)) {
    return { status: "missing", evidenceLink };
  }
  const { payload } = Value.Parse(ExactLogPayloadSchema, value);
  if (!Value.Check(StandardNaturalWonderPlanInputMeasurementsSchema, payload)) {
    return { status: "missing", evidenceLink };
  }
  return {
    status: "present",
    value: Value.Parse(StandardNaturalWonderPlanInputMeasurementsSchema, payload),
  };
}

function exactLogValue(evidence: CompleteExactAuthorshipEvidence, key: string): unknown {
  return (evidence.log as Readonly<Record<string, unknown>>)[key];
}

function projectExactProduct<TSchemaValue extends TSchema, TProduct>(
  value: unknown,
  schema: TSchemaValue,
  evidenceLink: string,
  project: (value: Static<TSchemaValue>) => TProduct
): StandardExactProductEvidence<TProduct> {
  if (!Value.Check(schema, value)) {
    return { status: "missing", evidenceLink };
  }
  return {
    status: "present",
    value: project(Value.Parse(schema, value)),
  };
}

const FLOODPLAIN_FEATURE_KEY_PATTERN = /^FEATURE_[A-Z]+_FLOODPLAIN_(?:MINOR|NAVIGABLE)$/;

function projectFloodplainCount(
  counts: Readonly<Record<string, number>> | undefined,
  aggregateCount: number
): number | undefined {
  if (counts === undefined) return aggregateCount === 0 ? 0 : undefined;
  let total = 0;
  for (const [feature, count] of Object.entries(counts)) {
    if (FLOODPLAIN_FEATURE_KEY_PATTERN.test(feature)) total += count;
  }
  return total;
}
