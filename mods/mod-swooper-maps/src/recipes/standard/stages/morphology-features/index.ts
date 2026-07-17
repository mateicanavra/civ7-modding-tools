import { createStage, Type } from "@swooper/mapgen-core/authoring";
import { orderStandardStageSteps } from "../../contract-manifest.js";
import { islands, landmasses, mountains, volcanoes } from "./steps/index.js";

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, value));
}

function clampInt(value: number, min: number, max: number): number {
  return Math.round(clamp(value, min, max)) | 0;
}

function publicNumber(value: unknown, fallback: number, min: number, max: number): number {
  return typeof value === "number" ? clamp(value, min, max) : fallback;
}

function publicInteger(value: unknown, fallback: number, min: number, max: number): number {
  return typeof value === "number" ? clampInt(value, min, max) : fallback;
}

const MountainRangesPublicSchema = Type.Object(
  {
    tectonicActivity: Type.Number({
      default: 1.0,
      minimum: 0,
      maximum: 3,
      description:
        "Controls how strongly collision, subduction, rift, and shear fields express as raised terrain.",
    }),
    rangeSystemSpacingTiles: Type.Number({
      default: 20,
      minimum: 4,
      maximum: 80,
      description:
        "Controls mean tile spacing between major mountain-range systems; map area scales how many systems appear.",
    }),
    rangeSystemLengthTiles: Type.Number({
      default: 22,
      minimum: 4,
      maximum: 80,
      description:
        "Controls target longitudinal span for major mountain-range systems; Large maps use this as the baseline and other sizes scale by map area.",
    }),
    provinceRadiusTiles: Type.Integer({
      default: 4,
      minimum: 0,
      maximum: 12,
      description:
        "Controls the radius of each orographic province, including peaks, passes, valleys, foothills, and basin margins.",
    }),
    ridgeWidthTiles: Type.Integer({
      default: 1,
      minimum: 0,
      maximum: 4,
      description:
        "Controls how wide peak and ridge-spine terrain can grow inside each orographic province.",
    }),
    foothillExtentTiles: Type.Integer({
      default: 3,
      minimum: 0,
      maximum: 12,
      description: "Controls how far foothill and high-pass terrain can spread from ridge spines.",
    }),
    interiorHighlandExpression: Type.Number({
      default: 0.55,
      minimum: 0,
      maximum: 2,
      description:
        "Controls old uplands, plateaus, and rolling highlands away from active mountain spines.",
    }),
    terrainTextureFractalMix: Type.Number({
      default: 0.45,
      minimum: 0,
      maximum: 1,
      description:
        "Controls fractal texture in hills, ridges, and rough lands; higher values make terrain more broken and locally varied.",
    }),
    erosionMaturity: Type.Number({
      default: 0.45,
      minimum: 0,
      maximum: 1,
      description:
        "Controls how much older belts soften from sharp peaks into hills, passes, and settled valleys.",
    }),
    tectonicSignalSensitivity: Type.Number({
      default: 1.0,
      minimum: 0,
      maximum: 2,
      description:
        "Controls how readily moderate tectonic driver fields can seed terrain expression.",
    }),
  },
  {
    additionalProperties: false,
    description:
      "Controls mountain ranges as physical orographic provinces rather than raw terrain-tile outputs.",
  }
);

