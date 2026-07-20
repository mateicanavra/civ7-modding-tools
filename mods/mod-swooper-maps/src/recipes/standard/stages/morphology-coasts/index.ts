import { createStage, Type } from "@swooper/mapgen-core/authoring";
import { orderStandardStageSteps } from "../../contract-manifest.js";
import { landmassPlates, ruggedCoasts } from "./steps/index.js";

export type MorphologySeaLevelKnob = "land-heavy" | "earthlike" | "water-heavy";

export type MorphologyCoastRuggednessKnob = "smooth" | "normal" | "rugged";

const MorphologySeaLevelKnobSchema = Type.Union(
  [Type.Literal("land-heavy"), Type.Literal("earthlike"), Type.Literal("water-heavy")],
  {
    default: "earthlike",
    description:
      "Controls map water coverage posture (land-heavy/earthlike/water-heavy) by applying a deterministic delta to hypsometry targets.",
  }
);

const MorphologyCoastRuggednessKnobSchema = Type.Union(
  [Type.Literal("smooth"), Type.Literal("normal"), Type.Literal("rugged")],
  {
    default: "normal",
    description:
      "Controls coastline shape posture (smooth/normal/rugged) by applying deterministic multipliers over bay/fjord carving parameters.",
  }
);

const SubstrateConfigSchema = Type.Object(
  {
    continentalBaseErodibility: Type.Number({
      description:
        "Controls baseline erodibility for continental crust tiles used by terrain incision.",
      default: 0.45,
      minimum: 0,
      maximum: 1,
    }),
    oceanicBaseErodibility: Type.Number({
      description:
        "Controls baseline erodibility for oceanic crust tiles used by terrain incision.",
      default: 0.35,
      minimum: 0,
      maximum: 1,
    }),
    continentalBaseSediment: Type.Number({
      description: "Controls baseline sediment depth proxy for continental crust tiles.",
      default: 0.15,
      minimum: 0,
      maximum: 1,
    }),
    oceanicBaseSediment: Type.Number({
      description: "Controls baseline sediment depth proxy for oceanic crust tiles.",
      default: 0.25,
      minimum: 0,
      maximum: 1,
    }),
    ageErodibilityReduction: Type.Number({
      description:
        "Controls how strongly crust age reduces erodibility in terrain substrates (0..1).",
      default: 0.25,
      minimum: 0,
      maximum: 1,
    }),
    ageSedimentBoost: Type.Number({
      description:
        "Controls how strongly crust age raises sediment depth in terrain substrates (0..1).",
      default: 0.15,
      minimum: 0,
      maximum: 1,
    }),
    upliftErodibilityBoost: Type.Number({
      description: "Controls uplift-driven erodibility boost for rugged terrain substrates.",
      default: 0.3,
      minimum: 0,
      maximum: 4,
    }),
    riftSedimentBoost: Type.Number({
      description: "Controls rift-driven sediment depth boost for terrain substrates.",
      default: 0.2,
      minimum: 0,
      maximum: 4,
    }),
    convergentBoundaryErodibilityBoost: Type.Number({
      description: "Controls convergent-boundary erodibility boost from boundary closeness (0..1).",
      default: 0.12,
      minimum: 0,
      maximum: 4,
    }),
    divergentBoundaryErodibilityBoost: Type.Number({
      description: "Controls divergent-boundary erodibility boost from boundary closeness (0..1).",
      default: 0.18,
      minimum: 0,
      maximum: 4,
    }),
    transformBoundaryErodibilityBoost: Type.Number({
      description: "Controls transform-boundary erodibility boost from boundary closeness (0..1).",
      default: 0.08,
      minimum: 0,
      maximum: 4,
    }),
    convergentBoundarySedimentBoost: Type.Number({
      description: "Controls convergent-boundary sediment boost from boundary closeness (0..1).",
      default: 0.05,
      minimum: 0,
      maximum: 4,
    }),
    divergentBoundarySedimentBoost: Type.Number({
      description: "Controls divergent-boundary sediment boost from boundary closeness (0..1).",
      default: 0.1,
      minimum: 0,
      maximum: 4,
    }),
    transformBoundarySedimentBoost: Type.Number({
      description: "Controls transform-boundary sediment boost from boundary closeness (0..1).",
      default: 0.03,
      minimum: 0,
      maximum: 4,
    }),
  },
  {
    additionalProperties: false,
    description: "Substrate controls for terrain erodibility and sediment baselines.",
  }
);

