import {
  type ArtifactValidationContext,
  type ArtifactValidationIssue,
  artifactCellCount,
  defineArtifact,
  defineArtifactValidator,
  type Static,
  Type,
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

/** Runtime schema reconciling the natural-wonder plan with measured stamping outcomes. */
export const Schema = Type.Object(
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

/** Registers measured natural-wonder stamping outcomes and exact-run coordinate evidence. */
export const artifact = defineArtifact({
  name: "naturalWonderPlacement",
  id: "artifact:placement.naturalWonderPlacement",
  schema: Schema,
});

function issue(message: string): ArtifactValidationIssue {
  return { message };
}

/**
 * Validate hook for the natural-wonder placement outcome artifact
 * (placement-realignment S6). Cross-field invariants the schema cannot
 * express: outcome counts reconcile against the plan, coordinate-evidence
 * digests agree with the row corpus, and final occupied plots are sorted,
 * unique, and include every placed anchor.
 */

function validateLocal(
  input: unknown,
  context: ArtifactValidationContext | undefined
): ArtifactValidationIssue[] {
  const value = input as Static<typeof Schema>;
  const issues: ArtifactValidationIssue[] = [];
  const { plannedCount, placedCount, rejectedCount, skippedOutOfBoundsCount } = value;
  if (placedCount + rejectedCount + skippedOutOfBoundsCount !== plannedCount) {
    issues.push(
      issue(
        `placed ${placedCount} + rejected ${rejectedCount} + skipped ${skippedOutOfBoundsCount} != planned ${plannedCount}.`
      )
    );
  }

  const rows = value.coordinateRows;
  let placedRows = 0;
  let rejectedRows = 0;
  for (const row of rows) {
    if (row.status === "placed") placedRows += 1;
    else rejectedRows += 1;
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

  const { placed: placedDigest, rejected: rejectedDigest } = value.coordinateEvidence;
  if (placedDigest.count !== placedCount) {
    issues.push(
      issue(`coordinateEvidence.placed.count ${placedDigest.count} != placedCount ${placedCount}.`)
    );
  }
  if (rejectedDigest.count !== rejectedRowsExpected) {
    issues.push(
      issue(
        `coordinateEvidence.rejected.count ${rejectedDigest.count} != rejected+skipped ${rejectedRowsExpected}.`
      )
    );
  }

  const observedPlotIndices = value.observedNaturalWonderPlotIndices;
  const observedPlots = new Set<number>();
  const cellCount = artifactCellCount(context);
  let previousPlotIndex: number | undefined;
  for (const plotIndex of observedPlotIndices) {
    if (cellCount !== undefined && plotIndex >= cellCount) {
      issues.push(
        issue(
          `naturalWonderPlacement observed plot ${plotIndex} exceeds map cell count ${cellCount}.`
        )
      );
    }
    if (previousPlotIndex !== undefined && plotIndex <= previousPlotIndex) {
      issues.push(
        issue(
          plotIndex === previousPlotIndex
            ? `naturalWonderPlacement observed plot ${plotIndex} must be unique.`
            : "naturalWonderPlacement observed plots must be sorted in ascending order."
        )
      );
    }
    previousPlotIndex = plotIndex;
    observedPlots.add(plotIndex);
  }
  for (const row of rows) {
    if (row.status === "placed" && !observedPlots.has(row.plotIndex)) {
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
export const validate = defineArtifactValidator(artifact, validateLocal);