function resolveMountainRangesPublicConfig(value: unknown) {
  const config = value && typeof value === "object" ? (value as Record<string, unknown>) : {};

  const tectonicActivity = publicNumber(config.tectonicActivity, 1.0, 0, 3);
  const rangeSystemSpacingTiles = publicNumber(config.rangeSystemSpacingTiles, 20, 4, 80);
  const rangeSystemLengthTiles = publicNumber(config.rangeSystemLengthTiles, 22, 4, 80);
  const provinceRadiusTiles = publicInteger(config.provinceRadiusTiles, 4, 0, 12);
  const ridgeWidthTiles = publicInteger(config.ridgeWidthTiles, 1, 0, 4);
  const foothillExtentTiles = publicInteger(config.foothillExtentTiles, 3, 0, 12);
  const interiorHighlandExpression = publicNumber(config.interiorHighlandExpression, 0.55, 0, 2);
  const terrainTextureFractalMix = publicNumber(config.terrainTextureFractalMix, 0.45, 0, 1);
  const erosionMaturity = publicNumber(config.erosionMaturity, 0.45, 0, 1);
  const tectonicSignalSensitivity = publicNumber(config.tectonicSignalSensitivity, 1.0, 0, 2);

  const ridgeWidthScale = ridgeWidthTiles / 4;
  const foothillScale = foothillExtentTiles / 12;
  const provinceScale = provinceRadiusTiles / 12;
  const activityScale = tectonicActivity / 3;

  const mountainMaxFraction = clamp(
    0.035 + tectonicActivity * 0.047 + ridgeWidthTiles * 0.012,
    0,
    0.18
  );
  const mountainMinFraction = clamp(
    Math.min(mountainMaxFraction * 0.75, 0.018 + tectonicActivity * 0.035 + ridgeWidthTiles * 0.01),
    0,
    mountainMaxFraction
  );
  const hillMaxFraction = clamp(
    0.14 + foothillExtentTiles * 0.016 + interiorHighlandExpression * 0.075,
    0,
    0.42
  );
  const foothillMaxFraction = clamp(
    0.045 + foothillExtentTiles * 0.012 + tectonicActivity * 0.006,
    0,
    hillMaxFraction
  );
  const roughLandMaxFraction = clamp(
    0.025 + interiorHighlandExpression * 0.045 + terrainTextureFractalMix * 0.025,
    0,
    Math.max(0, hillMaxFraction - foothillMaxFraction * 0.35)
  );

  return {
    tectonicIntensity: clamp(tectonicActivity, 0, 10),
    driverSignalByteMin: clampInt(
      30 - tectonicSignalSensitivity * 16 - tectonicActivity * 2,
      0,
      255
    ),
    driverExponent: clamp(1.24 - tectonicSignalSensitivity * 0.3, 0.35, 2),
    mountainMaxFraction,
    mountainMinFraction,
    hillMaxFraction,
    mountainSpineFraction: clamp(0.01 + ridgeWidthScale * 0.045 + activityScale * 0.035, 0, 0.12),
    mountainRangeSpacingTiles: rangeSystemSpacingTiles,
    mountainRangeLengthTiles: rangeSystemLengthTiles,
    mountainRegionRadiusTiles: provinceRadiusTiles,
    mountainSpineDilationSteps: ridgeWidthTiles,
    mountainShoulderThresholdScale: clamp(
      0.58 - ridgeWidthTiles * 0.09 - tectonicActivity * 0.04,
      0.22,
      0.7
    ),
    mountainSpineMinDistance: clampInt(
      Math.max(ridgeWidthTiles * 2 + 1, rangeSystemSpacingTiles * 0.28),
      0,
      32
    ),
    oldBeltMountainScale: clamp(0.92 - erosionMaturity * 0.42, 0.35, 0.94),
    oldBeltHillScale: clamp(1.0 + erosionMaturity * 0.32, 1.0, 1.6),
    foothillMaxDistance: foothillExtentTiles,
    foothillMinFraction: clamp(
      0.012 + foothillExtentTiles * 0.006 + tectonicActivity * 0.002,
      0,
      foothillMaxFraction
    ),
    foothillMaxFraction,
    mountainThreshold: clamp(
      0.44 - tectonicActivity * 0.13 - tectonicSignalSensitivity * 0.04 - ridgeWidthTiles * 0.02,
      0.06,
      1.2
    ),
    hillThreshold: clamp(
      0.28 -
        tectonicActivity * 0.05 -
        interiorHighlandExpression * 0.04 -
        terrainTextureFractalMix * 0.05,
      0.08,
      1.2
    ),
    upliftWeight: clamp(0.28 + tectonicActivity * 0.12, 0, 10),
    fractalWeight: clamp(0.14 + terrainTextureFractalMix * 0.52, 0, 10),
    orogenyCollisionStressWeight: clamp(0.58 + tectonicActivity * 0.06, 0, 10),
    orogenyCollisionUpliftWeight: clamp(0.36 + tectonicActivity * 0.08, 0, 10),
    orogenyTransformStressWeight: clamp(0.28 + terrainTextureFractalMix * 0.32, 0, 10),
    orogenyDivergentRiftWeight: clamp(0.42 + tectonicActivity * 0.08, 0, 10),
    orogenyDivergentStressWeight: clamp(0.1 + terrainTextureFractalMix * 0.12, 0, 10),
    fractureBoundaryWeight: clamp(0.62 + provinceScale * 0.32, 0, 10),
    fractureStressWeight: clamp(0.18 + terrainTextureFractalMix * 0.22, 0, 10),
    fractureRiftWeight: clamp(0.09 + tectonicActivity * 0.04, 0, 10),
    mountainCollisionStressWeight: clamp(0.44 + tectonicActivity * 0.08, 0, 10),
    mountainCollisionUpliftWeight: clamp(0.42 + tectonicActivity * 0.1, 0, 10),
    mountainSubductionUpliftWeight: clamp(0.2 + tectonicActivity * 0.09, 0, 10),
    mountainInteriorUpliftScale: clamp(0.12 + interiorHighlandExpression * 0.09, 0, 10),
    mountainFractalScale: clamp(0.24 + terrainTextureFractalMix * 0.5, 0, 10),
    mountainConvergenceFractalBase: clamp(0.68 - terrainTextureFractalMix * 0.3, 0, 10),
    mountainConvergenceFractalSpan: clamp(0.32 + terrainTextureFractalMix * 0.3, 0, 10),
    riftDepth: clamp(0.16 + erosionMaturity * 0.14, 0, 1),
    boundaryWeight: clamp(0.78 + tectonicActivity * 0.18 + provinceScale * 0.3, 0, 10),
    boundaryGate: clamp(0.13 - tectonicSignalSensitivity * 0.07 - tectonicActivity * 0.02, 0, 0.99),
    boundaryExponent: clamp(
      1.78 - provinceRadiusTiles * 0.11 - tectonicSignalSensitivity * 0.12,
      0.25,
      10
    ),
    rangeEnvelopeScale: clamp(1 + provinceRadiusTiles * 0.13 + tectonicActivity * 0.22, 0.25, 4),
    interiorPenaltyWeight: clamp(
      0.24 - interiorHighlandExpression * 0.11 + ridgeWidthScale * 0.04,
      0,
      10
    ),
    convergenceBonus: clamp(0.72 + tectonicActivity * 0.27, 0, 10),
    transformPenalty: clamp(
      0.78 - terrainTextureFractalMix * 0.18 - tectonicActivity * 0.02,
      0,
      10
    ),
    riftPenalty: clamp(0.95 + erosionMaturity * 0.12, 0, 10),
    hillBoundaryWeight: clamp(0.34 + foothillExtentTiles * 0.045, 0, 10),
    hillRiftBonus: clamp(0.18 + foothillScale * 0.28 + terrainTextureFractalMix * 0.08, 0, 10),
    hillFoothillBase: clamp(0.4 + foothillScale * 0.32, 0, 10),
    hillFoothillFractalGain: clamp(0.42 + terrainTextureFractalMix * 1.1, 0, 10),
    hillConvergentFoothill: clamp(0.3 + foothillExtentTiles * 0.055, 0, 10),
    hillInteriorFalloff: clamp(
      0.26 - interiorHighlandExpression * 0.1 - terrainTextureFractalMix * 0.03,
      0,
      10
    ),
    hillUpliftWeight: clamp(0.18 + interiorHighlandExpression * 0.17, 0, 10),
    hillFractalScale: clamp(0.62 + terrainTextureFractalMix * 0.9, 0, 10),
    hillUpliftScale: clamp(0.28 + interiorHighlandExpression * 0.48, 0, 10),
    hillRiftBonusScale: clamp(0.42 + terrainTextureFractalMix * 0.34, 0, 10),
    hillRiftDepthScale: clamp(0.55 - terrainTextureFractalMix * 0.26, 0, 10),
    roughLandMaxFraction,
    roughLandFractalFloor: clamp(0.55 - terrainTextureFractalMix * 0.52, 0, 10),
    roughLandFractalGain: clamp(0.62 + terrainTextureFractalMix * 1.05, 0, 10),
    roughLandInteriorScale: clamp(0.54 + interiorHighlandExpression * 0.56, 0, 10),
  };
}

