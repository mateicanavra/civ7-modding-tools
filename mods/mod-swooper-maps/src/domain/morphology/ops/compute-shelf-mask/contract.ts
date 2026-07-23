import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import strategies from "./strategies/contract.js";

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
  }),
  strategies,
});

export default ComputeShelfMaskContract;
