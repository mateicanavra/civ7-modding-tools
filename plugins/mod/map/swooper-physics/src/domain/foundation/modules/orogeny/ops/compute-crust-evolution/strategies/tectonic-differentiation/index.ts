import { createStrategy } from "@swooper/mapgen-core/authoring";
import { clamp01, clampU8 } from "@swooper/mapgen-core/lib/math";

import {
  deriveBuoyancy,
  isContinentalMaturity,
  strengthFromMaturity,
  strengthFromThermalAge,
  strengthFromThickness,
} from "../../../../../../model/policy/crust-buoyancy.js";
import ComputeCrustEvolutionContract from "../../contract.js";
import TectonicDifferentiationDefinition from "./config.js";

// ─────────────────────────────────────────────────────────────────────────────────────────────────
// STRUCTURE vs TUNING — kept un-mixed:
//   • The constants below define the fixed normalized model structure: extension, consolidation,
//     freeboard, breakup and their contribution to effective thickness and support. They hold across
//     map classes, but are not independently established universal physical constants. Never tune
//     them to a downstream land/ocean output ratio.
//   • The per-map-class CHARACTER knobs — continental abundance, freeboard, fragmentation, shelf depth —
//     are real author-facing config (see ./contract.ts), read from `config` in the strategy below. A
//     different class (archipelago, pangaea, desert, …) is the SAME structure with DIFFERENT config,
//     never a different algorithm. Do NOT fix a class-tuning miss by bending a STRUCTURE constant.
// ─────────────────────────────────────────────────────────────────────────────────────────────────

// Thickening is driven by differentiated (mature) crust; maturity integrates uplift/volcanism and
// is suppressed by disruption, so a maturity-based mapping keeps thickness coherent with the
// rest of the evolution model.
const THICKNESS_FROM_MATURITY_GAIN = 0.5;

// Baseline damage proxy (normalized weighted sum) coefficients.
const DAMAGE_COEFF_SUM = 0.55 + 0.6 + 0.45;

// Per-era integration coefficients tuned for the actual emitted field magnitudes (typically far below 255
// after weighting + decay), so continental maturity emerges without relying on age-only saturation.
const MATURITY_UPLIFT_INTEGRATION_COEFF = 3.6;
const MATURITY_VOLCANISM_INTEGRATION_COEFF = 0.8;

const DISRUPTION_RIFT_COEFF = 0.45;
const DISRUPTION_SHEAR_COEFF = 0.25;
const DISRUPTION_FRACTURE_COEFF = 0.3;
const MATURITY_DISRUPTION_COEFF = 0.28;

const RIFT_THERMAL_AGE_MUL = 0.4;
const THERMAL_AGE_RIFT_SLOWDOWN = 0.6;

// Quiet-history consolidation increases effective normalized thickness and support. The private
// `cratonRoot01` name denotes this bounded aggregate, not separately measured crust addition or
// mantle volume. An era is a model-history increment, not a calibrated geological duration.
const CRATON_MATURITY_MIN = 0.55; // consolidation begins at the continental threshold
const CRATON_MATURITY_SPAN = 0.15; // full admission by maturity ~0.7
const CRATON_THICKEN_RATE = 0.16; // normalized consolidation increment per fully quiet era

// Existing consolidation accelerates further consolidation, sharpening the high-support phenotype.
const CRATON_KEEL_FEEDBACK = 1.4;

// Cumulative normalized extension is the sum of rift potential gated by continental maturity.
// A fixed threshold maps that history index to effective thinning. This is inspired by stretching,
// but neither a measured beta factor nor an independently calibrated lithospheric threshold.
const THINNING_CONTINENTAL_MIN = 0.4; // extension registers only on continental-grade crust…
const THINNING_CONTINENTAL_SPAN = 0.3; // …reaching full sensitivity by maturity ~0.7
const THIN_CRIT_LO = 0.15; // cumulative extension below which crust recovers (no thinning)
const THIN_CRIT_HI = 0.45; // cumulative extension at/above which the margin is fully thinned
// (shelf depth: `config.thinningThicknessLoss` — thickness removed from a fully-thinned margin)

