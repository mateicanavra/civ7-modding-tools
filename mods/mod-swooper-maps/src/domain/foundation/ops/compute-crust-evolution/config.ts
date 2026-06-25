import { type Static, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Per-map-class CHARACTER knobs for crust evolution.
 *
 * These are the author-facing tuning levers that make one map class differ from another — abundance,
 * freeboard, fragmentation, shelf depth. They are deliberately kept SEPARATE from the structural
 * physics (the mechanism + couplings live as constants in `index.ts` and hold for every class): a
 * different class is the SAME crust structure with DIFFERENT values here, never a different algorithm.
 * The defaults are the earthlike profile. Each map config may override any subset.
 */
export const CrustEvolutionConfigSchema = Type.Object(
  {
    /**
     * Maturity below which marginal, under-differentiated continental crust founders to oceanic-grade
     * lithosphere. The primary continental-ABUNDANCE control: higher ⇒ only well-differentiated crust
     * survives ⇒ less continental area (ocean-dominated / archipelago); lower ⇒ marginal crust persists
     * ⇒ more continental area (toward supercontinents). Earthlike ≈ 0.60 → ~45-55% continental crust.
     */
    continentalSurvivalMaturity: Type.Number({
      description:
        "Maturity below which marginal continental crust founders to oceanic. Higher = less land (archipelago); lower = more land (pangaea).",
      default: 0.6,
      minimum: 0.4,
      maximum: 0.85,
    }),
    /**
     * Crustal-thickness step that granitic continental crust gains on differentiating (the
     * granitic/basaltic FREEBOARD dichotomy). Higher ⇒ continents ride higher above sea level with
     * deeper, narrower shelves; lower ⇒ low-lying continents and broad shallow shelves. Interacts with
     * the downstream sea-level / sea-shallowness knob.
     */
    continentalFreeboard: Type.Number({
      description:
        "Isostatic freeboard step of differentiated continental crust. Higher = high-standing continents / narrow deep shelves; lower = low continents / broad shelves.",
      default: 0.35,
      minimum: 0,
      maximum: 0.6,
    }),
    /**
     * Cumulative-extension threshold at which MARGINAL continental crust ruptures to oceanic (cratons
     * resist in proportion to maturity). The FRAGMENTATION control: lower ⇒ continents rift apart into
     * microcontinents and drowned corridors more readily (archipelago / shattered worlds); higher ⇒
     * continents stay coherent (pangaea).
     */
    hyperextensionBreakupBase: Type.Number({
      description:
        "Breakup threshold for marginal continental crust. Lower = more rifting/fragmentation; higher = coherent continents.",
      default: 0.1,
      minimum: 0.02,
      maximum: 0.5,
    }),
    /**
     * Crustal thickness removed from a fully β-thinned passive margin. Sets SHELF DEPTH / the depth of
     * subsided continental lowlands: higher ⇒ deeper, more pronounced shelves and rift basins; lower ⇒
     * shallower shelves hugging the coast.
     */
    thinningThicknessLoss: Type.Number({
      description:
        "Thickness lost by a fully β-thinned margin (shelf depth). Higher = deeper shelves/basins; lower = shallow shelves.",
      default: 0.55,
      minimum: 0,
      maximum: 1,
    }),
    /**
     * ABYSSAL relief: how far the oceanic floor subsides away from the continental margin (the
     * age/distance-from-ridge → depth relationship — passive margins shallow, abyssal plains deep).
     * This is what gives ocean basins a real margin→abyss profile (shelf → continental slope → abyss);
     * the gradient-based shelf classifier (compute-shelf-mask) needs that offshore deepening to read a
     * continental slope, otherwise a flat oceanic floor floods the whole basin as shelf. Higher ⇒
     * deeper, more dominant open ocean with a narrower shelf fringe; 0 ⇒ a flat floor (shelf-heavy).
     */
    oceanicAbyssalDepth: Type.Number({
      description:
        "Abyssal subsidence of oceanic floor with distance from the continental margin (deep-ocean relief). Higher = deeper, more dominant open ocean / thinner shelf fringe; 0 = flat floor (shelf-heavy).",
      default: 0.75,
      minimum: 0,
      maximum: 1,
    }),
  },
  {
    additionalProperties: false,
    description:
      "Per-map-class character knobs for foundation/compute-crust-evolution (abundance, freeboard, fragmentation, shelf depth, abyssal relief). Defaults are the earthlike profile.",
  }
);

export type CrustEvolutionConfig = Static<typeof CrustEvolutionConfigSchema>;
