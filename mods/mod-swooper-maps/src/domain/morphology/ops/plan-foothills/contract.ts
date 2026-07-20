import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Mountain-family placement tuning driven by foundation physics.
 *
 * This intentionally remains one full family schema for both ridge and foothill
 * ops. The invariant is that mountains and hills are two classes from one
 * terrain-classification posture; authors must not tune a separate hill world
 * beside a separate mountain world. The morphology-features step enforces equal
 * ridge/foothill selections before applying semantic knobs.
 */
const MountainsConfigSchema = Type.Object(
  {
    /**
     * Global scale for tectonic effects.
     * Primary dial for overall mountain prevalence across the map.
     */
    tectonicIntensity: Type.Number({
      description: "Controls global tectonic effects and overall mountain terrain prevalence.",
      default: 1.0,
      minimum: 0,
      maximum: 10,
    }),
    /**
     * Minimum driver byte (0..255) required for mountains/hills to form.
     *
     * This intentionally mirrors the `morphology-driver-correlation` invariant's `DRIVER_SIGNAL_THRESHOLD`
     * so we don't produce mountains from pure noise or low-intensity residual fields.
     */
    driverSignalByteMin: Type.Number({
      description:
        "Controls minimum driver byte required for mountain/hill terrain to form (0..255).",
      default: 30,
      minimum: 0,
      maximum: 255,
    }),
    /**
     * Nonlinear shaping applied after `driverSignalByteMin`.
     *
     * Values >1 concentrate mountains into the strongest corridors (narrower belts).
     * Values <1 spread mountains wider (broader ranges).
     */
    driverExponent: Type.Number({
      description:
        "Controls nonlinear shaping after driverSignalByteMin; >1 concentrates mountain terrain into strongest corridors.",
      default: 1.0,
      minimum: 0.01,
      maximum: 10,
    }),
    /**
     * Hard cap on mountain tile coverage, expressed as a fraction of *land* tiles (0..1).
     *
     * This is a geometry constraint, not a noise/threshold hack: even in highly active orogens,
     * only a minority of land becomes true mountain terrain (ridges/peaks). The rest is foothills,
     * plateaus, basins, and lowlands.
     */
    mountainMaxFraction: Type.Number({
      description:
        "Controls hard cap on mountain terrain coverage as a fraction of land tiles (0..1).",
      default: 0.07,
      minimum: 0,
      maximum: 1,
    }),
    /**
     * Soft floor on mountain tile coverage, expressed as a fraction of *land* tiles (0..1).
     *
     * This is not a license for noise-only mountains: ridge planning still requires
     * physics-gated scores. The floor only asks the planner to keep selecting from
     * available tectonic candidates when absolute thresholds would otherwise leave
     * a visibly under-molded mountain system.
     */
    mountainMinFraction: Type.Number({
      description:
        "Controls soft floor on mountain terrain coverage from physics-gated candidates as a fraction of land tiles (0..1).",
      default: 0,
      minimum: 0,
      maximum: 1,
    }),
    /**
     * Hard cap on hill tile coverage, expressed as a fraction of *land* tiles (0..1).
     *
     * Hills represent foothills, uplifted rift shoulders, and worn-down ranges.
     * This cap prevents hills from becoming a planet-wide fill when broad driver
     * fields exist, while still allowing active margins to be rugged.
     */
    hillMaxFraction: Type.Number({
      description: "Controls hard cap on hill terrain coverage as a fraction of land tiles (0..1).",
      default: 0.18,
      minimum: 0,
      maximum: 1,
    }),
    /**
     * Target fraction of land tiles used as *ridge spines* (0..1).
     *
     * Spines are selected as local maxima of the mountain score and then optionally expanded.
     * Keeping spines sparse prevents blocky mountain blobs when the underlying driver fields are broad.
     */
    mountainSpineFraction: Type.Number({
      description: "Controls target fraction of land tiles used as mountain ridge spines (0..1).",
      default: 0.015,
      minimum: 0,
      maximum: 1,
    }),
    /**
     * Mean spacing between major mountain range systems, in map hexes.
     *
     * A value of 0 preserves legacy `mountainSpineFraction` behavior. Nonzero values
     * derive the number of range systems from map area, so official map sizes scale
     * naturally without directly authoring an output count. The Earthlike reference
     * spacing is sqrt((106*66)/18) ~= 19.7 tiles.
     */
    mountainRangeSpacingTiles: Type.Number({
      description:
        "Controls mean spacing between major mountain range systems in map hexes; 0 preserves mountainSpineFraction.",
      default: 0,
      minimum: 0,
      maximum: 256,
    }),
    /**
     * Target longitudinal span for each major mountain range system, in map hexes.
     *
     * This is not a direct mountain-tile output count. It asks the ridge planner
     * to carry each selected orogenic system along supported tectonic corridors
     * before province-width expansion paints foothills, passes, and valleys.
     */
    mountainRangeLengthTiles: Type.Number({
      description:
        "Controls target longitudinal span for each major mountain range system in map hexes.",
      default: 0,
      minimum: 0,
      maximum: 128,
    }),
    /**
     * Maximum footprint radius for a mountain region around each selected range anchor.
     *
     * This describes the orographic province, not peak coverage. Tiles inside the
     * footprint can later remain flat valleys, become foothills/rough lands, or
     * become true mountain terrain according to relief and ecology constraints.
     */
    mountainRegionRadiusTiles: Type.Integer({
      description:
        "Controls the maximum hex radius of each tectonically supported mountain-region footprint around selected range anchors.",
      default: 0,
      minimum: 0,
      maximum: 32,
    }),
    /**
     * Expansion radius (in hex steps) around ridge spines to form the final mountain mask.
     *
     * This provides limited ridge width while keeping ridgelines spine-driven.
     */
    mountainSpineDilationSteps: Type.Integer({
      description:
        "Controls expansion radius around ridge spines to form the final mountain terrain mask.",
      default: 1,
      minimum: 0,
      maximum: 6,
    }),
    /**
     * Score scale used for mountain shoulders around selected ridge spines.
     *
     * Lower values permit wider, more varied ridge bodies while retaining the
     * authored mountain threshold for initial spine seeds.
     */
    mountainShoulderThresholdScale: Type.Number({
      description:
        "Controls score threshold scale for mountain shoulders around ridge spines (0..1).",
      default: 0.6,
      minimum: 0,
      maximum: 1,
    }),
    /**
     * Minimum hex distance between selected ridge-spine seeds.
     *
     * This spreads mountain terrain across more distinct ranges without widening
     * each range. A value of 0 preserves legacy greedy selection.
     */
    mountainSpineMinDistance: Type.Integer({
      description:
        "Controls minimum hex distance between selected ridge-spine seeds; higher values favor more separate ranges over denser single belts.",
      default: 0,
      minimum: 0,
      maximum: 32,
    }),
    /**
     * Age-based relief attenuation for mountains (0..1).
     *
     * Old belts should preferentially degrade to hills rather than keeping sharp ridge masks forever.
     * This is a proxy for erosion + isostatic adjustment over time.
     */
    oldBeltMountainScale: Type.Number({
      description: "Controls mountain terrain scoring scale in old belts (0..1).",
      default: 0.4,
      minimum: 0,
      maximum: 1,
    }),
    /**
     * Age-based relief attenuation for hills (0..2).
     *
     * Old belts can remain rugged but should transition from mountains to hills.
     */
    oldBeltHillScale: Type.Number({
      description: "Controls hill terrain scoring scale in old belts (0..2).",
      default: 1.1,
      minimum: 0,
      maximum: 2,
    }),
    /**
     * Maximum foothill extent (hex steps) away from mountains.
     *
     * Foothills should be adjacent to ridges, not a planet-wide fill.
     */
    foothillMaxDistance: Type.Integer({
      description: "Controls maximum foothill terrain extent away from mountains.",
      default: 2,
      minimum: 0,
      maximum: 12,
    }),
    /**
     * Soft floor on foothill tile coverage, expressed as a fraction of *land* tiles (0..1).
     *
     * The floor fills only from tiles that are either ridge-adjacent or supported
     * by meaningful boundary deformation, so it cannot turn unrelated interiors
     * into generic hills.
     */
    foothillMinFraction: Type.Number({
      description:
        "Controls soft floor on foothill terrain coverage from ridge-adjacent or boundary-supported candidates as a fraction of land tiles (0..1).",
      default: 0,
      minimum: 0,
      maximum: 1,
    }),
    /**
     * Hard cap on foothill tile coverage, expressed as a fraction of *land* tiles (0..1).
     *
     * A value of 0 preserves legacy behavior by using `hillMaxFraction` as the
     * foothill cap. Nonzero values keep foothill skirts from consuming the full
     * hill budget needed by interior highlands and rough lands.
     */
    foothillMaxFraction: Type.Number({
      description:
        "Controls hard cap on foothill terrain coverage as a fraction of land tiles; 0 falls back to hillMaxFraction.",
      default: 0,
      minimum: 0,
      maximum: 1,
    }),
    /** Score threshold for promoting a tile to a mountain; lower values allow more peaks. */
    mountainThreshold: Type.Number({
      description: "Controls score threshold for promoting a map tile to mountain terrain.",
      default: 0.58,
      minimum: 0,
      maximum: 10,
    }),
    /** Score threshold for assigning hills; lower values increase hill coverage. */
    hillThreshold: Type.Number({
      description: "Controls score threshold for assigning hill terrain.",
      default: 0.32,
      minimum: 0,
      maximum: 10,
    }),
    /** Weight applied to uplift potential; keeps mountains aligned with convergent zones. */
    upliftWeight: Type.Number({
      description:
        "Controls uplift potential weight that keeps mountain terrain aligned with convergent zones.",
      default: 0.35,
      minimum: 0,
      maximum: 10,
    }),
    /** Weight applied to fractal noise to introduce natural variation in ranges. */
    fractalWeight: Type.Number({
      description: "Controls fractal noise weight used to vary mountain ranges.",
      default: 0.15,
      minimum: 0,
      maximum: 10,
    }),

    /**
     * Orogeny diagnostic weights (physics decomposition).
     *
     * These weights are used to build the `orogenyPotential` visualization surface from
     * boundary regime + stress/uplift/rift signals.
     */
    orogenyCollisionStressWeight: Type.Number({
      description: "Controls stress contribution to collision orogeny terrain potential.",
      default: 0.6,
      minimum: 0,
      maximum: 10,
    }),
    orogenyCollisionUpliftWeight: Type.Number({
      description: "Controls uplift contribution to collision orogeny terrain potential.",
      default: 0.4,
      minimum: 0,
      maximum: 10,
    }),
    orogenyTransformStressWeight: Type.Number({
      description:
        "Controls stress contribution to transform/transpressional orogeny terrain potential.",
      default: 0.4,
      minimum: 0,
      maximum: 10,
    }),
    orogenyDivergentRiftWeight: Type.Number({
      description: "Controls rift contribution to divergent rift-shoulder terrain potential.",
      default: 0.55,
      minimum: 0,
      maximum: 10,
    }),
    orogenyDivergentStressWeight: Type.Number({
      description: "Controls stress contribution to divergent rift-shoulder terrain potential.",
      default: 0.15,
      minimum: 0,
      maximum: 10,
    }),

    /** Diagnostic fracture surface weights (physics decomposition). */
    fractureBoundaryWeight: Type.Number({
      description: "Controls boundary closeness contribution to terrain fracture proxy.",
      default: 0.7,
      minimum: 0,
      maximum: 10,
    }),
    fractureStressWeight: Type.Number({
      description: "Controls stress contribution to terrain fracture proxy.",
      default: 0.2,
      minimum: 0,
      maximum: 10,
    }),
    fractureRiftWeight: Type.Number({
      description: "Controls rift contribution to terrain fracture proxy.",
      default: 0.1,
      minimum: 0,
      maximum: 10,
    }),

    /** Stress/uplift mix used specifically for mountain scoring in collision regimes. */
    mountainCollisionStressWeight: Type.Number({
      description: "Controls stress contribution to mountain terrain scoring in collision regimes.",
      default: 0.5,
      minimum: 0,
      maximum: 10,
    }),
    mountainCollisionUpliftWeight: Type.Number({
      description: "Controls uplift contribution to mountain terrain scoring in collision regimes.",
      default: 0.5,
      minimum: 0,
      maximum: 10,
    }),
    /**
     * Subduction-driven uplift contribution to mountain scoring (unitless weight).
     *
     * Subduction arcs are often narrower and less topographically broad than continent-continent
     * collision belts, so this should typically be lower than collision uplift weights.
     */
    mountainSubductionUpliftWeight: Type.Number({
      description: "Controls subduction-driven uplift contribution to mountain terrain scoring.",
      default: 0.25,
      minimum: 0,
      maximum: 10,
    }),
    /**
     * Interior uplift factor (0..1+) applied only when driverStrength is nonzero.
     *
     * This keeps mountains tied to tectonic driver corridors instead of appearing as plate-interior noise.
     */
    mountainInteriorUpliftScale: Type.Number({
      description:
        "Controls interior uplift factor applied when driverStrength keeps mountains tied to driver corridors.",
      default: 0.25,
      minimum: 0,
      maximum: 10,
    }),
    /** Scale factor for fractal modulation of mountain scoring (unitless). */
    mountainFractalScale: Type.Number({
      description: "Controls fractal modulation scale for mountain terrain scoring.",
      default: 0.3,
      minimum: 0,
      maximum: 10,
    }),
    /** Base term used when blending convergence bonus with fractal modulation (unitless). */
    mountainConvergenceFractalBase: Type.Number({
      description: "Controls base term for convergence-bonus terrain blend.",
      default: 0.6,
      minimum: 0,
      maximum: 10,
    }),
    /** Fractal span used when blending convergence bonus with fractal modulation (unitless). */
    mountainConvergenceFractalSpan: Type.Number({
      description: "Controls fractal span for convergence-bonus terrain blend.",
      default: 0.4,
      minimum: 0,
      maximum: 10,
    }),
    /** Depression severity along divergent boundaries (0..1); higher values carve deeper rifts. */
    riftDepth: Type.Number({
      description:
        "Controls depression severity along divergent boundaries; higher values carve deeper terrain rifts.",
      default: 0.2,
      minimum: 0,
      maximum: 1,
    }),
    /** Additional weight from plate-boundary closeness that pulls mountains toward margins. */
    boundaryWeight: Type.Number({
      description:
        "Controls plate-boundary closeness weight that pulls mountain terrain toward margins.",
      default: 1.0,
      minimum: 0,
      maximum: 10,
    }),
    /**
     * Boundary-closeness gate (0..0.99).
     *
     * Tiles with boundary closeness at-or-below this value receive no boundary-driven contribution.
     *
     * Set to 0 for more interior variety; raise it to keep mountains concentrated along active margins.
     */
    boundaryGate: Type.Number({
      description:
        "Controls boundary-closeness gate for concentrating mountain terrain along margins (0..0.99).",
      default: 0.1,
      minimum: 0,
      maximum: 0.99,
    }),
    /** Exponent controlling how quickly boundary influence decays with distance (>=0.25). */
    boundaryExponent: Type.Number({
      description:
        "Controls how quickly boundary influence decays with distance for mountain terrain.",
      default: 1.6,
      minimum: 0.25,
      maximum: 10,
    }),
    /**
     * Terrain-classification envelope applied to Foundation-derived boundary proximity.
     *
     * This does not change Foundation truth, landmasses, sea level, or coastal
     * shelves. It only controls how broadly existing tectonic corridors can express
     * as mountain spines and foothills during terrain classification.
     */
    rangeEnvelopeScale: Type.Number({
      description:
        "Controls how broadly existing Foundation tectonic corridors express as mountain/foothill terrain without changing landmasses.",
      default: 1,
      minimum: 0.25,
      maximum: 4,
    }),
    /**
     * Penalty applied to deep interior tiles to keep high terrain near tectonic action.
     *
     * Applied as a multiplier that scales with distance from plate boundaries (higher = fewer interior peaks).
     */
    interiorPenaltyWeight: Type.Number({
      description:
        "Controls deep-interior terrain penalty to keep high terrain near tectonic action.",
      default: 0.0,
      minimum: 0,
      maximum: 10,
    }),
    /** Extra additive weight for convergent tiles, creating dominant orogeny ridges. */
    convergenceBonus: Type.Number({
      description:
        "Controls additive weight for convergent tiles, creating dominant orogeny ridges.",
      default: 1.0,
      minimum: 0,
      maximum: 10,
    }),
    /** Penalty multiplier for transform boundaries to soften shearing ridges. */
    transformPenalty: Type.Number({
      description:
        "Controls penalty multiplier for transform boundaries to soften shearing ridges.",
      default: 0.6,
      minimum: 0,
      maximum: 10,
    }),
    /** Penalty multiplier applied along divergent boundaries before riftDepth is carved. */
    riftPenalty: Type.Number({
      description:
        "Controls penalty multiplier along divergent boundaries before riftDepth is carved.",
      default: 1.0,
      minimum: 0,
      maximum: 10,
    }),
    /** Hill weight contributed by boundary closeness, forming foothill skirts near margins. */
    hillBoundaryWeight: Type.Number({
      description: "Controls hill terrain weight contributed by boundary closeness near margins.",
      default: 0.35,
      minimum: 0,
      maximum: 10,
    }),
    /** Hill bonus added beside rift valleys, creating uplifted shoulders. */
    hillRiftBonus: Type.Number({
      description: "Controls hill terrain bonus beside rift valleys and uplifted shoulders.",
      default: 0.25,
      minimum: 0,
      maximum: 10,
    }),
    /** Foothill extent base used for hill skirts (unitless). */
    hillFoothillBase: Type.Number({
      description: "Controls foothill terrain extent base used for hill skirts.",
      default: 0.5,
      minimum: 0,
      maximum: 10,
    }),
    /** Foothill extent gain from fractal modulation (unitless). */
    hillFoothillFractalGain: Type.Number({
      description: "Controls foothill extent gain from fractal terrain modulation.",
      default: 0.5,
      minimum: 0,
      maximum: 10,
    }),
    /** Extra foothill weight on convergent tiles to smooth transitions into mountain ranges. */
    hillConvergentFoothill: Type.Number({
      description:
        "Controls extra foothill terrain weight on convergent tiles to smooth mountain transitions.",
      default: 0.35,
      minimum: 0,
      maximum: 10,
    }),
    /**
     * Penalty for hills deep inside plates; higher values keep hills near tectonic features.
     *
     * Applied as a multiplier that scales with distance from plate boundaries.
     */
    hillInteriorFalloff: Type.Number({
      description:
        "Controls penalty for hill terrain deep inside plates as distance from boundaries increases.",
      default: 0.1,
      minimum: 0,
      maximum: 10,
    }),
    /** Residual uplift contribution applied to hills so basins and foothills stay balanced. */
    hillUpliftWeight: Type.Number({
      description:
        "Controls residual uplift contribution applied to hills so basins and foothills stay balanced.",
      default: 0.2,
      minimum: 0,
      maximum: 10,
    }),
    /** Scale factor for fractal modulation of hill scoring (unitless). */
    hillFractalScale: Type.Number({
      description: "Controls fractal modulation scale for hill terrain scoring.",
      default: 0.8,
      minimum: 0,
      maximum: 10,
    }),
    /** Scale factor for uplift contribution to hill scoring (unitless). */
    hillUpliftScale: Type.Number({
      description: "Controls uplift contribution scale for hill terrain scoring.",
      default: 0.3,
      minimum: 0,
      maximum: 10,
    }),
    /** Scale factor for rift-shoulder hill bonuses (unitless). */
    hillRiftBonusScale: Type.Number({
      description: "Controls rift-shoulder bonus scale for hill terrain scoring.",
      default: 0.5,
      minimum: 0,
      maximum: 10,
    }),
    /** Scale factor for rift depth suppression in hill scoring (unitless). */
    hillRiftDepthScale: Type.Number({
      description: "Controls rift depth suppression scale for hill terrain scoring.",
      default: 0.5,
      minimum: 0,
      maximum: 10,
    }),
    /**
     * Hard cap on non-foothill rough-land hills, expressed as a fraction of land.
     *
     * A value of 0 preserves legacy behavior by using the remaining hill budget.
     */
    roughLandMaxFraction: Type.Number({
      description:
        "Controls hard cap on non-foothill rough-land hill coverage as a fraction of land tiles; 0 uses the remaining hill budget.",
      default: 0,
      minimum: 0,
      maximum: 1,
    }),
    /** Baseline multiplier for rough-land fractal texture. */
    roughLandFractalFloor: Type.Number({
      description: "Controls baseline multiplier for rough-land fractal texture.",
      default: 0.75,
      minimum: 0,
      maximum: 10,
    }),
    /** Gain multiplier for rough-land fractal texture. */
    roughLandFractalGain: Type.Number({
      description: "Controls gain multiplier for rough-land fractal texture.",
      default: 0.5,
      minimum: 0,
      maximum: 10,
    }),
    /** Scale applied to interior old-highland, rolling-upland, and plateau signals. */
    roughLandInteriorScale: Type.Number({
      description:
        "Controls interior highland/rolling-upland/plateau contribution to rough-land hill scoring.",
      default: 1,
      minimum: 0,
      maximum: 10,
    }),
  },
  {
    additionalProperties: false,
    description:
      "Mountain-range controls for shared ridge, foothill, rough-land terrain classification.",
  }
);