const LandmaskConfigSchema = Type.Object(
  {
    continentPotentialGrain: Type.Integer({
      default: 4,
      minimum: 1,
      maximum: 64,
      description:
        "Controls coarse grain (hex bin size) used to low-pass map continent potential before thresholding.",
    }),
    continentPotentialBlurSteps: Type.Integer({
      default: 4,
      minimum: 0,
      maximum: 16,
      description:
        "Controls hex-neighborhood blur passes applied after coarse-grain continent averaging.",
    }),
    keepLandComponentFraction: Type.Number({
      default: 0.985,
      minimum: 0.5,
      maximum: 1,
      description:
        "Controls fraction of land tiles to keep by retaining the largest connected map components.",
    }),
    cratonStepsPerEra: Type.Integer({
      default: 2,
      minimum: 0,
      maximum: 8,
      description:
        "Controls craton-growth simulation steps per tectonic era (0 disables rift-driven growth).",
    }),
    cratonNucleationScale: Type.Number({
      default: 0.9,
      minimum: 0,
      maximum: 3,
      description:
        "Controls rift/fracture-driven craton nucleation rate for map continent stability.",
    }),
    cratonDiffusion: Type.Number({
      default: 0.25,
      minimum: 0,
      maximum: 1,
      description:
        "Controls per-step craton mass diffusion that merges/advects continent seeds over time.",
    }),
    cratonAdvection: Type.Number({
      default: 0.15,
      minimum: 0,
      maximum: 1,
      description:
        "Per-step advection rate moving craton mass along plate movement vectors (approximates drift).",
    }),
    cratonHalfSaturation: Type.Number({
      default: 0.35,
      minimum: 0.01,
      maximum: 10,
      description:
        "Controls half-saturation used to normalize craton mass into 0..1 without hard clamping.",
    }),
    cratonPotentialWeight: Type.Number({
      default: 0.12,
      minimum: 0,
      maximum: 1,
      description:
        "Controls weight of rift/fracture-driven craton mass in the final continent potential.",
    }),
  },
  {
    additionalProperties: false,
    description:
      "Landmask shaping controls. Landmask is derived from Foundation crust truth + provenance stability (continent potential), not from noise-first thresholding.",
  }
);

/**
 * Morphology-coasts knobs (seaLevel/coastRuggedness).
 * Knobs apply after defaulted step config as deterministic transforms.
 * The shelfWidth knob moved to the morphology-shelf stage with the shelf computation.
 */
/**
 * Base relief shaping controls (tectonic expression into elevation).
 */
