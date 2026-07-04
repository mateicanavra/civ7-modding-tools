import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import { validateArtifactSchema } from "@swooper/mapgen-core/authoring/contracts";

const NavigableRiverSignalStatusSchema = Type.Union(
  [
    Type.Literal("normal-signal"),
    Type.Literal("arid-low-signal"),
    Type.Literal("closed-basin-low-signal"),
    Type.Literal("terrain-constrained-low-signal"),
  ],
  {
    description:
      "Typed interpretation of why a map may legitimately project few navigable rivers, instead of silently treating low projection as either pass or failure.",
  }
);

const MapRiversProjectedNavigableRiversArtifactSchema = Type.Object(
  {
    width: Type.Integer({ minimum: 1 }),
    height: Type.Integer({ minimum: 1 }),
    riverMask: TypedArraySchemas.u8({
      description:
        "MapGen-authored navigable-river terrain mask selected by the projection policy (1=navigable river terrain).",
    }),
    plannedMinorRiverMask: TypedArraySchemas.u8({
      description:
        "Hydrology-authored minor-river intent mask (riverClass=1). This is not promoted to navigable terrain.",
    }),
    plannedMajorRiverMask: TypedArraySchemas.u8({
      description:
        "Hydrology-authored major-river intent mask (RIVER_CLASS_MAJOR and higher), the only class eligible for navigable terrain projection.",
    }),
    selectedTileCount: Type.Integer({
      minimum: 0,
      description: "Count of MapGen-selected navigable-river terrain tiles.",
    }),
    eligibleTileCount: Type.Integer({
      minimum: 0,
      description: "Count of projectable Hydrology river tiles considered by the policy.",
    }),
    plannedMinorRiverTileCount: Type.Integer({
      minimum: 0,
      description: "Count of Hydrology minor-river intent tiles.",
    }),
    plannedMajorRiverTileCount: Type.Integer({
      minimum: 0,
      description: "Count of Hydrology major-river intent tiles.",
    }),
    candidateEndpointCount: Type.Integer({
      minimum: 0,
      description: "Count of river endpoints available for trunk selection.",
    }),
    selectedChainCount: Type.Integer({
      minimum: 0,
      description: "Count of selected navigable-river chains.",
    }),
    selectedChainLengths: TypedArraySchemas.u16({
      description:
        "Length in tiles of each selected navigable-river chain, ordered by endpoint selection priority.",
    }),
    longestSelectedChainLength: Type.Integer({
      minimum: 0,
      description: "Length in tiles of the longest selected navigable-river chain.",
    }),
    meanSelectedChainLength: Type.Number({
      minimum: 0,
      description: "Mean selected navigable-river chain length in tiles.",
    }),
    targetTileCount: Type.Integer({
      minimum: 0,
      description: "Policy target count for navigable-river terrain tiles.",
    }),
    targetMajorTileFraction: Type.Number({
      minimum: 0,
      maximum: 1,
      description:
        "Requested share of eligible major-river tiles to preserve as navigable terrain.",
    }),
    selectedEndpointDischargeFloor: Type.Number({
      minimum: 0,
      description:
        "Discharge floor imposed on candidate major-river endpoints for this selection run.",
    }),
    nonProjectableMajorTileCount: Type.Integer({
      minimum: 0,
      description:
        "Count of Hydrology major-river intent tiles blocked from navigable projection by engine terrain/materialization constraints.",
    }),
    unselectedEligibleMajorTileCount: Type.Integer({
      minimum: 0,
      description:
        "Count of eligible major-river truth tiles not selected into the navigable subset.",
    }),
    selectedEligibleMajorTileFraction: Type.Number({
      minimum: 0,
      maximum: 1,
      description: "Share of eligible major-river truth tiles selected as navigable terrain.",
    }),
    majorDurableTileCount: Type.Integer({
      minimum: 0,
      description:
        "Count of planned major-river truth tiles with at least intermittent flow permanence in Hydrology metrics.",
    }),
    majorPerennialTileCount: Type.Integer({
      minimum: 0,
      description:
        "Count of planned major-river truth tiles with perennial flow permanence in Hydrology metrics.",
    }),
    majorClosedBasinTileCount: Type.Integer({
      minimum: 0,
      description:
        "Count of planned major-river truth tiles whose Hydrology mouth classification is closed-basin.",
    }),
    majorOceanMouthTileCount: Type.Integer({
      minimum: 0,
      description:
        "Count of planned major-river truth tiles whose Hydrology mouth classification reaches ocean or spill-path ocean/lake exits.",
    }),
    projectionSignalStatus: NavigableRiverSignalStatusSchema,
    projectionSignalReason: Type.String({
      minLength: 1,
      description:
        "Human-readable explanation for the current navigable-river signal classification.",
    }),
  },
  {
    additionalProperties: false,
    description:
      "MapGen-authored navigable river projection. Downstream ecology consumes this policy artifact; engine readback remains diagnostic.",
  }
);

export const Schema = MapRiversProjectedNavigableRiversArtifactSchema;

export const artifact = defineArtifact({
  name: "projectedNavigableRivers",
  id: "artifact:map.rivers.projectedNavigableRivers",
  schema: Schema,
});

export function validate(value: unknown): readonly { message: string }[] {
  return validateArtifactSchema(Schema, value);
}
