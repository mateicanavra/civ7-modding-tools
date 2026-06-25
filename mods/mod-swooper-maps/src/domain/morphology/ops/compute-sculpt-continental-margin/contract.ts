import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

import { SculptContinentalMarginConfigSchema } from "./config.js";

/**
 * Sculpts continental-margin morphology directly into ABSOLUTE elevation, datum-free,
 * BEFORE sea level is solved.
 *
 * Physics: a real continental margin is not a depth band imposed on noise — it is a
 * profile carved outward from the landmass edge: a gentle continental-shelf APRON, a
 * distinct shelf BREAK, a steeper continental SLOPE, then a flat ABYSSAL plain. We GENERATE
 * that profile here so the downstream shelf classifier can READ a real break from terrain
 * that actually has one.
 *
 * Datum-free coordinate: the margin edge (the shelf BREAK locus) is defined by CRUST TYPE
 * (continental vs oceanic), fixed and independent of the (not-yet-solved) sea level. TWO
 * multi-source BFS fields originate at that same crust-type boundary: a SHOREWARD field floods
 * continental crust (the apron), an OCEANWARD field floods oceanic crust (the slope). Each is a
 * hop-distance coordinate along which the profile is evaluated. There is NO tile-distance
 * membership cap: the apron LENGTH SCALE is a physical property of each margin (modulated by
 * margin physics), not an output target.
 *
 * Endpoints DERIVED from the hypsometric scale: breakElevation, oceanicFloor and the apron
 * shore-anchor ceiling are all functions of the existing relief datums (oceanicHeight /
 * continentalHeight / elevationScale) — passed in as INPUTS single-sourced from
 * compute-base-topography (this map's REAL relief), never duplicated as config — plus physical
 * ratios (breakCrustFraction, apronTopCrustFraction). No foreign magic depths.
 *
 * Margin physics (emergence, not tuning): active margins (convergent/transform with high
 * boundary closeness) carve NARROW, STEEP profiles; passive margins carve WIDE, GENTLE
 * aprons; older crust widens the apron (more accumulated sediment); young rifts (divergent)
 * stay narrow. These are multiplicative postures on a base length scale, like the
 * mountainRanges resolver-knob precedent.
 *
 * Apron WRITTEN-TOWARD, slope CARVED-DOWN: over submerged CONTINENTAL crust the apron target is
 * blended toward a coherent shoaling ramp (break -> shore anchor), so the gentle shelf actually
 * imprints rather than being killed by the deep oceanic base — bounded above by the anchor
 * ceiling so it stays underwater. Over OCEANIC crust the slope is written as
 * min(existingElevation, slopeTarget): it only deepens toward the real oceanic floor (never
 * below it) and preserves any pre-existing deeper structure (trenches, ridges).
 */
const ComputeSculptContinentalMarginContract = defineOp({
  kind: "compute",
  id: "morphology/compute-sculpt-continental-margin",
  input: Type.Object({
    /** Map width in tiles. */
    width: Type.Integer({ minimum: 1, description: "Map width in tiles." }),
    /** Map height in tiles. */
    height: Type.Integer({ minimum: 1, description: "Map height in tiles." }),
    /**
     * Normalized oceanic-crust baseline — SINGLE-SOURCED from compute-base-topography.oceanicHeight
     * (this map's REAL relief), not mirrored as config. The slope floor = oceanicHeight*elevationScale
     * is the real deep-ocean floor base topography already laid down; the slope descends to it and
     * NEVER deeper.
     */
    oceanicHeight: Type.Number({
      description:
        "Normalized oceanic-crust baseline (single-sourced from base-topography.oceanicHeight). Slope floor = oceanicHeight*elevationScale; never deeper.",
    }),
    /**
     * Normalized continental-crust baseline — SINGLE-SOURCED from
     * compute-base-topography.continentalHeight. With oceanicHeight defines
     * reliefSpan = continentalHeight - oceanicHeight, the relief the margin profile spans.
     */
    continentalHeight: Type.Number({
      description:
        "Normalized continental-crust baseline (single-sourced from base-topography.continentalHeight). reliefSpan = continentalHeight - oceanicHeight.",
    }),
    /**
     * Elevation quantization scale — SINGLE-SOURCED from base-topography's DEFAULT_ELEVATION_SCALE.
     * Converts normalized relief to absolute int16 engine elevation so apron/break/floor live on the
     * exact scale base topography wrote.
     */
    elevationScale: Type.Number({
      description:
        "Elevation quantization scale (single-sourced from base-topography DEFAULT_ELEVATION_SCALE).",
    }),
    /** Base elevation per tile (absolute, datum-free int16) to be sculpted. */
    elevation: TypedArraySchemas.i16({
      description: "Base elevation per tile (absolute, datum-free int16) to be sculpted.",
    }),
    /** Crust type per tile (0=oceanic, 1=continental). Datum-free margin coordinate source. */
    crustType: TypedArraySchemas.u8({
      description: "Crust type per tile (0=oceanic, 1=continental). Datum-free margin coordinate.",
    }),
    /** Crust thermal age per tile (0=new, 255=ancient). Widens passive aprons. */
    crustAge: TypedArraySchemas.u8({
      description: "Crust thermal age per tile (0=new, 255=ancient). Widens passive aprons.",
    }),
    /** Crust buoyancy proxy per tile (0..1). Higher buoyancy => wider sediment apron. */
    crustBuoyancy: TypedArraySchemas.f32({
      description: "Crust buoyancy proxy per tile (0..1). Higher buoyancy => wider sediment apron.",
    }),
    /** Boundary proximity per tile (0..255). Gates active-margin postures. */
    boundaryCloseness: TypedArraySchemas.u8({
      description: "Boundary proximity per tile (0..255). Gates active-margin postures.",
    }),
    /** Boundary type per tile (1=convergent, 2=divergent, 3=transform). */
    boundaryType: TypedArraySchemas.u8({
      description: "Boundary type per tile (1=convergent,2=divergent,3=transform).",
    }),
  }),
  output: Type.Object({
    /** Sculpted elevation per tile (absolute int16): the margin profile carved into the seafloor. */
    elevation: TypedArraySchemas.i16({
      description:
        "Sculpted elevation per tile (absolute int16): the continental-margin profile carved into the seafloor.",
    }),
    /** Hop-distance from the crust-type margin over oceanic tiles (0=first oceanic tile at the margin; 65535=unreached). */
    marginHopDistance: TypedArraySchemas.u16({
      description:
        "Datum-free hop-distance from the crust-type margin over oceanic tiles (65535=unreached). Coordinate only, not a membership cap.",
    }),
    /** Per-tile apron length scale (tiles) used to evaluate the profile; a physical property of the nearest margin. */
    apronLengthScale: TypedArraySchemas.f32({
      description:
        "Per-tile apron length scale (tiles) propagated from the nearest margin seed; a physical margin property.",
    }),
  }),
  strategies: {
    default: SculptContinentalMarginConfigSchema,
  },
});

export default ComputeSculptContinentalMarginContract;