export type MorphologyOrogenyKnob = "low" | "normal" | "high";

export type MorphologyVolcanismKnob = "low" | "normal" | "high";

const MorphologyOrogenyKnobSchema = Type.Union(
  [Type.Literal("low"), Type.Literal("normal"), Type.Literal("high")],
  {
    default: "normal",
    description:
      "Controls mountain terrain posture (low/normal/high) by applying deterministic transforms over mountain planning thresholds and intensity.",
  }
);

const MorphologyVolcanismKnobSchema = Type.Union(
  [Type.Literal("low"), Type.Literal("normal"), Type.Literal("high")],
  {
    default: "normal",
    description:
      "Controls map volcano feature posture (low/normal/high) by applying deterministic transforms over volcano plan weights and density.",
  }
);

/**
 * Morphology-features owns landform intent before map projection. Volcanism
 * tunes volcano intent; orogeny tunes ridge/foothill/rough-land intent before
 * map-morphology stamps terrain.
 */
/**
 * Island chain placement using deterministic noise and volcanism signals.
 */
const IslandsConfigSchema = Type.Object(
  {
    /** Noise cutoff for island seeds (percent). Higher values mean fewer, larger island groups. */
    fractalThresholdPercent: Type.Number({
      description:
        "Controls noise cutoff for map island seeds; higher values mean fewer, larger island groups.",
      default: 90,
      minimum: 0,
      maximum: 100,
    }),
    /** Minimum spacing from continental landmasses (tiles) to prevent coastal clutter. */
    minDistFromLandRadius: Type.Number({
      description:
        "Controls minimum spacing from continental landmasses to prevent coastal island clutter.",
      default: 2,
      minimum: 0,
      maximum: 128,
    }),
    /**
     * Island frequency near active margins.
     * Lower denominators spawn more volcanic arcs like Japan.
     */
    baseIslandDenNearActive: Type.Number({
      description:
        "Controls island frequency near active margins; lower denominators spawn more volcanic arcs.",
      default: 5,
      minimum: 1,
      maximum: 256,
    }),
    /** Island frequency away from active margins; controls interior archipelagos. */
    baseIslandDenElse: Type.Number({
      description:
        "Controls island frequency away from active margins and shapes interior archipelagos.",
      default: 7,
      minimum: 1,
      maximum: 256,
    }),
    /**
     * Island seed frequency along volcanism signals.
     * Smaller values create Hawaii-style chains.
     */
    hotspotSeedDenom: Type.Number({
      description:
        "Controls island seed frequency along volcanism signals; smaller values create hotspot chains.",
      default: 2,
      minimum: 1,
      maximum: 256,
    }),
    /** Maximum tiles per island cluster to cap archipelago size (tiles). */
    clusterMax: Type.Number({
      description: "Controls maximum tiles per island cluster to cap archipelago size.",
      default: 3,
      minimum: 1,
      maximum: 256,
    }),
    /** Chance of spawning larger microcontinent chains outside major margins (0..1). */
    microcontinentChance: Type.Number({
      description:
        "Controls chance of spawning larger microcontinent island chains outside major margins (0..1).",
      default: 0,
      minimum: 0,
      maximum: 1,
    }),
  },
  {
    additionalProperties: false,
    description: "Controls deterministic island chain placement and archipelago sizing.",
  }
);

