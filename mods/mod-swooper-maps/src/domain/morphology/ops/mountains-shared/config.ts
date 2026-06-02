import { Type, type Static } from "@swooper/mapgen-core/authoring";

/**
 * Mountain-family placement tuning driven by foundation physics.
 *
 * This intentionally remains one full family schema for both ridge and foothill
 * ops. The invariant is that mountains and hills are two classes from one
 * terrain-classification posture; authors must not tune a separate hill world
 * beside a separate mountain world. The morphology-features step enforces equal
 * ridge/foothill selections before applying semantic knobs.
 */
export const MountainsConfigSchema = Type.Object({
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
    description: "Controls hard cap on mountain terrain coverage as a fraction of land tiles (0..1).",
    default: 0.07,
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
    maximum: 12,
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
  /** Score threshold for promoting a tile to a mountain; lower values allow more peaks. */
  mountainThreshold: Type.Number({
    description:
      "Controls score threshold for promoting a map tile to mountain terrain.",
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
    description:
      "Controls rift contribution to divergent rift-shoulder terrain potential.",
    default: 0.55,
    minimum: 0,
    maximum: 10,
  }),
  orogenyDivergentStressWeight: Type.Number({
    description:
      "Controls stress contribution to divergent rift-shoulder terrain potential.",
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
    description: "Controls additive weight for convergent tiles, creating dominant orogeny ridges.",
    default: 1.0,
    minimum: 0,
    maximum: 10,
  }),
  /** Penalty multiplier for transform boundaries to soften shearing ridges. */
  transformPenalty: Type.Number({
    description: "Controls penalty multiplier for transform boundaries to soften shearing ridges.",
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
    description:
      "Controls hill terrain weight contributed by boundary closeness near margins.",
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
}, {
  additionalProperties: false,
  description: "Mountain-range controls for shared ridge, foothill, rough-land terrain classification.",
});

export type MountainsConfig = Static<typeof MountainsConfigSchema>;

type MountainFamilySelection = Readonly<{
  strategy?: unknown;
  config?: unknown;
}>;

function stableConfigString(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableConfigString).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableConfigString(item)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

/**
 * Enforces the mountain-family invariant at the stage boundary. Both ops accept
 * the same family config schema because their thresholds and caps describe one
 * terrain-classification policy; divergent per-op configs would recreate the
 * mixed-owner bucket this shared surface is meant to avoid.
 */
export function assertSameMountainFamilySelection(
  ridges: MountainFamilySelection,
  foothills: MountainFamilySelection
): void {
  if (ridges.strategy !== foothills.strategy) {
    throw new Error(
      `[Morphology] Mountain-family config requires identical ridge/foothill strategies (ridges=${String(ridges.strategy)}, foothills=${String(foothills.strategy)}).`
    );
  }
  const ridgeConfig = stableConfigString(ridges.config ?? {});
  const foothillConfig = stableConfigString(foothills.config ?? {});
  if (ridgeConfig !== foothillConfig) {
    throw new Error(
      "[Morphology] Mountain-family config requires identical ridge/foothill config; tune the shared terrain-classification posture once, not as divergent op-local worlds."
    );
  }
}
