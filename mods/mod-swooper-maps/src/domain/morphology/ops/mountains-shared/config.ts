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
   * Hard cap on hill tile coverage, expressed as a fraction of *land* tiles (0..1).
   *
   * Hills represent foothills, uplifted rift shoulders, and worn-down ranges.
   * This cap prevents hills from becoming a planet-wide fill when broad driver
   * fields exist, while still allowing active margins to be rugged.
   */
  hillMaxFraction: Type.Number({
    description: "Hard cap on hill coverage as a fraction of land tiles (0..1).",
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
    description:
      "Expansion radius (hex steps) around ridge spines to form the final mountain mask.",
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
    description:
      "Score threshold for promoting a tile to a mountain; lower values allow more peaks.",
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
    description:
      "Weight applied to uplift potential; keeps mountains aligned with convergent zones.",
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
    description:
      "Stress contribution to transform/transpressional orogeny potential (unitless weight).",
    default: 0.4,
    minimum: 0,
  }),
  orogenyDivergentRiftWeight: Type.Number({
    description:
      "Rift contribution to divergent (rift-shoulder) orogeny potential (unitless weight).",
    default: 0.55,
    minimum: 0,
  }),
  orogenyDivergentStressWeight: Type.Number({
    description:
      "Stress contribution to divergent (rift-shoulder) orogeny potential (unitless weight).",
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
    description:
      "Depression severity along divergent boundaries (0..1); higher values carve deeper rifts.",
    default: 0.2,
    minimum: 0,
    maximum: 1,
  }),
  /** Additional weight from plate-boundary closeness that pulls mountains toward margins. */
  boundaryWeight: Type.Number({
    description:
      "Additional weight from plate-boundary closeness that pulls mountains toward margins.",
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
    description:
      "Exponent controlling how quickly boundary influence decays with distance (>=0.25).",
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
    description:
      "Penalty multiplier applied along divergent boundaries before riftDepth is carved.",
    default: 1.0,
    minimum: 0,
  }),
  /** Hill weight contributed by boundary closeness, forming foothill skirts near margins. */
  hillBoundaryWeight: Type.Number({
    description:
      "Hill weight contributed by boundary closeness, forming foothill skirts near margins.",
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
    description:
      "Extra foothill weight on convergent tiles to smooth transitions into mountain ranges.",
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
    description:
      "Residual uplift contribution applied to hills so basins and foothills stay balanced.",
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