/**
 * Volcano placement controls combining plate-aware arcs and hotspot trails.
 */
const VolcanoesConfigSchema = Type.Object(
  {
    /** Master toggle for volcano placement. */
    enabled: Type.Boolean({
      description: "Controls whether map volcano placement is enabled.",
      default: true,
    }),
    /** Baseline volcanoes per land tile; higher density spawns more vents overall. */
    baseDensity: Type.Number({
      description:
        "Controls baseline volcanoes per land tile; higher density spawns more vents overall.",
      default: 1 / 170,
      minimum: 0,
      maximum: 1,
    }),
    /** Minimum Euclidean distance between volcanoes in tiles to avoid clusters merging. */
    minSpacing: Type.Number({
      description: "Controls minimum distance between map volcanoes to avoid clusters merging.",
      default: 3,
      minimum: 0,
      maximum: 128,
    }),
    /** Plate-boundary closeness threshold (0..1) for treating a tile as margin-adjacent. */
    boundaryThreshold: Type.Number({
      description:
        "Controls plate-boundary closeness threshold for treating a tile as margin-adjacent (0..1).",
      default: 0.35,
      minimum: 0,
      maximum: 1,
    }),
    /** Base weight applied to tiles within the boundary band, biasing arcs over interiors. */
    boundaryWeight: Type.Number({
      description:
        "Controls base volcano weight applied to tiles within the boundary band, biasing arcs over interiors.",
      default: 1.2,
      minimum: 0,
      maximum: 10,
    }),
    /** Weight multiplier for convergent boundaries; raises classic arc volcano density. */
    convergentMultiplier: Type.Number({
      description: "Controls convergent-boundary volcano multiplier for classic arc density.",
      default: 2.4,
      minimum: 0,
      maximum: 10,
    }),
    /** Weight multiplier for transform boundaries; typically lower to avoid shear volcanism. */
    transformMultiplier: Type.Number({
      description:
        "Controls transform-boundary volcano multiplier; typically lower to avoid shear volcanism.",
      default: 1.1,
      minimum: 0,
      maximum: 10,
    }),
    /** Weight multiplier for divergent boundaries; keep small to prevent rift volcanism dominating. */
    divergentMultiplier: Type.Number({
      description:
        "Controls divergent-boundary volcano multiplier; keep small to prevent rift volcanism dominating.",
      default: 0.35,
      minimum: 0,
      maximum: 10,
    }),
    /** Weight contribution for interior hotspots; increases inland/shield volcano presence. */
    hotspotWeight: Type.Number({
      description:
        "Controls interior hotspot volcano weight; increases inland/shield volcano presence.",
      default: 0.12,
      minimum: 0,
      maximum: 10,
    }),
    /** Penalty applied using shield stability; higher values suppress volcanoes on ancient cratons. */
    shieldPenalty: Type.Number({
      description:
        "Controls shield-stability penalty; higher values suppress volcanoes on ancient cratons.",
      default: 0.6,
      minimum: 0,
      maximum: 1,
    }),
    /** Random additive jitter per tile to break up deterministic patterns. */
    randomJitter: Type.Number({
      description:
        "Controls additive map jitter per tile to break up deterministic volcano patterns.",
      default: 0.08,
      minimum: 0,
      maximum: 10,
    }),
    /** Minimum volcano count target to guarantee a few vents even on sparse maps. */
    minVolcanoes: Type.Number({
      description: "Controls minimum volcano count target to guarantee vents even on sparse maps.",
      default: 5,
      minimum: 0,
      maximum: 1000,
    }),
    /** Maximum volcano count cap; accepted nonpositive values disable the cap. */
    maxVolcanoes: Type.Number({
      description:
        "Controls maximum volcano count cap; accepted values from -1000 through 0 disable the cap and allow density-driven totals.",
      default: 40,
      minimum: -1000,
      maximum: 1000,
    }),
  },
  {
    additionalProperties: false,
    description: "Volcano controls for plate-aware arcs, hotspots, spacing, and count caps.",
  }
);

