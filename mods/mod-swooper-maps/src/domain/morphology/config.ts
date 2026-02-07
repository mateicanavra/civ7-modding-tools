import { Type, type Static } from "@swooper/mapgen-core/authoring";

/**
 * Plate-aware weighting for bay/fjord odds based on boundary closeness.
 */
export const CoastlinePlateBiasConfigSchema = Type.Object(
  {
    /** Normalized closeness where coastline edits begin to respond to plate boundaries (0..1). */
    threshold: Type.Number({
      description: "Normalized closeness where coastline edits begin to respond to plate boundaries (0..1).",
      default: 0.45,
      minimum: 0,
      maximum: 1,
    }),
    /**
     * Exponent shaping how quickly bias ramps after the threshold.
     * Values >1 concentrate effects near boundaries; <1 spreads them wider.
     */
    power: Type.Number({
      description: "Exponent shaping how quickly bias ramps after the threshold; >1 concentrates effects near boundaries.",
      default: 1.25,
      minimum: 0,
    }),
    /** Bias multiplier for convergent boundaries; positive values encourage dramatic coasts and fjords. */
    convergent: Type.Number({
      description: "Bias multiplier for convergent boundaries; positive values encourage dramatic coasts and fjords.",
      default: 1.0,
    }),
    /** Bias multiplier for transform boundaries; lower values soften edits along shear zones. */
    transform: Type.Number({
      description: "Bias multiplier for transform boundaries; lower values soften edits along shear zones.",
      default: 0.4,
    }),
    /** Bias multiplier for divergent boundaries; negative values discourage ruggedization along rifts. */
    divergent: Type.Number({
      description: "Bias multiplier for divergent boundaries; negative values discourage ruggedization along rifts.",
      default: -0.6,
    }),
    /** Residual bias for interior coasts away from boundaries; typically near zero. */
    interior: Type.Number({
      description: "Residual bias for interior coasts away from boundaries; typically near zero.",
      default: 0,
    }),
    /** Strength applied to bay denominators; higher values increase bay carving where bias is positive. */
    bayWeight: Type.Number({
      description: "Strength applied to bay denominators; higher values increase bay carving where bias is positive.",
      default: 0.35,
      minimum: 0,
    }),
    /** Extra noise gate reduction when bias is positive, allowing smaller bays near active margins. */
    bayNoiseBonus: Type.Number({
      description: "Extra noise gate reduction when bias is positive, allowing smaller bays near active margins.",
      default: 1.0,
      minimum: 0,
    }),
    /** Strength applied to fjord denominators; higher values create more fjords along favored coasts. */
    fjordWeight: Type.Number({
      description: "Strength applied to fjord denominators; higher values create more fjords along favored coasts.",
      default: 0.8,
      minimum: 0,
    }),
  }
);

/**
 * Bay configuration (gentle coastal indentations).
 */
export const CoastlineBayConfigSchema = Type.Object(
  {
    /** Extra noise threshold on larger maps; higher values reduce bay frequency while keeping size larger. */
    noiseGateAdd: Type.Number({
      description: "Extra noise threshold on larger maps; higher values reduce bay frequency while keeping size larger.",
      default: 0,
    }),
    /** Bay frequency on active margins; lower denominators produce more bays along energetic coasts. */
    rollDenActive: Type.Number({
      description: "Bay frequency on active margins; lower denominators produce more bays along energetic coasts.",
      default: 4,
      minimum: 1,
    }),
    /** Bay frequency on passive margins; lower denominators carve more bays in calm regions. */
    rollDenDefault: Type.Number({
      description: "Bay frequency on passive margins; lower denominators carve more bays in calm regions.",
      default: 5,
      minimum: 1,
    }),
  }
);

/**
 * Fjord configuration (deep, narrow inlets along steep margins).
 */
export const CoastlineFjordConfigSchema = Type.Object(
  {
    /** Base fjord frequency; smaller values increase fjord count across the map. */
    baseDenom: Type.Number({
      description: "Base fjord frequency; smaller values increase fjord count across the map.",
      default: 12,
      minimum: 1,
    }),
    /** Bonus applied on active convergent margins; subtracts from baseDenom to amplify fjord density. */
    activeBonus: Type.Number({
      description: "Bonus applied on active convergent margins; subtracts from baseDenom to amplify fjord density.",
      default: 1,
      minimum: 0,
    }),
    /** Bonus applied on passive shelves; subtracts from baseDenom for gentler fjords. */
    passiveBonus: Type.Number({
      description: "Bonus applied on passive shelves; subtracts from baseDenom for gentler fjords.",
      default: 2,
      minimum: 0,
    }),
  }
);