const ReliefConfigSchema = Type.Object(
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
      description:
        "Controls blend factor for smoothing crust edges before terrain relief is published (0..1).",
      default: 0.45,
      minimum: 0,
      maximum: 1,
    }),
    /** Amplitude of base noise injected into crust elevations (0..1). */
    crustNoiseAmplitude: Type.Number({
      description:
        "Controls amplitude of base noise injected into crust elevations for map relief variation (0..1).",
      default: 0.1,
      minimum: 0,
      maximum: 1,
    }),
    /** Baseline elevation for continental crust (normalized units). */
    continentalHeight: Type.Number({
      description:
        "Controls baseline map elevation for continental crust in normalized relief units.",
      default: 0.32,
      minimum: -2,
      maximum: 2,
    }),
    /** Baseline elevation for oceanic crust (normalized units). */
    oceanicHeight: Type.Number({
      description: "Controls baseline map elevation for oceanic crust in normalized relief units.",
      default: -0.55,
      minimum: -2,
      maximum: 2,
    }),
    /** Tectonic weighting used while shaping base topography. */
    tectonics: Type.Object(
      {
        interiorNoiseWeight: Type.Number({
          description: "Controls plate-interior terrain noise weight in base topography.",
          default: 0.5,
          minimum: 0,
          maximum: 10,
        }),
        boundaryArcWeight: Type.Number({
          description: "Controls convergent boundary uplift arc weight in base terrain relief.",
          default: 0.55,
          minimum: 0,
          maximum: 10,
        }),
        boundaryArcNoiseWeight: Type.Number({
          description: "Controls raggedness injected into tectonic boundary arcs.",
          default: 0.2,
          minimum: 0,
          maximum: 10,
        }),
        fractalGrain: Type.Number({
          description:
            "Controls grain of tectonic fractal noise in terrain relief (higher = finer).",
          default: 4,
          minimum: 1,
          maximum: 64,
        }),
      },
      {
        additionalProperties: false,
        description: "Controls how Foundation tectonic signals become base terrain relief.",
      }
    ),
  },
  {
    additionalProperties: false,
    description:
      "Relief controls for translating Foundation crust and tectonic signals into map terrain elevation.",
  }
);

/**
 * Continental-margin sculpting controls.
 *
 * The profile endpoints are DERIVED from the existing hypsometric scale — the relief datums
 * (oceanicHeight / continentalHeight / elevationScale) are SINGLE-SOURCED from
 * compute-base-topography and reach this op as INPUTS, NOT duplicated here as config — combined
 * with physical RATIOS (the fields below). There are NO foreign magic depths. The sculpt runs
 * before the datum is solved, so it cannot reference sea level; all endpoints are absolute engine
 * int16 elevation derived from crust-type + the input relief datums. All length scales are in
 * tiles and are PHYSICAL properties of the margin (multiplicative postures), never output targets.
 */
