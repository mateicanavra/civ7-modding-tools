import type { ArtifactValidationContext } from "@swooper/mapgen-core/authoring/contracts";
import {
  artifactCellCount,
  defineArtifact,
  Type,
  validateArtifactSchema,
} from "@swooper/mapgen-core/authoring/contracts";

/** Natural-wonder stamping outcomes (`artifact:placement.naturalWonderPlacement`). One artifact per file by repo convention. */
const NaturalWonderPlacementCoordinateDigestSchema = Type.Object(
  {
    count: Type.Integer({ minimum: 0 }),
    hash32: Type.String({ pattern: "^[0-9a-f]{8}$" }),
  },
  { additionalProperties: false }
);

const NaturalWonderPlacementCoordinateEvidenceSchema = Type.Object(
  {
    version: Type.Literal(1),
    placed: NaturalWonderPlacementCoordinateDigestSchema,
    rejected: NaturalWonderPlacementCoordinateDigestSchema,
  },
  {
    additionalProperties: false,
    description:
      "Compact deterministic coordinate identity for natural-wonder placement outcomes, intended for exact-run log/artifact comparison.",
  }
);

const NaturalWonderFootprintReadbackSchema = Type.Object(
  {
    plotIndex: Type.Integer({ minimum: 0 }),
    observedFeatureType: Type.Integer(),
  },
  { additionalProperties: false }
);

const NaturalWonderPlacementCoordinateRowSchema = Type.Object(
  {
    status: Type.Union([Type.Literal("placed"), Type.Literal("rejected")]),
    plotIndex: Type.Integer({ minimum: 0 }),
    x: Type.Integer(),
    y: Type.Integer(),
    featureType: Type.Integer(),
    direction: Type.Integer(),
    elevation: Type.Optional(Type.Integer()),
    reason: Type.String(),
    observedFeatureType: Type.Optional(Type.Integer()),
    observedPlotIndex: Type.Optional(Type.Integer({ minimum: 0 })),
    expectedFootprintReadback: Type.Optional(Type.Array(NaturalWonderFootprintReadbackSchema)),
    expectedFootprintReadbackStatus: Type.Optional(
      Type.Union([
        Type.Literal("empty-expected-footprint"),
        Type.Literal("partial-expected-footprint"),
      ])
    ),
  },
  {
    additionalProperties: false,
    description:
      "Bounded natural-wonder placement row identity for exact/local evidence comparison.",
  }
);

const NaturalWonderPlacementArtifactSchema = Type.Object(
  {
    plannedCount: Type.Integer({ minimum: 0 }),
    targetCount: Type.Integer({ minimum: 0 }),
    placedCount: Type.Integer({ minimum: 0 }),
    terrainAdjustedCount: Type.Integer({ minimum: 0 }),
    skippedOutOfBoundsCount: Type.Integer({ minimum: 0 }),
    rejectedCount: Type.Integer({ minimum: 0 }),
    shortfallCount: Type.Integer({ minimum: 0 }),
    rejectionExamples: Type.Array(Type.String()),
    coordinateEvidence: NaturalWonderPlacementCoordinateEvidenceSchema,
    coordinateRows: Type.Array(NaturalWonderPlacementCoordinateRowSchema),
    observedNaturalWonderPlotIndices: Type.Array(Type.Integer({ minimum: 0 }), {
      description:
        "Sorted unique plots whose final feature readback matches a natural-wonder type attempted by this materialization, including complete footprints and rejected-mutation residue.",
    }),
  },
  {
    additionalProperties: false,
    description:
      "Measured natural-wonder stamping result. Corrupt plans fail before this artifact, while shortfalls and legality rejections are recorded as placement outcomes.",
  }
);

/** Runtime schema reconciling the natural-wonder plan with measured stamping outcomes. */
export const Schema = NaturalWonderPlacementArtifactSchema;

/** Registers measured natural-wonder stamping outcomes and exact-run coordinate evidence. */
export const artifact = defineArtifact({
  name: "naturalWonderPlacement",
  id: "artifact:placement.naturalWonderPlacement",
  schema: Schema,
});

type ValidationIssue = { message: string };

function issue(message: string): ValidationIssue {
  return { message };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isCount(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) >= 0;
}

/**
 * Validate hook for the natural-wonder placement outcome artifact
 * (placement-realignment S6). Cross-field invariants the schema cannot
 * express: outcome counts reconcile against the plan, coordinate-evidence
 * digests agree with the row corpus, and final occupied plots are sorted,
 * unique, and include every placed anchor.
 */