/**
 * Island chain placement using deterministic noise and volcanism signals.
 */
export const IslandsConfigSchema = Type.Object(
  {
    /** Noise cutoff for island seeds (percent). Higher values mean fewer, larger island groups. */
    fractalThresholdPercent: Type.Number({
      description: "Noise cutoff for island seeds (percent). Higher values mean fewer, larger island groups.",
      default: 90,
      minimum: 0,
      maximum: 100,
    }),
    /** Minimum spacing from continental landmasses (tiles) to prevent coastal clutter. */
    minDistFromLandRadius: Type.Number({
      description: "Minimum spacing from continental landmasses (tiles) to prevent coastal clutter.",
      default: 2,
      minimum: 0,
    }),
    /**
     * Island frequency near active margins.
     * Lower denominators spawn more volcanic arcs like Japan.
     */
    baseIslandDenNearActive: Type.Number({
      description: "Island frequency near active margins; lower denominators spawn more volcanic arcs like Japan.",
      default: 5,
      minimum: 1,
    }),
    /** Island frequency away from active margins; controls interior archipelagos. */
    baseIslandDenElse: Type.Number({
      description: "Island frequency away from active margins; controls interior archipelagos.",
      default: 7,
      minimum: 1,
    }),
    /**
     * Island seed frequency along volcanism signals.
     * Smaller values create Hawaii-style chains.
     */
    hotspotSeedDenom: Type.Number({
      description: "Island seed frequency along volcanism signals; smaller values create Hawaii-style chains.",
      default: 2,
      minimum: 1,
    }),
    /** Maximum tiles per island cluster to cap archipelago size (tiles). */
    clusterMax: Type.Number({
      description: "Maximum tiles per island cluster to cap archipelago size (tiles).",
      default: 3,
      minimum: 1,
    }),
    /** Chance of spawning larger microcontinent chains outside major margins (0..1). */
    microcontinentChance: Type.Number({
      description: "Chance of spawning larger microcontinent chains outside major margins (0..1).",
      default: 0,
      minimum: 0,
      maximum: 1,
    }),
  }
);

/**
 * Mountain and hill placement tuning driven by foundation physics.
 */
