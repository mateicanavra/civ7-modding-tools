import { Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/schema";

const SpillSchema = Type.Object(
  {
    elevation: Type.Integer({ description: "Lowest connecting saddle height in ground units." }),
    fromCell: Type.Integer({ minimum: 0, description: "Adjacent saddle endpoint inside this node." }),
    toCell: Type.Integer({ minimum: 0, description: "Adjacent saddle endpoint outside this node." }),
    targetLeafId: Type.Integer({
      minimum: 0,
      description: "Raw catchment at toCell; 0 denotes the external catchment, not a storage node.",
    }),
  },
  { additionalProperties: false }
);

const BasinNodeSchema = Type.Object(
  {
    id: Type.Integer({
      minimum: 1,
      description: "Stable node identity, equal to its array index plus one.",
    }),
    kind: Type.Union([Type.Literal("leaf"), Type.Literal("merge")]),
    floorCell: Type.Integer({
      minimum: 0,
      description: "Minimum-height descendant pit; cell index breaks ties.",
    }),
    floorElevation: Type.Integer({ description: "Lowest ground elevation in this catchment." }),
    baseElevation: Type.Integer({
      description: "Leaf floor or common child-merge height; incremental parent storage starts here.",
    }),
    parentId: Type.Integer({ minimum: -1, description: "Containing merge node, or -1 for a forest root." }),
    children: Type.Array(Type.Integer({ minimum: 1 }), {
      description:
        "Contained nodes; equal-height mergers are one multifurcation, not zero-depth binary chains.",
    }),
    spill: Type.Union([SpillSchema, Type.Null()], {
      description:
        "Geometric overflow connection; null only for an outlet-free closed root. Not a land receiver.",
    }),
    cellStart: Type.Integer({ minimum: 0, description: "Inclusive catchmentCells range start." }),
    cellEnd: Type.Integer({
      minimum: 0,
      description: "Exclusive catchmentCells range end; includes dry uplands.",
    }),
    hypsometryStart: Type.Integer({
      minimum: 0,
      description: "Inclusive shared elevation/count-bin range start.",
    }),
    hypsometryEnd: Type.Integer({
      minimum: 0,
      description: "Exclusive shared elevation/count-bin range end.",
    }),
  },
  { additionalProperties: false }
);

export const RawReceiverSchema = TypedArraySchemas.i32({
  description:
    "Adjacent nonascending raw receiver; -1 on marine water, admitted edge exits, and one pit per minimum plateau.",
});

export const DrainagePlateauIdSchema = TypedArraySchemas.i32({
  description: "Minimum cell index of the equal-height land plateau; -1 on water.",
});

export const DrainageLeafIdSchema = TypedArraySchemas.i32({
  description:
    "Raw depression leaf per tile; 0 for water or direct external drainage. Distinct from hydrography.basinId.",
});

export const BasinNodesSchema = Type.Array(BasinNodeSchema);

export const BasinRootsSchema = Type.Array(Type.Integer({ minimum: 1 }), {
  description: "Containment forest roots; roots with a spill drain externally, others remain closed.",
});

export const BasinSaddlesSchema = Type.Array(
  Type.Object(
    {
      leafA: Type.Integer({ minimum: 0 }),
      leafB: Type.Integer({ minimum: 1 }),
      cellA: Type.Integer({ minimum: 0 }),
      cellB: Type.Integer({ minimum: 0 }),
      elevation: Type.Integer(),
    },
    { additionalProperties: false }
  ),
  {
    description:
      "Lowest adjacent boundary edge per raw leaf pair, ordered by height then canonical cell pair.",
  }
);

export const BasinCatchmentCellsSchema = TypedArraySchemas.i32({
  cardinality: "constructor-only",
  description:
    "Depression-catchment land cells stored once in forest leaf order; node ranges nest without duplication.",
});

export const ExternalCatchmentCellsSchema = TypedArraySchemas.i32({
  cardinality: "constructor-only",
  description: "Land cells that drain externally without entering any raw depression; water is excluded.",
});

export const BasinHypsometrySchema = Type.Array(
  Type.Object(
    {
      elevation: Type.Integer(),
      cellCount: Type.Integer({ minimum: 1 }),
    },
    { additionalProperties: false }
  ),
  {
    description:
      "Exact unit-tile area by ground height, sorted within each leaf. A parent's range concatenates its leaf histograms.",
  }
);