function validatePayload(
  value: unknown,
  context: ArtifactValidationContext | undefined
): ValidationIssue[] {
  if (!isRecord(value)) return [issue("naturalWonderPlacement artifact must be an object.")];
  const issues: ValidationIssue[] = [];
  for (const key of [
    "plannedCount",
    "targetCount",
    "placedCount",
    "terrainAdjustedCount",
    "skippedOutOfBoundsCount",
    "rejectedCount",
    "shortfallCount",
  ] as const) {
    if (!isCount(value[key])) {
      issues.push(issue(`naturalWonderPlacement.${key} ${String(value[key])} must be a count.`));
    }
  }
  if (issues.length > 0) return issues;

  const plannedCount = value.plannedCount as number;
  const placedCount = value.placedCount as number;
  const rejectedCount = value.rejectedCount as number;
  const skippedOutOfBoundsCount = value.skippedOutOfBoundsCount as number;
  if (placedCount + rejectedCount + skippedOutOfBoundsCount !== plannedCount) {
    issues.push(
      issue(
        `placed ${placedCount} + rejected ${rejectedCount} + skipped ${skippedOutOfBoundsCount} != planned ${plannedCount}.`
      )
    );
  }

  const rows = Array.isArray(value.coordinateRows) ? value.coordinateRows : null;
  if (!rows) return [...issues, issue("naturalWonderPlacement.coordinateRows must be an array.")];
  let placedRows = 0;
  let rejectedRows = 0;
  for (const row of rows) {
    if (!isRecord(row)) continue;
    if (row.status === "placed") placedRows += 1;
    else if (row.status === "rejected") rejectedRows += 1;
    else issues.push(issue(`naturalWonderPlacement row has untyped status ${String(row.status)}.`));
  }
  // Out-of-bounds skips are recorded as rejected coordinate rows.
  const rejectedRowsExpected = rejectedCount + skippedOutOfBoundsCount;
  if (placedRows !== placedCount) {
    issues.push(issue(`coordinateRows placed ${placedRows} != placedCount ${placedCount}.`));
  }
  if (rejectedRows !== rejectedRowsExpected) {
    issues.push(
      issue(`coordinateRows rejected ${rejectedRows} != rejected+skipped ${rejectedRowsExpected}.`)
    );
  }

  const evidence = isRecord(value.coordinateEvidence) ? value.coordinateEvidence : null;
  const placedDigest = evidence && isRecord(evidence.placed) ? evidence.placed : null;
  const rejectedDigest = evidence && isRecord(evidence.rejected) ? evidence.rejected : null;
  if (placedDigest?.count !== placedCount) {
    issues.push(
      issue(
        `coordinateEvidence.placed.count ${String(placedDigest?.count)} != placedCount ${placedCount}.`
      )
    );
  }
  if (rejectedDigest?.count !== rejectedRowsExpected) {
    issues.push(
      issue(
        `coordinateEvidence.rejected.count ${String(rejectedDigest?.count)} != rejected+skipped ${rejectedRowsExpected}.`
      )
    );
  }

  const observedPlotIndices = Array.isArray(value.observedNaturalWonderPlotIndices)
    ? value.observedNaturalWonderPlotIndices
    : null;
  if (!observedPlotIndices) {
    return [
      ...issues,
      issue("naturalWonderPlacement.observedNaturalWonderPlotIndices must be an array."),
    ];
  }
  const observedPlots = new Set<number>();
  const cellCount = artifactCellCount(context);
  let previousPlotIndex: number | undefined;
  for (const rawPlotIndex of observedPlotIndices) {
    if (!isCount(rawPlotIndex)) {
      issues.push(
        issue(
          `naturalWonderPlacement observed plot ${String(rawPlotIndex)} must be a non-negative integer.`
        )
      );
      continue;
    }
    if (cellCount !== undefined && rawPlotIndex >= cellCount) {
      issues.push(
        issue(
          `naturalWonderPlacement observed plot ${rawPlotIndex} exceeds map cell count ${cellCount}.`
        )
      );
    }
    if (previousPlotIndex !== undefined && rawPlotIndex <= previousPlotIndex) {
      issues.push(
        issue(
          rawPlotIndex === previousPlotIndex
            ? `naturalWonderPlacement observed plot ${rawPlotIndex} must be unique.`
            : "naturalWonderPlacement observed plots must be sorted in ascending order."
        )
      );
    }
    previousPlotIndex = rawPlotIndex;
    observedPlots.add(rawPlotIndex);
  }
  for (const row of rows) {
    if (
      isRecord(row) &&
      row.status === "placed" &&
      isCount(row.plotIndex) &&
      !observedPlots.has(row.plotIndex)
    ) {
      issues.push(
        issue(
          `naturalWonderPlacement placed anchor ${row.plotIndex} is absent from final observed wonder plots.`
        )
      );
    }
  }
  return issues;
}

/**
 * Reconciles outcome counts, typed rows, coordinate digests, and final observed
 * wonder occupancy; legality shortfalls remain outcomes, not failures.
 */
export function validate(
  value: unknown,
  context?: ArtifactValidationContext
): readonly { message: string }[] {
  return Object.freeze([
    ...validateArtifactSchema(Schema, value),
    ...validatePayload(value, context),
  ]);
}
