import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

const SelectNavigableRiverTerrainInputSchema = Type.Object(
  {
    width: Type.Integer({ minimum: 1, description: "Tile grid width (columns)." }),
    height: Type.Integer({ minimum: 1, description: "Tile grid height (rows)." }),
    riverClass: TypedArraySchemas.u8({
      description: "Hydrology river class per tile (0=none, 1=minor, >=2=major/projectable).",
    }),
    discharge: TypedArraySchemas.f32({
      description: "Hydrology discharge per tile used to rank major-river endpoints and trunks.",
    }),
    flowDir: TypedArraySchemas.i32({
      description:
        "Hydrology receiver graph per tile (-1=terminal, otherwise destination tile index).",
    }),
    mouthType: TypedArraySchemas.u8({
      description:
        "Hydrology drainage mouth classification per tile; navigable terrain selection starts only from real ocean/lake/spill terminal mouths.",
    }),
    lakeMask: TypedArraySchemas.u8({
      description:
        "Hydrology lake mask; nonprojectable lake tiles may carry channel continuity, but non-lake projection blockers do not.",
    }),
    projectableLandMask: TypedArraySchemas.u8({
      description:
        "Map-rivers projection eligibility mask after engine terrain constraints (1=eligible land, 0=not projectable).",
    }),
  },
  {
    additionalProperties: false,
    description:
      "Inputs for selecting the Civ-visible navigable river terrain subset from Hydrology-authored major-river truth.",
  }
);

const SelectNavigableRiverTerrainOutputSchema = Type.Object(
  {
    riverMask: TypedArraySchemas.u8({
      description: "Selected navigable-river terrain subset (1=selected tile).",
    }),
    plannedMinorRiverMask: TypedArraySchemas.u8({
      description: "Hydrology-authored minor/headwater channel intent mask.",
    }),
    plannedMajorRiverMask: TypedArraySchemas.u8({
      description: "Hydrology-authored major/projectable channel intent mask.",
    }),
    selectedTileCount: Type.Integer({
      minimum: 0,
      description: "Count of selected navigable-river terrain tiles.",
    }),
    eligibleTileCount: Type.Integer({
      minimum: 0,
      description: "Count of projectable major-river tiles eligible for selection.",
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
      description: "Count of eligible major-river endpoints that survived endpoint admission.",
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
      description: "Selection target in tiles for the navigable-river subset.",
    }),
    targetMajorTileFraction: Type.Number({
      minimum: 0,
      maximum: 1,
      description:
        "Requested fraction of eligible major-river tiles to preserve as navigable terrain.",
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
        "Count of eligible major-river truth tiles that were not selected into the navigable subset.",
    }),
  },
  {
    additionalProperties: false,
    description:
      "Selected navigable-river terrain subset plus the supporting major/minor masks and selection metrics.",
  }
);

const SelectNavigableRiverTerrainDefaultStrategySchema = Type.Object(
  {
    endpointDischargePercentileMin: Type.Number({
      default: 0.94,
      minimum: 0,
      maximum: 1,
      description:
        "Minimum endpoint-discharge percentile admitted into navigable-trunk selection (0..1). Higher values keep only the strongest outlets.",
    }),
    targetMajorTileFraction: Type.Number({
      default: 0.28,
      minimum: 0,
      maximum: 1,
      description:
        "Target share of eligible major-river tiles to preserve as Civ-visible navigable terrain.",
    }),
  },
  {
    additionalProperties: false,
    description:
      "Default navigable-river terrain selection controls. These are internal profile parameters, not the public authoring surface.",
  }
);

const SelectNavigableRiverTerrainContract = defineOp({
  kind: "compute",
  id: "hydrology/select-navigable-river-terrain",
  input: SelectNavigableRiverTerrainInputSchema,
  output: SelectNavigableRiverTerrainOutputSchema,
  strategies: {
    default: SelectNavigableRiverTerrainDefaultStrategySchema,
  },
});

export default SelectNavigableRiverTerrainContract;