export const MountainsConfigSchema = Type.Object(
  {
    /**
     * Global scale for tectonic effects.
     * Primary dial for overall mountain prevalence across the map.
     */
    tectonicIntensity: Type.Number({
      description: "Global scale for tectonic effects; primary dial for overall mountain prevalence.",
      default: 1.0,
      minimum: 0,
    }),
    /**
     * Minimum driver byte (0..255) required for mountains/hills to form.
     *
     * This intentionally mirrors the `morphology-driver-correlation` invariant's `DRIVER_SIGNAL_THRESHOLD`
     * so we don't produce mountains from pure noise or low-intensity residual fields.
     */
    driverSignalByteMin: Type.Number({
      description:
        "Minimum driver byte (0..255) required for mountains/hills to form. Mirrors the determinism gate's driver-signal threshold.",
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
        "Nonlinear shaping applied after driverSignalByteMin; >1 concentrates mountains into strongest corridors, <1 spreads them wider.",
      default: 1.0,
      minimum: 0.01,
    }),
    /**
     * Hard cap on mountain tile coverage, expressed as a fraction of *land* tiles (0..1).
     *
     * This is a geometry constraint, not a noise/threshold hack: even in highly active orogens,
     * only a minority of land becomes true mountain terrain (ridges/peaks). The rest is foothills,
     * plateaus, basins, and lowlands.
     */
    mountainMaxFraction: Type.Number({
      description: "Hard cap on mountain coverage as a fraction of land tiles (0..1).",
      default: 0.07,
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
      description: "Target fraction of land tiles used as ridge spines (0..1).",
      default: 0.015,
      minimum: 0,
      maximum: 1,
    }),
    /**
     * Expansion radius (in hex steps) around ridge spines to form the final mountain mask.
     *
     * This provides limited ridge width while keeping ridgelines spine-driven.
     */
    mountainSpineDilationSteps: Type.Integer({
      description: "Expansion radius (hex steps) around ridge spines to form the final mountain mask.",
      default: 1,
      minimum: 0,
      maximum: 6,
    }),
    /**
     * Age-based relief attenuation for mountains (0..1).
     *
     * Old belts should preferentially degrade to hills rather than keeping sharp ridge masks forever.
     * This is a proxy for erosion + isostatic adjustment over time.
     */
    oldBeltMountainScale: Type.Number({
      description: "Scale applied to mountain scoring in old belts (0..1).",
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
      description: "Scale applied to hill scoring in old belts (0..2).",
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
      description: "Maximum foothill extent (hex steps) away from mountains.",
      default: 2,
      minimum: 0,
      maximum: 12,
    }),
    /** Score threshold for promoting a tile to a mountain; lower values allow more peaks. */
    mountainThreshold: Type.Number({
      description: "Score threshold for promoting a tile to a mountain; lower values allow more peaks.",
      default: 0.58,
      minimum: 0,
    }),
    /** Score threshold for assigning hills; lower values increase hill coverage. */
    hillThreshold: Type.Number({
      description: "Score threshold for assigning hills; lower values increase hill coverage.",
      default: 0.32,
      minimum: 0,
    }),
    /** Weight applied to uplift potential; keeps mountains aligned with convergent zones. */
    upliftWeight: Type.Number({
      description: "Weight applied to uplift potential; keeps mountains aligned with convergent zones.",
      default: 0.35,
      minimum: 0,
    }),
    /** Weight applied to fractal noise to introduce natural variation in ranges. */
    fractalWeight: Type.Number({
      description: "Weight applied to fractal noise to introduce natural variation in ranges.",
      default: 0.15,
      minimum: 0,
    }),

    /**
     * Orogeny diagnostic weights (physics decomposition).
     *
     * These weights are used to build the `orogenyPotential` visualization surface from
     * boundary regime + stress/uplift/rift signals.
     */
    orogenyCollisionStressWeight: Type.Number({
      description: "Stress contribution to collision orogeny potential (unitless weight).",
      default: 0.6,
      minimum: 0,
    }),
    orogenyCollisionUpliftWeight: Type.Number({
      description: "Uplift contribution to collision orogeny potential (unitless weight).",
      default: 0.4,
      minimum: 0,
    }),
    orogenyTransformStressWeight: Type.Number({
      description: "Stress contribution to transform/transpressional orogeny potential (unitless weight).",
      default: 0.4,
      minimum: 0,
    }),
    orogenyDivergentRiftWeight: Type.Number({
      description: "Rift contribution to divergent (rift-shoulder) orogeny potential (unitless weight).",
      default: 0.55,
      minimum: 0,
    }),
    orogenyDivergentStressWeight: Type.Number({
      description: "Stress contribution to divergent (rift-shoulder) orogeny potential (unitless weight).",
      default: 0.15,
      minimum: 0,
    }),

    /** Diagnostic fracture surface weights (physics decomposition). */
    fractureBoundaryWeight: Type.Number({
      description: "Boundary closeness contribution to fracture proxy (unitless weight).",
      default: 0.7,
      minimum: 0,
    }),
    fractureStressWeight: Type.Number({
      description: "Stress contribution to fracture proxy (unitless weight).",
      default: 0.2,
      minimum: 0,
    }),
    fractureRiftWeight: Type.Number({
      description: "Rift contribution to fracture proxy (unitless weight).",
      default: 0.1,
      minimum: 0,
    }),

    /** Stress/uplift mix used specifically for mountain scoring in collision regimes. */
    mountainCollisionStressWeight: Type.Number({
      description: "Stress contribution to mountain scoring in collision regimes (unitless weight).",
      default: 0.5,
      minimum: 0,
    }),
    mountainCollisionUpliftWeight: Type.Number({
      description: "Uplift contribution to mountain scoring in collision regimes (unitless weight).",
      default: 0.5,
      minimum: 0,
    }),
    /**
     * Subduction-driven uplift contribution to mountain scoring (unitless weight).
     *
     * Subduction arcs are often narrower and less topographically broad than continent-continent
     * collision belts, so this should typically be lower than collision uplift weights.
     */
    mountainSubductionUpliftWeight: Type.Number({
      description: "Subduction-driven uplift contribution to mountain scoring (unitless weight).",
      default: 0.25,
      minimum: 0,
    }),
    /**
     * Interior uplift factor (0..1+) applied only when driverStrength is nonzero.
     *
     * This keeps mountains tied to tectonic driver corridors instead of appearing as plate-interior noise.
     */
    mountainInteriorUpliftScale: Type.Number({
      description:
        "Interior uplift factor applied when driverStrength is nonzero; keeps mountains tied to driver corridors.",
      default: 0.25,
      minimum: 0,
    }),
    /** Scale factor for fractal modulation of mountain scoring (unitless). */
    mountainFractalScale: Type.Number({
      description: "Scale factor for fractal modulation of mountain scoring (unitless).",
      default: 0.3,
      minimum: 0,
    }),
    /** Base term used when blending convergence bonus with fractal modulation (unitless). */
    mountainConvergenceFractalBase: Type.Number({
      description: "Base term for convergence-bonus blend (unitless).",
      default: 0.6,
      minimum: 0,
    }),
    /** Fractal span used when blending convergence bonus with fractal modulation (unitless). */
    mountainConvergenceFractalSpan: Type.Number({
      description: "Fractal span for convergence-bonus blend (unitless).",
      default: 0.4,
      minimum: 0,
    }),
    /** Depression severity along divergent boundaries (0..1); higher values carve deeper rifts. */
    riftDepth: Type.Number({
      description: "Depression severity along divergent boundaries (0..1); higher values carve deeper rifts.",
      default: 0.2,
      minimum: 0,
      maximum: 1,
    }),
    /** Additional weight from plate-boundary closeness that pulls mountains toward margins. */
    boundaryWeight: Type.Number({
      description: "Additional weight from plate-boundary closeness that pulls mountains toward margins.",
      default: 1.0,
      minimum: 0,
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
        "Boundary-closeness gate (0..0.99). Set to 0 for more interior variety; raise it to concentrate mountains along margins.",
      default: 0.1,
      minimum: 0,
      maximum: 0.99,
    }),
    /** Exponent controlling how quickly boundary influence decays with distance (>=0.25). */
    boundaryExponent: Type.Number({
      description: "Exponent controlling how quickly boundary influence decays with distance (>=0.25).",
      default: 1.6,
      minimum: 0.25,
    }),
    /**
     * Penalty applied to deep interior tiles to keep high terrain near tectonic action.
     *
     * Applied as a multiplier that scales with distance from plate boundaries (higher = fewer interior peaks).
     */
    interiorPenaltyWeight: Type.Number({
      description:
        "Penalty applied to deep interior tiles to keep high terrain near tectonic action (higher = fewer interior peaks).",
      default: 0.0,
      minimum: 0,
    }),
    /** Extra additive weight for convergent tiles, creating dominant orogeny ridges. */
    convergenceBonus: Type.Number({
      description: "Extra additive weight for convergent tiles, creating dominant orogeny ridges.",
      default: 1.0,
      minimum: 0,
    }),
    /** Penalty multiplier for transform boundaries to soften shearing ridges. */
    transformPenalty: Type.Number({
      description: "Penalty multiplier for transform boundaries to soften shearing ridges.",
      default: 0.6,
      minimum: 0,
    }),
    /** Penalty multiplier applied along divergent boundaries before riftDepth is carved. */
    riftPenalty: Type.Number({
      description: "Penalty multiplier applied along divergent boundaries before riftDepth is carved.",
      default: 1.0,
      minimum: 0,
    }),
    /** Hill weight contributed by boundary closeness, forming foothill skirts near margins. */
    hillBoundaryWeight: Type.Number({
      description: "Hill weight contributed by boundary closeness, forming foothill skirts near margins.",
      default: 0.35,
      minimum: 0,
    }),
    /** Hill bonus added beside rift valleys, creating uplifted shoulders. */
    hillRiftBonus: Type.Number({
      description: "Hill bonus added beside rift valleys, creating uplifted shoulders.",
      default: 0.25,
      minimum: 0,
    }),
    /** Foothill extent base used for hill skirts (unitless). */
    hillFoothillBase: Type.Number({
      description: "Foothill extent base used for hill skirts (unitless).",
      default: 0.5,
      minimum: 0,
    }),
    /** Foothill extent gain from fractal modulation (unitless). */
    hillFoothillFractalGain: Type.Number({
      description: "Foothill extent gain from fractal modulation (unitless).",
      default: 0.5,
      minimum: 0,
    }),
    /** Extra foothill weight on convergent tiles to smooth transitions into mountain ranges. */
    hillConvergentFoothill: Type.Number({
      description: "Extra foothill weight on convergent tiles to smooth transitions into mountain ranges.",
      default: 0.35,
      minimum: 0,
    }),
    /**
     * Penalty for hills deep inside plates; higher values keep hills near tectonic features.
     *
     * Applied as a multiplier that scales with distance from plate boundaries.
     */
    hillInteriorFalloff: Type.Number({
      description:
        "Penalty for hills deep inside plates; scales with distance from boundaries (higher = fewer interior hills).",
      default: 0.1,
      minimum: 0,
    }),
    /** Residual uplift contribution applied to hills so basins and foothills stay balanced. */
    hillUpliftWeight: Type.Number({
      description: "Residual uplift contribution applied to hills so basins and foothills stay balanced.",
      default: 0.2,
      minimum: 0,
    }),
    /** Scale factor for fractal modulation of hill scoring (unitless). */
    hillFractalScale: Type.Number({
      description: "Scale factor for fractal modulation of hill scoring (unitless).",
      default: 0.8,
      minimum: 0,
    }),
    /** Scale factor for uplift contribution to hill scoring (unitless). */
    hillUpliftScale: Type.Number({
      description: "Scale factor for uplift contribution to hill scoring (unitless).",
      default: 0.3,
      minimum: 0,
    }),
    /** Scale factor for rift-shoulder hill bonuses (unitless). */
    hillRiftBonusScale: Type.Number({
      description: "Scale factor for rift-shoulder hill bonuses (unitless).",
      default: 0.5,
      minimum: 0,
    }),
    /** Scale factor for rift depth suppression in hill scoring (unitless). */
    hillRiftDepthScale: Type.Number({
      description: "Scale factor for rift depth suppression in hill scoring (unitless).",
      default: 0.5,
      minimum: 0,
    }),
  }
);

