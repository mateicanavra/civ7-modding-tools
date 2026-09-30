import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import strategyDefinition from "./strategies/physical-break-connectivity/config.js";

/**
 * Computes a continental-shelf water mask for projecting to Civ7 TERRAIN_COAST.
 *
 * Physics: shelf = water that is (a) on continental crust, (b) GENTLE (local seabed gradient
 * below the break-gradient threshold), and (c) flood-connected to eligible shoreline water.
 * Crust type distinguishes the continental apron and inland seas from a smooth oceanic abyss.
 * The shoreline ring is always included, but ineligible ring tiles never seed or bridge the flood.
 * The break is
 * READ from the sculpted margin terrain (where the seabed gradient steepens into the slope),
 * not invented from a depth quantile. Passive margins yield broad shelves, active margins
 * narrow ones — because the sculpt already carved those postures into the terrain the gradient
 * reads. No tile-distance caps and no datum reference; continental support, gradient
 * steepening (terrain-read), and shore connectivity (BFS) bound the flood.
 */
const ComputeShelfMaskContract = defineOp({
  kind: "compute",
  id: "morphology/compute-shelf-mask",
  input: Type.Object({
    width: Type.Integer({ minimum: 1, description: "Map width in tiles." }),
    height: Type.Integer({ minimum: 1, description: "Map height in tiles." }),
    landMask: TypedArraySchemas.u8({ description: "Land mask per tile (1=land, 0=water)." }),
    crustType: TypedArraySchemas.u8({
      description:
        "Foundation crust type per tile (0=oceanic, 1=continental). Only continental water can seed or carry shelf connectivity; the shoreline ring remains independent.",
    }),
    bathymetry: TypedArraySchemas.i16({
      description:
        "Bathymetry per tile in quantized normalized model relief units (elevation - seaLevel), not meters or native display units: 0 on land; <=0 in water; closer to 0 is shallower.",
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
        "Mask (1/0): shoreline-ring water plus shore-connected gentle continental water eligible for TERRAIN_COAST. Ineligible ring water never seeds or carries connectivity.",
    }),
    activeMarginMask: TypedArraySchemas.u8({
      description:
        "Mask (1/0): water tiles treated as active margin (convergent/transform with high closeness). Diagnostic overlay; the steeper drop-off is already in the terrain.",
    }),
    depthGateMask: TypedArraySchemas.u8({
      description:
        "Mask (1/0): continental water passing the gentle-gradient gate, eligible to seed or carry shelf connectivity. Does not include an unconditional shoreline override.",
    }),
    nearshoreCandidateMask: TypedArraySchemas.u8({
      description:
        "Mask (1/0): all water tiles directly adjacent to land. Only candidates also passing depthGateMask seed the connectivity flood.",
    }),
    shelfBreakDepthByTile: TypedArraySchemas.i16({
      description:
        "Per-tile bathymetry (quantized normalized model relief units, <=0) at the read shelf break: the local seabed depth where the gradient first steepens past the threshold. 0 where no break was read; not meters or native display units.",
    }),
  }),
  strategies: [strategyDefinition],
});

export default ComputeShelfMaskContract;