const SculptContinentalMarginConfigSchema = Type.Object(
  {
    /**
     * PHYSICAL ratio: crust-relief fraction at the shelf BREAK (the drowned outer continental
     * edge sits near mid-relief). breakElevation = (oceanicHeight + reliefSpan*breakCrustFraction)
     * *elevationScale (datums from input) — derived from the scale, not a tuned depth, not an
     * output target.
     */
    breakCrustFraction: Type.Number({
      default: 0.45,
      minimum: 0,
      maximum: 1,
      description:
        "PHYSICAL ratio: crust-relief fraction at the shelf break (drowned outer continental edge ~ mid-relief). breakElevation = (oceanicHeight + reliefSpan*breakCrustFraction)*elevationScale. Derived, not tuned.",
    }),
    /**
     * PHYSICAL ratio: crust-relief fraction of the apron TOP (the submerged outer continental
     * shelf, above the break but below land). shoreAnchorCeiling = (oceanicHeight +
     * reliefSpan*apronTopCrustFraction)*elevationScale; must exceed breakCrustFraction. The apron
     * staying underwater is held by raise-only + the local submerged-continental anchor + the
     * targetWaterPercent solver intent (empirically verified 0 crossings), NOT by this ceiling as a
     * hard guarantee — the anchor ceiling can equal/exceed the solved sea level.
     */
    apronTopCrustFraction: Type.Number({
      default: 0.62,
      minimum: 0,
      maximum: 1,
      description:
        "PHYSICAL ratio: crust-relief fraction of the apron TOP (submerged outer continental shelf). Shore anchor ceiling = (oceanicHeight + reliefSpan*apronTopCrustFraction)*elevationScale; must exceed breakCrustFraction. Apron stays underwater by raise-only + local anchor + targetWaterPercent intent (empirically verified), not a hard ceiling guarantee.",
    }),
    /**
     * Write-toward blend strength at the break edge (fades to 0 shoreward). Pulls noisy
     * submerged-continental elevation into a coherent apron ramp without overwriting the deep
     * continental interior. A geometry/coherence control, NOT an output target.
     */
    apronBlendStrength: Type.Number({
      default: 0.8,
      minimum: 0,
      maximum: 1,
      description:
        "Write-toward blend strength at the break edge (fades to 0 shoreward). Pulls noisy submerged-continental elevation into a coherent ramp without overwriting deep interior. Geometry control, not an output target.",
    }),
    /**
     * Base apron LENGTH SCALE in tiles for a neutral margin (the gentle continental shelf from
     * the landmass edge out to the break, before margin-physics postures are applied). A
     * physical length, NOT a membership cap: the profile is still evaluated for every oceanic
     * tile; this only sets how far the gentle apron reaches before the break.
     */
    baseApronLengthTiles: Type.Number({
      default: 3,
      minimum: 0,
      maximum: 64,
      description:
        "Base apron length scale (tiles) for a neutral margin: the gentle shelf reach from the landmass edge to the break before margin postures.",
    }),
    /**
     * Active-margin apron multiplier (<1 => narrower). Convergent/transform margins with high
     * boundary closeness subduct/shear steeply and accumulate little shelf — narrow, steep.
     */
    activeApronFactor: Type.Number({
      default: 0.4,
      minimum: 0.05,
      maximum: 4,
      description:
        "Apron length multiplier on active (convergent/transform, high-closeness) margins (<1 => narrower, steeper). Margin physics.",
    }),
    /**
     * Rift (divergent) apron multiplier (<1 => narrower). Young rifts have thin, separated
     * margins with little accumulated apron.
     */
    riftApronFactor: Type.Number({
      default: 0.6,
      minimum: 0.05,
      maximum: 4,
      description:
        "Apron length multiplier on divergent (rift) margins (<1 => narrower). Young rifts carry little apron.",
    }),
    /**
     * Passive-margin apron multiplier (>1 => wider). Trailing-edge passive margins accumulate
     * thick sediment wedges — wide, gentle aprons.
     */
    passiveApronFactor: Type.Number({
      default: 1.5,
      minimum: 0.05,
      maximum: 4,
      description:
        "Apron length multiplier on passive (non-active, non-rift) margins (>1 => wider, gentler). Margin physics.",
    }),
    /**
     * Maximum additional apron widening from crust age on passive margins (multiplicative gain
     * at age=255). Older passive margins have had longer to build out their sediment apron.
     */
    ageApronGain: Type.Number({
      default: 0.6,
      minimum: 0,
      maximum: 4,
      description:
        "Max multiplicative apron widening from crust age on passive margins (applied at age=255). Older passive margins are wider.",
    }),
    /**
     * Maximum additional apron widening from crust buoyancy (multiplicative gain at buoyancy=1).
     * More buoyant crust rides higher and sheds a broader sediment apron.
     */
    buoyancyApronGain: Type.Number({
      default: 0.4,
      minimum: 0,
      maximum: 4,
      description:
        "Max multiplicative apron widening from crust buoyancy (applied at buoyancy=1). More buoyant crust => broader apron.",
    }),
    /**
     * Boundary-closeness (0..1) above which a convergent/transform margin counts as ACTIVE.
     * Below this, even a convergent crust-type margin behaves passively (far from the boundary).
     */
    activeClosenessThreshold: Type.Number({
      default: 0.35,
      minimum: 0,
      maximum: 1,
      description:
        "Boundary closeness (0..1) above which a convergent/transform margin is treated as active.",
    }),
  },
  {
    additionalProperties: false,
    description:
      "Continental-margin sculpting controls: a datum-free profile (submerged-continental apron -> break -> oceanic slope -> abyss) whose endpoints are DERIVED from the hypsometric scale (oceanicHeight/continentalHeight/elevationScale single-sourced from base-topography as inputs + physical ratios). The apron is WRITTEN-TOWARD over continental crust and the slope is CARVED-DOWN over oceanic crust; apron length scale modulated by margin physics. No output-target tuning, no membership caps, no magic depths.",
  }
);

/**
 * Land fraction / hypsometry controls used for sea-level selection.
 */
