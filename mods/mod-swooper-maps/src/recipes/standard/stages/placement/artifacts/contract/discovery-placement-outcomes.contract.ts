import { defineArtifact, Type } from "@swooper/mapgen-core/authoring";

/** Discovery stamping outcomes (`artifact:placement.discoveryPlacementOutcomes`). One artifact per file by repo convention. */
const DiscoveryPlacementOutcomeSchema = Type.Object(
  {
    status: Type.Union([Type.Literal("placed"), Type.Literal("rejected")]),
    plotIndex: Type.Integer(),
    x: Type.Integer(),
    y: Type.Integer(),
    discoveryVisualType: Type.Integer(),
    discoveryActivationType: Type.Integer(),
    reason: Type.Optional(
      Type.Union([
        Type.Literal("out-of-bounds"),
        Type.Literal("invalid-discovery-type"),
        Type.Literal("adapter-rejected"),
      ])
    ),
  },
  { additionalProperties: false }
);

const PlacementOutcomeSummarySchema = Type.Object(
  {
    plannedCount: Type.Integer({ minimum: 0 }),
    placedCount: Type.Integer({ minimum: 0 }),
    rejectedCount: Type.Integer({ minimum: 0 }),
    mismatchCount: Type.Integer({ minimum: 0 }),
  },
  { additionalProperties: false }
);

const DiscoveryPlacementOutcomesArtifactSchema = Type.Object(
  {
    summary: PlacementOutcomeSummarySchema,
    outcomes: Type.Array(DiscoveryPlacementOutcomeSchema),
  },
  {
    additionalProperties: false,
    description:
      "Typed discovery intent reconciliation. Rejections are allowed only with named reasons.",
  }
);

export const discoveryPlacementOutcomesArtifact = defineArtifact({
  name: "discoveryPlacementOutcomes",
  id: "artifact:placement.discoveryPlacementOutcomes",
  schema: DiscoveryPlacementOutcomesArtifactSchema,
});