/**
 * Volcano placement controls combining plate-aware arcs and hotspot trails.
 */
export const VolcanoesConfigSchema = Type.Object(
  {
    /** Master toggle for volcano placement. */
    enabled: Type.Boolean({
      description: "Master toggle for volcano placement.",
      default: true,
    }),
    /** Baseline volcanoes per land tile; higher density spawns more vents overall. */
    baseDensity: Type.Number({
      description: "Baseline volcanoes per land tile; higher density spawns more vents overall.",
      default: 1 / 170,
      minimum: 0,
    }),
    /** Minimum Euclidean distance between volcanoes in tiles to avoid clusters merging. */
    minSpacing: Type.Number({
      description: "Minimum Euclidean distance between volcanoes in tiles to avoid clusters merging.",
      default: 3,
      minimum: 0,
    }),
    /** Plate-boundary closeness threshold (0..1) for treating a tile as margin-adjacent. */
    boundaryThreshold: Type.Number({
      description: "Plate-boundary closeness threshold (0..1) for treating a tile as margin-adjacent.",
      default: 0.35,
      minimum: 0,
      maximum: 1,
    }),
    /** Base weight applied to tiles within the boundary band, biasing arcs over interiors. */
    boundaryWeight: Type.Number({
      description: "Base weight applied to tiles within the boundary band, biasing arcs over interiors.",
      default: 1.2,
      minimum: 0,
    }),
    /** Weight multiplier for convergent boundaries; raises classic arc volcano density. */
    convergentMultiplier: Type.Number({
      description: "Weight multiplier for convergent boundaries; raises classic arc volcano density.",
      default: 2.4,
      minimum: 0,
    }),
    /** Weight multiplier for transform boundaries; typically lower to avoid shear volcanism. */
    transformMultiplier: Type.Number({
      description: "Weight multiplier for transform boundaries; typically lower to avoid shear volcanism.",
      default: 1.1,
      minimum: 0,
    }),
    /** Weight multiplier for divergent boundaries; keep small to prevent rift volcanism dominating. */
    divergentMultiplier: Type.Number({
      description: "Weight multiplier for divergent boundaries; keep small to prevent rift volcanism dominating.",
      default: 0.35,
      minimum: 0,
    }),
    /** Weight contribution for interior hotspots; increases inland/shield volcano presence. */
    hotspotWeight: Type.Number({
      description: "Weight contribution for interior hotspots; increases inland/shield volcano presence.",
      default: 0.12,
      minimum: 0,
    }),
    /** Penalty applied using shield stability; higher values suppress volcanoes on ancient cratons. */
    shieldPenalty: Type.Number({
      description: "Penalty applied using shield stability; higher values suppress volcanoes on ancient cratons.",
      default: 0.6,
      minimum: 0,
      maximum: 1,
    }),
    /** Random additive jitter per tile to break up deterministic patterns. */
    randomJitter: Type.Number({
      description: "Random additive jitter per tile to break up deterministic patterns.",
      default: 0.08,
      minimum: 0,
    }),
    /** Minimum volcano count target to guarantee a few vents even on sparse maps. */
    minVolcanoes: Type.Number({
      description: "Minimum volcano count target to guarantee a few vents even on sparse maps.",
      default: 5,
      minimum: 0,
    }),
    /** Maximum volcano count cap; set <=0 to disable the cap and allow density-driven totals. */
    maxVolcanoes: Type.Number({
      description: "Maximum volcano count cap; set <=0 to disable the cap and allow density-driven totals.",
      default: 40,
    }),
  }
);