const HypsometryConfigSchema = Type.Object(
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
        "Controls map water coverage by multiplying targetWaterPercent after the base sea-level posture is chosen.",
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
      description:
        "Controls the minimum share of land allowed inside the boundary closeness band (0..1).",
      default: 0.15,
      minimum: 0,
      maximum: 1,
    }),
    /** Desired share of continental crust when balancing land vs. ocean plates (0..1). */
    continentalFraction: Type.Number({
      default: 0.39,
      description:
        "Continental-crust share constraint when balancing land vs. ocean plates (0..1).",
      minimum: 0,
      maximum: 1,
    }),
  },
  {
    additionalProperties: false,
    description: "Water coverage controls used to choose sea level from terrain hypsometry.",
  }
);

/**
 * Plate-aware weighting for bay/fjord odds based on boundary closeness.
 */
const CoastlinePlateBiasConfigSchema = Type.Object(
  {
    /** Normalized closeness where coastline edits begin to respond to plate boundaries (0..1). */
    threshold: Type.Number({
      description:
        "Controls normalized closeness where coastline edits begin to respond to plate boundaries (0..1).",
      default: 0.45,
      minimum: 0,
      maximum: 1,
    }),
    /**
     * Exponent shaping how quickly bias ramps after the threshold.
     * Values >1 concentrate effects near boundaries; <1 spreads them wider.
     */
    power: Type.Number({
      description:
        "Controls how quickly coastline bias ramps after the threshold; >1 concentrates effects near boundaries.",
      default: 1.25,
      minimum: 0,
      maximum: 8,
    }),
    /** Bias multiplier for convergent boundaries; positive values encourage dramatic coasts and fjords. */
    convergent: Type.Number({
      description:
        "Controls convergent-boundary coastline bias; positive values encourage dramatic coasts and fjords.",
      default: 1.0,
      minimum: -10,
      maximum: 10,
    }),
    /** Bias multiplier for transform boundaries; lower values soften edits along shear zones. */
    transform: Type.Number({
      description:
        "Controls transform-boundary coastline bias; lower values soften edits along shear zones.",
      default: 0.4,
      minimum: -10,
      maximum: 10,
    }),
    /** Bias multiplier for divergent boundaries; negative values discourage ruggedization along rifts. */
    divergent: Type.Number({
      description:
        "Controls divergent-boundary coastline bias; negative values discourage ruggedization along rifts.",
      default: -0.6,
      minimum: -10,
      maximum: 10,
    }),
    /** Residual bias for interior coasts away from boundaries; typically near zero. */
    interior: Type.Number({
      description: "Controls residual coastline bias for interior coasts away from boundaries.",
      default: 0,
      minimum: -10,
      maximum: 10,
    }),
    /** Strength applied to bay denominators; higher values increase bay carving where bias is positive. */
    bayWeight: Type.Number({
      description:
        "Controls bay denominator strength; higher values increase bay carving where bias is positive.",
      default: 0.35,
      minimum: 0,
      maximum: 10,
    }),
    /** Extra noise gate reduction when bias is positive, allowing smaller bays near active margins. */
    bayNoiseBonus: Type.Number({
      description: "Controls extra noise gate reduction for smaller bays near active margins.",
      default: 1.0,
      minimum: 0,
      maximum: 10,
    }),
    /** Strength applied to fjord denominators; higher values create more fjords along favored coasts. */
    fjordWeight: Type.Number({
      description:
        "Controls fjord denominator strength; higher values create more fjords along favored coasts.",
      default: 0.8,
      minimum: 0,
      maximum: 10,
    }),
  },
  {
    additionalProperties: false,
    description: "Controls plate-aware bay and fjord bias for coastline shape.",
  }
);

/**
 * Bay configuration (gentle coastal indentations).
 */
