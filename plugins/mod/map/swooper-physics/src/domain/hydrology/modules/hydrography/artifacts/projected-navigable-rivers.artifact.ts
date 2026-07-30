import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

/** Publishes Hydrology's immutable Civ7-projectable river intent for downstream map products. */
export const artifact = defineArtifact({
  name: "projectedNavigableRivers",
  id: "artifact:map.rivers.projectedNavigableRivers",
  schema: Type.Object(
    {
      width: Type.Integer({ minimum: 1 }),
      height: Type.Integer({ minimum: 1 }),
      riverMask: TypedArraySchemas.u8({
        cardinality: "map-grid",
        description:
          "Hydrology-selected navigable-river terrain intent (1=navigable river terrain).",
      }),
      plannedMinorRiverMask: TypedArraySchemas.u8({
        cardinality: "map-grid",
        description:
          "Hydrology minor-river intent (riverClass=1), retained without promotion to navigable terrain.",
      }),
      plannedMajorRiverMask: TypedArraySchemas.u8({
        cardinality: "map-grid",
        description:
          "Hydrology major-river intent (riverClass>=2), the only class eligible for navigable projection.",
      }),
      selectedTileCount: Type.Integer({
        minimum: 0,
        description: "Count of selected navigable-river terrain tiles.",
      }),
      eligibleTileCount: Type.Integer({
        minimum: 0,
        description: "Count of engine-projectable major-river tiles considered by selection.",
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
        description: "Count of terminal river endpoints admitted for trunk selection.",
      }),
      selectedChainCount: Type.Integer({
        minimum: 0,
        description: "Count of selected navigable-river chains.",
      }),
      selectedChainLengths: TypedArraySchemas.u16({
        cardinality: ["selectedChainCount"],
        description: "Tile lengths of selected river chains in endpoint-selection priority order.",
      }),
      longestSelectedChainLength: Type.Integer({
        minimum: 0,
        description: "Tile length of the longest selected river chain.",
      }),
      meanSelectedChainLength: Type.Number({
        minimum: 0,
        description: "Mean selected river-chain length in tiles.",
      }),
      targetTileCount: Type.Integer({
        minimum: 0,
        description: "Policy target for selected navigable-river tiles.",
      }),
      targetMajorTileFraction: Type.Number({
        minimum: 0,
        maximum: 1,
        description: "Requested share of eligible major-river tiles retained as navigable.",
      }),
      selectedEndpointDischargeFloor: Type.Number({
        minimum: 0,
        description: "Discharge floor applied to candidate river endpoints.",
      }),
      nonProjectableMajorTileCount: Type.Integer({
        minimum: 0,
        description: "Major-river tiles excluded by current engine terrain constraints.",
      }),
      unselectedEligibleMajorTileCount: Type.Integer({
        minimum: 0,
        description: "Eligible major-river tiles outside the selected subset.",
      }),
      selectedEligibleMajorTileFraction: Type.Number({
        minimum: 0,
        maximum: 1,
        description: "Share of eligible major-river tiles selected as navigable.",
      }),
      majorDurableTileCount: Type.Integer({
        minimum: 0,
        description: "Selected-source major-river tiles with intermittent or perennial flow.",
      }),
      majorPerennialTileCount: Type.Integer({
        minimum: 0,
        description: "Selected-source major-river tiles with perennial flow.",
      }),
      majorClosedBasinTileCount: Type.Integer({
        minimum: 0,
        description: "Major-river tiles draining to closed basins.",
      }),
      majorOceanMouthTileCount: Type.Integer({
        minimum: 0,
        description: "Major-river tiles connected to ocean or spill-path termini.",
      }),
      projectionSignalStatus: Type.Union(
        [
          Type.Literal("normal-signal"),
          Type.Literal("arid-low-signal"),
          Type.Literal("closed-basin-low-signal"),
          Type.Literal("terrain-constrained-low-signal"),
        ],
        {
          description:
            "Interpretation of whether sparse navigable coverage is normal, arid, closed-basin, or terrain-constrained.",
        }
      ),
      projectionSignalReason: Type.String({
        minLength: 1,
        description: "Explanation for the current navigable-river signal classification.",
      }),
    },
    {
      additionalProperties: false,
      description:
        "Hydrology's immutable Civ7-projectable river intent; mutable engine readback remains observation.",
    }
  ),
});