/**
 * Land fraction / hypsometry controls used for sea-level selection.
 */
export const HypsometryConfigSchema = Type.Object(
  {
    /** Target global water coverage (0-100). */
    targetWaterPercent: Type.Number({
      description:
        "Target global water coverage (0-100). 55-65 mimics Earth; 70-75 drifts toward archipelago worlds.",
      default: 60,
      minimum: 0,
      maximum: 100,
    }),
    /**
     * Multiplier applied after targetWaterPercent (typically 0.75-1.25).
     * Clamped to 0.25-1.75 to prevent full ocean/land wipeouts.
     */
    targetScalar: Type.Number({
      description:
        "Multiplier applied after targetWaterPercent (typically 0.75-1.25). Values are clamped to 0.25-1.75.",
      default: 1,
      minimum: 0.25,
      maximum: 1.75,
    }),
    /** Optional variance (0-100) applied to the target water percent per map. */
    variance: Type.Number({
      description: "Optional variance (0-100) applied to the target water percent per map.",
      default: 0,
      minimum: 0,
      maximum: 100,
    }),
    /**
     * Soft backstop on the share of land inside the boundary closeness band (0..1).
     * The solver lowers threshold in 5-point steps until boundary share meets this target.
     */
    boundaryShareTarget: Type.Number({
      description: "Soft backstop on the share of land inside the boundary closeness band (0..1).",
      default: 0.15,
      minimum: 0,
      maximum: 1,
    }),
    /** Desired share of continental crust when balancing land vs. ocean plates (0..1). */
    continentalFraction: Type.Optional(
      Type.Number({
        description: "Desired share of continental crust when balancing land vs. ocean plates (0..1).",
        minimum: 0,
        maximum: 1,
      })
    ),
  }
);

