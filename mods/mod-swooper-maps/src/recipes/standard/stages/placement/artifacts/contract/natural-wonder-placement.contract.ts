import { defineArtifact, Type } from "@swooper/mapgen-core/authoring/contracts";

/** Natural-wonder stamping outcomes (`artifact:placement.naturalWonderPlacement`). One artifact per file by repo convention. */
const NaturalWonderPlacementCoordinateDigestSchema = Type.Object(
  {
    count: Type.Integer({ minimum: 0 }),
    hash32: Type.String({ pattern: "^[0-9a-f]{8}$" }),
  },
  { additionalProperties: false }
);

const NaturalWonderPlacementCoordinateProofSchema = Type.Object(
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
    description: "Bounded natural-wonder placement row identity for exact/local proof comparison.",
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
    coordinateProof: NaturalWonderPlacementCoordinateProofSchema,
    coordinateRows: Type.Array(NaturalWonderPlacementCoordinateRowSchema),
  },
  {
    additionalProperties: false,
    description:
      "Measured natural-wonder stamping result. Corrupt plans fail before this artifact, while shortfalls and legality rejections are recorded as placement outcomes.",
  }
);

export const naturalWonderPlacementArtifact = defineArtifact({
  name: "naturalWonderPlacement",
  id: "artifact:placement.naturalWonderPlacement",
  schema: NaturalWonderPlacementArtifactSchema,
});