/**
 * Plans foothill (hill) masks adjacent to ridges/mountain corridors.
 *
 * This op intentionally consumes the ridge (mountain) mask so hills remain a distinct,
 * non-overlapping class.
 */
const PlanFoothillsContract = defineOp({
  kind: "plan",
  id: "morphology/plan-foothills",
  input: Type.Object({
    width: Type.Integer({ minimum: 1, description: "Map width in tiles." }),
    height: Type.Integer({ minimum: 1, description: "Map height in tiles." }),
    landMask: TypedArraySchemas.u8({ description: "Land mask per tile (1=land, 0=water)." }),
    mountainMask: TypedArraySchemas.u8({
      description: "Mask (1/0): mountain tiles to exclude from hills.",
    }),
    mountainRegionMask: TypedArraySchemas.u8({
      description:
        "Mask (1/0): mountain-region footprint used to allow internal passes, foothills, and settlement-capable valleys.",
    }),
    mountainRegionIdByTile: TypedArraySchemas.i32({
      description: "Per-tile mountain-region id (-1 outside mountain-region footprint).",
    }),
    boundaryCloseness: TypedArraySchemas.u8({
      description: "Boundary proximity per tile (0..255).",
    }),
    boundaryType: TypedArraySchemas.u8({
      description: "Boundary type per tile (BOUNDARY_TYPE values).",
    }),
    upliftPotential: TypedArraySchemas.u8({ description: "Uplift potential per tile (0..255)." }),
    collisionPotential: TypedArraySchemas.u8({
      description: "Collision-driven uplift potential per tile (0..255).",
    }),
    subductionPotential: TypedArraySchemas.u8({
      description: "Subduction-driven uplift potential per tile (0..255).",
    }),
    riftPotential: TypedArraySchemas.u8({ description: "Rift potential per tile (0..255)." }),
    tectonicStress: TypedArraySchemas.u8({ description: "Tectonic stress per tile (0..255)." }),
    beltAge: TypedArraySchemas.u8({
      description: "Normalized belt age proxy per tile (0..255). 0=youngest, 255=oldest.",
    }),
    fractalHill: TypedArraySchemas.i16({ description: "Fractal noise for hill scores." }),
  }),
  output: Type.Object({
    hillMask: TypedArraySchemas.u8({
      description: "Mask (1/0): hill tiles (excluding mountains).",
    }),
  }),
  defaultStrategy: "default",
  strategies: {
    default: MountainsConfigSchema,
  },
});

export default PlanFoothillsContract;
