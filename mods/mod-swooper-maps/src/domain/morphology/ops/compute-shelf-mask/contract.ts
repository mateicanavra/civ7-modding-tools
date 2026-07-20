import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Physical-break shelf classifier config.
 *
 * The continental shelf is the GENTLE seafloor apron between the shoreline and the shelf
 * BREAK — the knee where the seabed gradient steepens into the continental slope. The
 * upstream sculpt (compute-sculpt-continental-margin) GENERATES that real morphology into
 * absolute elevation before the datum is solved, so this classifier READS the break from the
 * terrain instead of inventing one from a depth quantile.
 *
 * Mechanism: a water tile is "pre-break" (apron) when its local seabed gradient — the steepest
 * bathymetry drop to a neighbour — is below a break-gradient threshold; it is "post-break"
 * (slope/abyss) once the gradient steepens past it. Shelf = pre-break water flood-connected to
 * shore. There is NO depth quantile, NO reference to the solved sea level (gradient is a
 * difference of bathymetry, so the datum cancels), and NO tile-distance membership cap; the
 * only bounds are the gradient steepening (read from terrain) and shore connectivity (BFS).
 */
export const ShelfMaskConfigSchema = Type.Object(
  {
    breakGradient: Type.Number({
      default: 8,
      minimum: 0.5,
      maximum: 200,
      description:
        "Seabed gradient (bathymetry units per tile-hop) at or above which the seafloor is treated as the steep continental slope (post-break), excluding it from the shelf. A difference of bathymetry, so the datum cancels — NOT a depth quantile and NOT a depth band. Read against the sculpted margin profile.",
    }),
    breakGradientScale: Type.Number({
      default: 1,
      minimum: 0,
      maximum: 8,
      description:
        "Global break-gradient scale set from the shelfWidth knob (narrow<1 => stricter gradient => narrower shelf; wide>1 => more permissive => wider). Authors use the knob; normalize() injects this value.",
    }),
    activeClosenessThreshold: Type.Number({
      default: 0.35,
      minimum: 0,
      maximum: 1,
      description:
        "Boundary-closeness (0..1) above which a convergent/transform margin counts as active. Diagnostic only: the margin posture is already sculpted into the terrain the gradient reads.",
    }),
  },
  {
    additionalProperties: false,
    description:
      "Physical-break shelf classifier: the gentle pre-break apron (seabed gradient below the break-gradient threshold) flood-connected to shore. No depth quantile, no datum reference, no tile-distance caps.",
  }
);

/**
 * Computes a continental-shelf water mask for projecting to Civ7 TERRAIN_COAST.
 *
 * Physics: shelf = water that is (a) on the GENTLE pre-break apron (local seabed gradient
 * below the break-gradient threshold) AND (b) flood-connected to the shoreline. The break is
 * READ from the sculpted margin terrain (where the seabed gradient steepens into the slope),
 * not invented from a depth quantile. Passive margins yield broad shelves, active margins
 * narrow ones — because the sculpt already carved those postures into the terrain the gradient
 * reads. No tile-distance caps and no datum reference; the only bounds are the gradient
 * steepening (terrain-read) and shore connectivity (BFS).
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
        "Bathymetry per tile in engine elevation units (elevation - seaLevel), not real metres: 0 on land; <=0 in water; closer to 0 is shallower.",
    }),
    distanceToCoast: TypedArraySchemas.u16({
      description:
        "Distance to coast per tile (0=coast). Diagnostic/connectivity aid only; never a membership cap.",
    }),
    boundaryCloseness: TypedArraySchemas.u8({
      description: "Boundary proximity per tile (0..255). Diagnostic (active-margin overlay) only.",
    }),
    boundaryType: TypedArraySchemas.u8({
      description:
        "Boundary type per tile (1=conv,2=div,3=trans). Diagnostic (active-margin overlay) only.",
    }),
  }),
  output: Type.Object({
    shelfMask: TypedArraySchemas.u8({
      description:
        "Mask (1/0): gentle pre-break shelf water (seabed gradient below the break-gradient threshold AND connected to shore) eligible for TERRAIN_COAST.",
    }),
    activeMarginMask: TypedArraySchemas.u8({
      description:
        "Mask (1/0): water tiles treated as active margin (convergent/transform with high closeness). Diagnostic overlay; the steeper drop-off is already in the terrain.",
    }),
    depthGateMask: TypedArraySchemas.u8({
      description:
        "Mask (1/0): water tiles passing the gentle-gradient gate (local seabed gradient below the break-gradient threshold = pre-break apron).",
    }),
    nearshoreCandidateMask: TypedArraySchemas.u8({
      description:
        "Mask (1/0): water tiles directly adjacent to land (the shoreline-ring shelf seeds for the connectivity flood).",
    }),
    shelfBreakDepthByTile: TypedArraySchemas.i16({
      description:
        "Per-tile bathymetry (engine elevation units, <=0) at the read shelf break: the local seabed depth where the gradient first steepens past the threshold. 0 where no break was read.",
    }),
    shallowCutoff: Type.Number({
      description:
        "Deprecated under the physical-break model (the quantile estimator was removed). Always 0; retained <=0 for output-contract stability.",
    }),
  }),
  defaultStrategy: "default",
  strategies: {
    default: ShelfMaskConfigSchema,
  },
});

export default ComputeShelfMaskContract;