/**
 * Base relief shaping controls (tectonic expression into elevation).
 */
export const ReliefConfigSchema = Type.Object(
  {
    /** Closeness bonus favoring tiles near plate boundaries (0..1). */
    boundaryBias: Type.Number({
      description: "Closeness bonus favoring tiles near plate boundaries (0..1).",
      default: 0,
      minimum: 0,
      maximum: 1,
    }),
    /** Bias that clusters continental plates together. */
    clusteringBias: Type.Number({
      description:
        "Bias that clusters continental plates together; higher values encourage supercontinents.",
      default: 0,
      minimum: 0,
      maximum: 1,
    }),
    /** Blend factor for smoothing crust edges (0..1). */
    crustEdgeBlend: Type.Number({
      description: "Blend factor for smoothing crust edges (0..1).",
      default: 0.45,
      minimum: 0,
      maximum: 1,
    }),
    /** Amplitude of base noise injected into crust elevations (0..1). */
    crustNoiseAmplitude: Type.Number({
      description: "Amplitude of base noise injected into crust elevations (0..1).",
      default: 0.1,
      minimum: 0,
      maximum: 1,
    }),
    /** Baseline elevation for continental crust (normalized units). */
    continentalHeight: Type.Number({
      description: "Baseline elevation for continental crust (normalized units).",
      default: 0.32,
    }),
    /** Baseline elevation for oceanic crust (normalized units). */
    oceanicHeight: Type.Number({
      description: "Baseline elevation for oceanic crust (normalized units).",
      default: -0.55,
    }),
    /** Tectonic weighting used while shaping base topography. */
    tectonics: Type.Object(
      {
        interiorNoiseWeight: Type.Number({
          description: "Blend factor for plate-interior noise.",
          default: 0.5,
          minimum: 0,
        }),
        boundaryArcWeight: Type.Number({
          description: "Multiplier for convergent boundary uplift arcs.",
          default: 0.55,
          minimum: 0,
        }),
        boundaryArcNoiseWeight: Type.Number({
          description: "Raggedness injected into boundary arcs.",
          default: 0.2,
          minimum: 0,
        }),
        fractalGrain: Type.Number({
          description: "Grain of tectonic fractal noise (higher = finer).",
          default: 4,
          minimum: 1,
        }),
      }
    ),
  }
);

