import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Cap-free shelf classifier config.
 *
 * The continental shelf is shallow water connected to the shoreline and shallower than
 * the *shelf-break depth*. There are NO tile-distance caps: shelf extent emerges from
 * where the seafloor drops past the break depth (the depth gate) and from contiguity to
 * shore (the flood-fill). Margin type modulates the break depth as physics — active
 * (convergent/transform) margins drop off steeply (shallower break, narrower shelf);
 * passive margins are gentle (deeper break, wider shelf).
 */
export const ShelfMaskConfigSchema = Type.Object(
  {
    shallowQuantile: Type.Number({
      default: 0.6,
      minimum: 0,
      maximum: 1,
      description:
        "Quantile (0..1) of nearshore bathymetry used as the base shelf-break depth. Higher => shallower break => narrower shelf; lower => deeper => wider. Adapts the break to each map's depth scale.",
    }),
    breakDepthSampleRadius: Type.Integer({
      default: 8,
      minimum: 1,
      maximum: 64,
      description:
        "Nearshore window (tiles from coast) over which bathymetry is sampled to estimate the break depth. This bounds which tiles INFORM the cutoff (a statistical estimator window), NOT the shelf extent.",
    }),
    activeClosenessThreshold: Type.Number({
      default: 0.35,
      minimum: 0,
      maximum: 1,
      description:
        "Boundary-closeness (0..1) above which a convergent/transform margin counts as active (steeper drop-off, narrower shelf).",
    }),
    activeBreakDepthFactor: Type.Number({
      default: 0.6,
      minimum: 0,
      maximum: 4,
      description:
        "Break-depth multiplier on active margins (<1 => shallower break => narrower shelf). Margin physics, not a cap.",
    }),
    passiveBreakDepthFactor: Type.Number({
      default: 1.25,
      minimum: 0,
      maximum: 4,
      description:
        "Break-depth multiplier on passive margins (>1 => deeper break => wider shelf). Margin physics, not a cap.",
    }),
    absoluteMaxShelfDepth: Type.Integer({
      default: -30,
      minimum: -1000,
      maximum: 0,
      description:
        "Deepest (most negative, metres) the shelf-break depth may reach: a physical safety floor so the depth gate cannot flood a degenerately-flat sea. A metric depth, NOT a tile-distance cap.",
    }),
    breakDepthScale: Type.Number({
      default: 1,
      minimum: 0,
      maximum: 8,
      description:
        "Global break-depth scale set from the shelfWidth knob (narrow<1, wide>1). Authors use the knob; normalize() injects this value.",
    }),
  },
  {
    additionalProperties: false,
    description:
      "Cap-free shelf classifier: a margin-modulated bathymetric break depth (with a physical depth floor) plus connectivity to shore. No tile-distance caps.",
  }
);

/**
 * Computes a continental-shelf water mask for projecting to Civ7 TERRAIN_COAST.
 *
 * Physics: shelf = water that is (a) shallower than a margin-modulated bathymetric break
 * depth AND (b) flood-connected to the shoreline. Passive margins yield broad shelves,
 * active margins narrow ones. No tile-distance caps; the only bounds are the break depth
 * (a metric depth) and shore connectivity (BFS).
 */
const ComputeShelfMaskContract = defineOp({
  kind: "compute",
  id: "morphology/compute-shelf-mask",
  input: Type.Object({
    width: Type.Integer({ minimum: 1, description: "Map width in tiles." }),
    height: Type.Integer({ minimum: 1, description: "Map height in tiles." }),
    landMask: TypedArraySchemas.u8({ description: "Land mask per tile (1=land, 0=water)." }),
    bathymetry: TypedArraySchemas.i16({
      description:
        "Bathymetry per tile (metres): 0 on land; <=0 in water; closer to 0 is shallower.",
    }),
    distanceToCoast: TypedArraySchemas.u16({
      description:
        "Distance to coast per tile (0=coast). Used only to window the break-depth sample.",
    }),
    boundaryCloseness: TypedArraySchemas.u8({
      description: "Boundary proximity per tile (0..255).",
    }),
    boundaryType: TypedArraySchemas.u8({
      description: "Boundary type per tile (1=conv,2=div,3=trans).",
    }),
  }),
  output: Type.Object({
    shelfMask: TypedArraySchemas.u8({
      description:
        "Mask (1/0): shallow shelf water (shallower than the break depth AND connected to shore) eligible for TERRAIN_COAST.",
    }),
    activeMarginMask: TypedArraySchemas.u8({
      description:
        "Mask (1/0): water tiles treated as active margin (convergent/transform with high closeness) => shallower break depth.",
    }),
    depthGateMask: TypedArraySchemas.u8({
      description:
        "Mask (1/0): water tiles passing the per-tile depth gate (bathymetry >= break depth).",
    }),
    nearshoreCandidateMask: TypedArraySchemas.u8({
      description:
        "Mask (1/0): water tiles within breakDepthSampleRadius used to sample bathymetry for the break-depth quantile.",
    }),
    shelfBreakDepthByTile: TypedArraySchemas.i16({
      description:
        "Per-tile shelf-break depth (metres, <=0) after margin modulation; deeper (more negative) => wider local shelf.",
    }),
    shallowCutoff: Type.Number({
      description:
        "Base shelf-break depth (metres, <=0): the nearshore bathymetry quantile before margin modulation.",
    }),
  }),
  strategies: {
    default: ShelfMaskConfigSchema,
  },
});

export default ComputeShelfMaskContract;