const CoastlineBayConfigSchema = Type.Object(
  {
    /** Extra noise threshold on larger maps; higher values reduce bay frequency while keeping size larger. */
    noiseGateAdd: Type.Number({
      description:
        "Controls extra bay noise threshold on larger maps; higher values reduce bay frequency.",
      default: 0,
      minimum: -1,
      maximum: 1,
    }),
    /** Bay frequency on active margins; lower denominators produce more bays along energetic coasts. */
    rollDenActive: Type.Number({
      description:
        "Controls bay frequency on active margins; lower denominators produce more bays.",
      default: 4,
      minimum: 1,
      maximum: 256,
    }),
    /** Bay frequency on passive margins; lower denominators carve more bays in calm regions. */
    rollDenDefault: Type.Number({
      description:
        "Controls bay frequency on passive margins; lower denominators carve more bays in calm regions.",
      default: 5,
      minimum: 1,
      maximum: 256,
    }),
  },
  {
    additionalProperties: false,
    description: "Controls bay carving frequency and thresholds for coastline shape.",
  }
);

/**
 * Fjord configuration (deep, narrow inlets along steep margins).
 */
const CoastlineFjordConfigSchema = Type.Object(
  {
    /** Base fjord frequency; smaller values increase fjord count across the map. */
    baseDenom: Type.Number({
      description:
        "Controls base fjord frequency; smaller values increase fjord count across the map.",
      default: 12,
      minimum: 1,
      maximum: 256,
    }),
    /** Bonus applied on active convergent margins; subtracts from baseDenom to amplify fjord density. */
    activeBonus: Type.Number({
      description:
        "Controls active-margin fjord bonus; subtracts from baseDenom to amplify fjord density.",
      default: 1,
      minimum: 0,
      maximum: 256,
    }),
    /** Bonus applied on passive shelves; subtracts from baseDenom for gentler fjords. */
    passiveBonus: Type.Number({
      description:
        "Controls passive-shelf fjord bonus; subtracts from baseDenom for gentler fjords.",
      default: 2,
      minimum: 0,
      maximum: 256,
    }),
  },
  {
    additionalProperties: false,
    description: "Controls fjord carving frequency and margin bonuses for coastline shape.",
  }
);

const CoastConfigSchema = Type.Object(
  {
    bay: CoastlineBayConfigSchema,
    fjord: CoastlineFjordConfigSchema,
    plateBias: CoastlinePlateBiasConfigSchema,
  },
  {
    additionalProperties: false,
    description: "Coastline shape controls for bays, fjords, and plate-aware ruggedness.",
  }
);

const knobsSchema = Type.Object(
  {
    seaLevel: MorphologySeaLevelKnobSchema,
    coastRuggedness: MorphologyCoastRuggednessKnobSchema,
  },
  {
    additionalProperties: false,
    description:
      "Morphology-coasts controls for sea level and coast ruggedness applied as deterministic transforms.",
  }
);

const publicSchema = Type.Object(
  {
    substrate: SubstrateConfigSchema,
    relief: ReliefConfigSchema,
    continentalMargin: SculptContinentalMarginConfigSchema,
    waterCoverage: HypsometryConfigSchema,
    continents: LandmaskConfigSchema,
    coastlineShape: CoastConfigSchema,
  },
  {
    additionalProperties: false,
    description:
      "Morphology coast and land/sea shaping controls for substrate, relief, water coverage, continents, and coastline shape.",
  }
);

function defaultEnvelope(config: unknown): { strategy: "default"; config: unknown } {
  return { strategy: "default", config };
}

export default createStage({
  id: "morphology-coasts",
  knobsSchema,
  public: publicSchema,
  steps: orderStandardStageSteps("morphology-coasts", {
    "landmass-plates": landmassPlates,
    "rugged-coasts": ruggedCoasts,
  }),
  compile: ({ config }: { config: Record<string, unknown> }) => ({
    "landmass-plates": {
      beltDrivers: defaultEnvelope({}),
      substrate: defaultEnvelope(config.substrate),
      baseTopography: defaultEnvelope(config.relief),
      sculptContinentalMargin: defaultEnvelope(config.continentalMargin),
      seaLevel: defaultEnvelope(config.waterCoverage),
      landmask: defaultEnvelope(config.continents),
    },
    "rugged-coasts": {
      coastlines: defaultEnvelope({ coast: config.coastlineShape }),
    },
  }),
} as const);