// The authored continental freeboard step adds effective thickness to mature, unthinned cells.
// It represents the continental/oceanic support contrast, not a measured compositional thickness.
const CONTINENTAL_FREEBOARD_LO = 0.62; // maturity where the step begins — marginally-differentiated…
const CONTINENTAL_FREEBOARD_HI = 0.74; // …(transitional) crust earns little freeboard and forms shallow
//                                        shelves; only well-matured interiors rise to emerged land. The
//                                        onset above the bare continental threshold (0.55) is what splits
//                                        the continental crust into shelf vs land — its internal bimodality.

// The maturity-dependent breakup threshold converts sufficiently extended cells to oceanic grade.
// This categorical model transition changes maturity and age, not a tracked material inventory.
// (fragmentation: `config.hyperextensionBreakupBase` — breakup threshold for marginal crust)
const HYPEREXTENSION_BREAKUP_RESIST = 0.45; // added per unit of cratonic maturity (cratons resist)
const HYPEREXTENSION_RESIST_SPAN = 0.4; // maturity span (above the continental threshold) over which
//                                         breakup resistance ramps from marginal to full cratonic
const HYPEREXTENSION_MATURITY_CAP = 0.1; // residual maturity of newly-rifted oceanic-grade crust

// Low-maturity, unextended cells revert to oceanic grade. Extension protects marginal cells from
// this separate survival rule; the consolidation index is not an input to that decision.
// (abundance: `config.continentalSurvivalMaturity` — maturity below which marginal crust founders)
const SHELF_PRESERVE_EXTENSION = 0.1; // …a stretched margin (high extension) survives as drowned shelf

// The later oceanic pass uses mesh-hop distance from continental cells to shape shelf/abyss support.
// This distance proxy is not physical distance from a ridge or calibrated seafloor age. Its authored
// amplitude and fixed falloff supply a gradient for the downstream shelf classifier.
const ABYSS_DISTANCE_SCALE = 0.8; // mesh-hops over which the continental slope falls toward the abyss