const knobsSchema = Type.Object(
  {
    orogeny: MorphologyOrogenyKnobSchema,
    volcanism: MorphologyVolcanismKnobSchema,
  },
  {
    additionalProperties: false,
    description:
      "Morphology-features controls for orogeny and volcanism applied as deterministic transforms.",
  }
);

const publicSchema = Type.Object(
  {
    islandChains: IslandsConfigSchema,
    mountainRanges: MountainRangesPublicSchema,
    volcanoes: VolcanoesConfigSchema,
  },
  {
    additionalProperties: false,
    description:
      "Morphology landform intent controls for island chains, mountain ranges, volcanoes, and landmass summaries.",
  }
);

function defaultEnvelope(config: unknown): { strategy: "default"; config: unknown } {
  return { strategy: "default", config };
}

/**
 * Orders post-erosion island, mountain, and volcano intent before decomposing
 * the final landmask, keeping landform planning ahead of shelf and projection.
 */
export default createStage({
  id: "morphology-features",
  knobsSchema,
  public: publicSchema,
  steps: orderStandardStageSteps("morphology-features", {
    islands,
    mountains,
    volcanoes,
    landmasses,
  }),
  compile: ({ config }: { config: Record<string, unknown> }) => {
    const mountainRanges = resolveMountainRangesPublicConfig(config.mountainRanges);
    return {
      islands: {
        islands: defaultEnvelope({ islands: config.islandChains }),
      },
      mountains: {
        ridges: defaultEnvelope(mountainRanges),
        foothills: defaultEnvelope(mountainRanges),
        roughLands: defaultEnvelope(mountainRanges),
      },
      volcanoes: {
        volcanoes: defaultEnvelope(config.volcanoes),
      },
      landmasses: {
        landmasses: defaultEnvelope({}),
      },
    };
  },
} as const);