/**
 * Geomorphic cycle controls (fluvial incision + diffusion + deposition).
 */
export const GeomorphologyConfigSchema = Type.Object(
  {
    fluvial: Type.Object(
      {
        rate: Type.Number({
          description: "Fluvial incision rate (0..1).",
          default: 0.15,
          minimum: 0,
          maximum: 1,
        }),
        m: Type.Number({
          description: "Stream power exponent m for discharge proxy (flowAccum normalized by max).",
          default: 0.5,
        }),
        n: Type.Number({
          description: "Stream power exponent n for slope proxy (drop-to-receiver normalized by max).",
          default: 1.0,
        }),
      }
    ),
    diffusion: Type.Object(
      {
        rate: Type.Number({
          description: "Hillslope diffusion rate (0..1).",
          default: 0.2,
          minimum: 0,
          maximum: 1,
        }),
        talus: Type.Optional(
          Type.Number({
            description: "Optional talus threshold (normalized units).",
            default: 0.5,
            minimum: 0,
          })
        ),
      }
    ),
    deposition: Type.Object(
      {
        rate: Type.Number({
          description:
            "Sediment settling/transport rate (0..1). Deposits where stream power is low and transports where stream power is high.",
          default: 0.1,
          minimum: 0,
          maximum: 1,
        }),
      }
    ),
    eras: Type.Union([Type.Literal(1), Type.Literal(2), Type.Literal(3)], {
      description: "Number of geomorphic eras to apply.",
      default: 2,
    }),
  }
);

export const WorldAgeSchema = Type.Union(
  [Type.Literal("young"), Type.Literal("mature"), Type.Literal("old")],
  {
    description: "World age posture used to scale geomorphic intensity.",
    default: "mature",
  }
);

export const CoastConfigSchema = Type.Object(
  {
    bay: CoastlineBayConfigSchema,
    fjord: CoastlineFjordConfigSchema,
    plateBias: CoastlinePlateBiasConfigSchema,
  }
);

export const LandformsConfigSchema = Type.Object(
  {
    islands: IslandsConfigSchema,
    mountains: MountainsConfigSchema,
    volcanoes: VolcanoesConfigSchema,
  }
);

export const MorphologyConfigSchema = Type.Object(
  {
    hypsometry: HypsometryConfigSchema,
    relief: ReliefConfigSchema,
    coast: CoastConfigSchema,
    landforms: LandformsConfigSchema,
    geomorphology: GeomorphologyConfigSchema,
    worldAge: WorldAgeSchema,
  }
);

export type MorphologyConfig = Static<typeof MorphologyConfigSchema>;
export type HypsometryConfig = Static<typeof HypsometryConfigSchema>;
export type ReliefConfig = Static<typeof ReliefConfigSchema>;
export type GeomorphologyConfig = Static<typeof GeomorphologyConfigSchema>;
export type CoastConfig = Static<typeof CoastConfigSchema>;
export type LandformsConfig = Static<typeof LandformsConfigSchema>;
export type CoastlinePlateBiasConfig =
  Static<typeof CoastConfigSchema["properties"]["plateBias"]>;
export type CoastlineBayConfig =
  Static<typeof CoastConfigSchema["properties"]["bay"]>;
export type CoastlineFjordConfig =
  Static<typeof CoastConfigSchema["properties"]["fjord"]>;
export type IslandsConfig =
  Static<typeof LandformsConfigSchema["properties"]["islands"]>;
export type MountainsConfig =
  Static<typeof LandformsConfigSchema["properties"]["mountains"]>;
export type VolcanoesConfig =
  Static<typeof LandformsConfigSchema["properties"]["volcanoes"]>;