/** Hermite smoothstep in [0,1]; 0 below edge0, 1 above edge1. */
function smoothstep(edge0: number, edge1: number, x: number): number {
  if (edge1 <= edge0) return x >= edge1 ? 1 : 0;
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

/**
 * Differentiates basaltic crust into the mature continental and oceanic state used by morphology.
 * The strategy composes tectonic evidence with buoyancy policy while preserving the initial vintage.
 */
const tectonicDifferentiation = createStrategy(
  ComputeCrustEvolutionContract,
  TectonicDifferentiationDefinition,
  {
    run: (input, config) => {
      // Per-map-class character knobs (defaults = earthlike profile; see ./config.ts).
      const {
        continentalSurvivalMaturity,
        continentalFreeboard,
        hyperextensionBreakupBase,
        thinningThicknessLoss,
        oceanicAbyssalDepth,
      } = config;

      const mesh = input.mesh;
      const cellCount = mesh.cellCount | 0;

      const initialCrust = input.initialCrust;
      const tectonics = input.tectonics;
      const tectonicHistory = input.tectonicHistory;

      const maturity = new Float32Array(cellCount);
      const thickness = new Float32Array(cellCount);
      const thermalAge = new Uint8Array(cellCount);
      const damage = new Uint8Array(cellCount);

      const type = new Uint8Array(cellCount);
      const age = new Uint8Array(cellCount);
      const buoyancy = new Float32Array(cellCount);
      const baseElevation = new Float32Array(cellCount);
      const strength = new Float32Array(cellCount);

      const eras = tectonicHistory.eras;
      const eraCount = eras.length;
      const thermalAgeStep = 1 / eraCount;

      for (let i = 0; i < cellCount; i++) {
        const initThickness = initialCrust.thickness[i] ?? 0.25;

        let maturity01 = 0;
        let thickness01 = clamp01(initThickness);
        let thermalAge01 = 0;
        let cratonRoot01 = 0;
        let extension01 = 0;

        // Baseline damage proxy (existing one-shot formula).
        const fractureTotal01 = clamp01((tectonicHistory.fractureTotal[i] ?? 0) / 255);
        const riftNow01 = clamp01((tectonics.riftPotential[i] ?? 0) / 255);
        const shearNow01 = clamp01((tectonics.shearStress[i] ?? 0) / 255);
        let damage01 = clamp01(
          (0.55 * fractureTotal01 + 0.6 * riftNow01 + 0.45 * shearNow01) / DAMAGE_COEFF_SUM
        );

        for (let e = 0; e < eraCount; e++) {
          const era = eras[e]!;
          const u = clamp01((era.upliftPotential[i] ?? 0) / 255);
          const r = clamp01((era.riftPotential[i] ?? 0) / 255);
          const s = clamp01((era.shearStress[i] ?? 0) / 255);
          const v = clamp01((era.volcanism[i] ?? 0) / 255);
          const f = clamp01((era.fracture[i] ?? 0) / 255);

          // Differentiation increment.
          const headroom = 1 - maturity01;
          maturity01 = clamp01(
            maturity01 +
              MATURITY_UPLIFT_INTEGRATION_COEFF * u * headroom * headroom +
              MATURITY_VOLCANISM_INTEGRATION_COEFF * v * headroom
          );

          // Disruption suppression.
          const disrupt = clamp01(
            DISRUPTION_RIFT_COEFF * r + DISRUPTION_SHEAR_COEFF * s + DISRUPTION_FRACTURE_COEFF * f
          );
          maturity01 = clamp01(maturity01 - MATURITY_DISRUPTION_COEFF * disrupt * maturity01);

          // Damage update.
          damage01 = clamp01(Math.max(damage01, disrupt));

          // Thermal age accrual.
          thermalAge01 = clamp01(
            thermalAge01 + thermalAgeStep * (1 - THERMAL_AGE_RIFT_SLOWDOWN * r)
          );

          // Continental maturity gates cumulative normalized extension; apply thinning/breakup later.
          const continentalness = clamp01(
            (maturity01 - THINNING_CONTINENTAL_MIN) / THINNING_CONTINENTAL_SPAN
          );
          extension01 = clamp01(extension01 + r * continentalness);

          // Prior critical extension suppresses later consolidation, even in a quiet era.
          const unstretched = 1 - smoothstep(THIN_CRIT_LO, THIN_CRIT_HI, extension01);

          // Mature, quiet, unextended histories accumulate the bounded consolidation/support index.
          // No separate material mass, mantle density or physical thickness is integrated here.
          const cratonizing = clamp01((maturity01 - CRATON_MATURITY_MIN) / CRATON_MATURITY_SPAN);
          const quiescence = clamp01(1 - disrupt);
          cratonRoot01 = clamp01(
            cratonRoot01 +
              CRATON_THICKEN_RATE *
                cratonizing *
                quiescence *
                unstretched *
                (1 + CRATON_KEEL_FEEDBACK * cratonRoot01)
          );
        }

        // Map cumulative extension through the fixed normalized thinning thresholds.
        const thinning01 = smoothstep(THIN_CRIT_LO, THIN_CRIT_HI, extension01);

        // Breakup depends on extension and maturity. The separate low-maturity survival rule also
        // uses extension, not root, thickness or a material stability calculation.
        const breakupThreshold =
          hyperextensionBreakupBase +
          HYPEREXTENSION_BREAKUP_RESIST *
            clamp01((maturity01 - CRATON_MATURITY_MIN) / HYPEREXTENSION_RESIST_SPAN);
        const hyperextended = extension01 >= breakupThreshold;
        // Stable, under-differentiated crust founders; a stretched margin (high extension) survives as
        // a drowned shelf even at the same maturity, so foundering does not erase the shelf.
        const foundersStable =
          maturity01 < continentalSurvivalMaturity && extension01 < SHELF_PRESERVE_EXTENSION;
        if (hyperextended || foundersStable) {
          maturity01 = Math.min(maturity01, HYPEREXTENSION_MATURITY_CAP);
          thermalAge01 = thermalAge01 * RIFT_THERMAL_AGE_MUL;
        }

        // Post-breakup maturity admits the freeboard step; thinning attenuates it.
        const continentalFreeboardStep =
          continentalFreeboard *
          smoothstep(CONTINENTAL_FREEBOARD_LO, CONTINENTAL_FREEBOARD_HI, maturity01) *
          (1 - thinning01);

        // Final effective thickness combines initial support, maturity, freeboard, consolidation and
        // thinning after the history loop. This normalized aggregate drives both buoyancy and
        // strength; it is not a measured material column or per-era height integration.
        thickness01 = clamp01(
          initThickness +
            THICKNESS_FROM_MATURITY_GAIN * maturity01 +
            continentalFreeboardStep +
            cratonRoot01 -
            thinningThicknessLoss * thinning01
        );

        maturity[i] = maturity01;
        thickness[i] = thickness01;
        thermalAge[i] = clampU8(thermalAge01 * 255);
        damage[i] = clampU8(damage01 * 255);

        const isContinent = isContinentalMaturity(maturity01) ? 1 : 0;
        type[i] = isContinent;
        age[i] = thermalAge[i];

        const buoy = deriveBuoyancy({
          maturity: maturity01,
          thickness: thickness01,
          thermalAge01,
        });
        buoyancy[i] = buoy;
        baseElevation[i] = buoy;

        const strengthBase = strengthFromThermalAge(thermalAge01);
        const strengthComp = strengthFromMaturity(maturity01);
        const strengthThk = strengthFromThickness(thickness01);
        const strengthDamage = 1 - damage01;
        strength[i] = clamp01(strengthBase * strengthComp * strengthThk * strengthDamage);
      }

      // ── Abyssal subsidence pass ─────────────────────────────────────────────────────────────────
      // Deepen oceanic crust by its geodesic distance (mesh hops) from the nearest continental cell,
      // so the floor falls from the margin shelf to the abyssal plain offshore (see ABYSS_DISTANCE_
      // SCALE / config.oceanicAbyssalDepth above). Without this the reverted-oceanic floor is flat,
      // and the gradient-based shelf classifier (compute-shelf-mask) finds no continental slope to
      // break on — it floods the whole basin as shelf. The shoreline itself stays coast regardless
      // (the classifier's land-adjacency rule), so this only carves the deep basin interior.
      if (oceanicAbyssalDepth > 0 && ABYSS_DISTANCE_SCALE > 0) {
        const marginDistance = new Int32Array(cellCount).fill(-1);
        const bfsQueue = new Int32Array(cellCount);
        let qHead = 0;
        let qTail = 0;
        for (let i = 0; i < cellCount; i++) {
          if (type[i] === 1) {
            marginDistance[i] = 0;
            bfsQueue[qTail++] = i;
          }
        }
        // All-ocean world (no continental seed) ⇒ no margin to deepen from; the floor is left as-is.
        while (qHead < qTail) {
          const c = bfsQueue[qHead++]!;
          const start = mesh.neighborsOffsets[c] | 0;
          const end = mesh.neighborsOffsets[c + 1] | 0;
          const nextDist = (marginDistance[c]! | 0) + 1;
          for (let cursor = start; cursor < end; cursor++) {
            const n = mesh.neighbors[cursor] | 0;
            if (n < 0 || n >= cellCount || marginDistance[n] !== -1) continue;
            marginDistance[n] = nextDist;
            bfsQueue[qTail++] = n;
          }
        }
        for (let i = 0; i < cellCount; i++) {
          if (type[i] === 1) continue; // continents keep their freeboard / keel elevation
          const d = marginDistance[i]! < 0 ? 0 : marginDistance[i]! | 0;
          // Saturating margin→abyss profile: the continental slope falls off over the first hops off
          // the margin, then the abyssal plain plateaus. (Oceanic cells are ≥ 1 hop from a continent.)
          const abyssFraction = 1 - Math.exp(-d / ABYSS_DISTANCE_SCALE);
          const deepened = clamp01(baseElevation[i]! - oceanicAbyssalDepth * abyssFraction);
          baseElevation[i] = deepened;
          buoyancy[i] = deepened;
        }
      }

      return {
        crust: {
          maturity,
          thickness,
          thermalAge,
          damage,
          type,
          age,
          buoyancy,
          baseElevation,
          strength,
        },
      } as const;
    },
  }
);

export default tectonicDifferentiation;
