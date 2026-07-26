import {
  type ArtifactValidationIssue,
  artifactCellCount,
  defineArtifact,
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

type NaturalWonderPlacement = Readonly<{
  plannedCount: number;
  targetCount: number;
  placedCount: number;
  terrainAdjustedCount: number;
  skippedOutOfBoundsCount: number;
  rejectedCount: number;
  shortfallCount: number;
  rejectionExamples: readonly string[];
  coordinateEvidence: Static<typeof NaturalWonderPlacementCoordinateEvidenceSchema>;
  coordinateRows: readonly Static<typeof NaturalWonderPlacementCoordinateRowSchema>[];
  observedNaturalWonderPlotIndices: readonly number[];
}>;

/** Registers measured natural-wonder stamping outcomes and exact-run coordinate evidence. */
export const artifact = defineArtifact({
  name: "naturalWonderPlacement",
  id: "artifact:placement.naturalWonderPlacement",
  schema: Type.Object(
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
          "Sorted unique plots whose final readback matches a natural-wonder type attempted by this materialization, including complete footprints and rejected-mutation residue.",
      }),
    },
    {
      additionalProperties: false,
      description:
        "Measured natural-wonder stamping outcomes; legality rejections remain explicit product evidence.",
    }
  ),
  refine: (input, context): readonly ArtifactValidationIssue[] => {
    const value = input as NaturalWonderPlacement;
    const issues: ArtifactValidationIssue[] = [];
    const { plannedCount, placedCount, rejectedCount, skippedOutOfBoundsCount } = value;
    if (placedCount + rejectedCount + skippedOutOfBoundsCount !== plannedCount) {
      issues.push({
        message: `placed ${placedCount} + rejected ${rejectedCount} + skipped ${skippedOutOfBoundsCount} != planned ${plannedCount}.`,
      });
    }

    let placedRows = 0;
    let rejectedRows = 0;
    for (const row of value.coordinateRows) {
      if (row.status === "placed") placedRows += 1;
      else rejectedRows += 1;
    }
    const rejectedRowsExpected = rejectedCount + skippedOutOfBoundsCount;
    if (placedRows !== placedCount) {
      issues.push({
        message: `coordinateRows placed ${placedRows} != placedCount ${placedCount}.`,
      });
    }
    if (rejectedRows !== rejectedRowsExpected) {
      issues.push({
        message: `coordinateRows rejected ${rejectedRows} != rejected+skipped ${rejectedRowsExpected}.`,
      });
    }

    const { placed: placedDigest, rejected: rejectedDigest } = value.coordinateEvidence;
    if (placedDigest.count !== placedCount) {
      issues.push({
        message: `coordinateEvidence.placed.count ${placedDigest.count} != placedCount ${placedCount}.`,
      });
    }
    if (rejectedDigest.count !== rejectedRowsExpected) {
      issues.push({
        message: `coordinateEvidence.rejected.count ${rejectedDigest.count} != rejected+skipped ${rejectedRowsExpected}.`,
      });
    }

    const observedPlots = new Set<number>();
    const cellCount = artifactCellCount(context);
    let previousPlotIndex: number | undefined;
    for (const plotIndex of value.observedNaturalWonderPlotIndices) {
      if (cellCount !== undefined && plotIndex >= cellCount) {
        issues.push({
          message: `naturalWonderPlacement observed plot ${plotIndex} exceeds map cell count ${cellCount}.`,
        });
      }
      if (previousPlotIndex !== undefined && plotIndex <= previousPlotIndex) {
        issues.push({
          message:
            plotIndex === previousPlotIndex
              ? `naturalWonderPlacement observed plot ${plotIndex} must be unique.`
              : "naturalWonderPlacement observed plots must be sorted in ascending order.",
        });
      }
      previousPlotIndex = plotIndex;
      observedPlots.add(plotIndex);
    }
    for (const row of value.coordinateRows) {
      if (row.status === "placed" && !observedPlots.has(row.plotIndex)) {
        issues.push({
          message: `naturalWonderPlacement placed anchor ${row.plotIndex} is absent from final observed wonder plots.`,
        });
      }
    }
    return issues;
  },
});
