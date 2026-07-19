import { createOp, createStrategy } from "@swooper/mapgen-core/authoring";
import { clamp01, clampU8 } from "@swooper/mapgen-core/lib/math";

import {
  deriveBuoyancy,
  isContinentalMaturity,
  strengthFromMaturity,
  strengthFromThermalAge,
  strengthFromThickness,
} from "../../model/policy/crust-buoyancy.js";
import ComputeCrustEvolutionContract from "./contract.js";

// ─────────────────────────────────────────────────────────────────────────────────────────────────
// STRUCTURE vs TUNING — kept un-mixed:
//   • The constants below are STRUCTURE — universal physics (mechanisms + couplings: β-stretching →
//     thinning, keel patchiness, the continental-freeboard step, maturity-graded breakup, foundering of
//     under-differentiated crust, and how they feed thickness → buoyancy). They define HOW crust evolves
//     and hold for EVERY map class; never tune them to a land/ocean output ratio.
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

// Cratonization: stable continental crust consolidates a thick, buoyant felsic keel over quiescent
// eras — the positive feedback that grows a real high-craton elevation mode (vs. a single band
// hugging the continent threshold) and leaves young/recently-rifted margins thin and low. Rates are
// physical (per-era keel growth), never tuned to a land/ocean output ratio.
const CRATON_MATURITY_MIN = 0.55; // keel growth begins at the continental threshold…
const CRATON_MATURITY_SPAN = 0.15; // …reaching full rate by maturity ~0.7 (most continental crust)
const CRATON_THICKEN_RATE = 0.16; // keel thickness gained per fully-quiescent era — over the 5-era
//                                   budget this lifts stable continental crust to real freeboard
//                                   (continents sit ABOVE sea level), the keel feedback carrying the
//                                   oldest interiors highest. The continental/oceanic freeboard gap is
//                                   physical (granitic thick crust floats high), not an output ratio.

// Keel positive feedback: a consolidating cratonic root is itself buoyant and shields its interior
// from reworking, so keel growth accelerates with the keel already present. This sharpens the HIGH
// mode (cratons pull decisively away from the waterline) instead of leaving a gentle high tail.
const CRATON_KEEL_FEEDBACK = 1.4; // keel-begets-keel gain on per-era keel growth

// ── Continental lithospheric thinning via critical β-stretching ──────────────────────────────────
// A cell accumulates `extension01 = Σ_eras (rift · continentalness)` — the β-stretching integral over
// its history. That integral is mapped to thinning through a CRITICAL threshold: below β_crit the
// stretched lithosphere recovers (no permanent thinning); above it, runaway thinning removes crustal
// thickness, the cell loses isostatic support (buoyancy.ts ISOSTASY ramp) and subsides into shelves /
// lowlands. The threshold is the load-bearing nonlinearity: per-era rift is a smooth spatial falloff
// from boundaries (p50≈p90/2.6), so a LINEAR mapping just sags the whole continent uniformly — the
// threshold instead resolves that smooth gradient into two camps (kept vs thinned), which is what
// makes the hypsometry bimodal rather than a shifted unimodal lump. Physical (β-factor criticality);
// the threshold is a property of the lithosphere, never tuned to a land/ocean output ratio.
const THINNING_CONTINENTAL_MIN = 0.4; // extension registers only on continental-grade crust…
const THINNING_CONTINENTAL_SPAN = 0.3; // …reaching full sensitivity by maturity ~0.7
const THIN_CRIT_LO = 0.15; // cumulative extension below which crust recovers (no thinning)
const THIN_CRIT_HI = 0.45; // cumulative extension at/above which the margin is fully thinned
// (shelf depth: `config.thinningThicknessLoss` — thickness removed from a fully-thinned margin)

// Continental freeboard — the compositional dichotomy. Differentiated (granitic) continental crust is
// intrinsically thicker and more buoyant than basaltic oceanic crust; this thickness step, gated
// sharply at the differentiation threshold, is the PRIMARY reason Earth's hypsometry is bimodal
// (continents stand above sea level, the ocean floor lies deep, the continental slope between is the
// rare antimode). Without it, buoyancy is continuous in maturity and the two crust populations sit
// adjacent with no empty band at the waterline. It is emergent from history (only crust matured past
// the threshold earns it) and rides on the existing isostatic-support gate in buoyancy.ts to become a
// buoyancy step. Its MAGNITUDE is the granitic/basaltic thickness contrast — the per-class freeboard /
// sea-shallowness knob `config.continentalFreeboard` (a physical contrast, never an output ratio).
const CONTINENTAL_FREEBOARD_LO = 0.62; // maturity where the step begins — marginally-differentiated…
const CONTINENTAL_FREEBOARD_HI = 0.74; // …(transitional) crust earns little freeboard and forms shallow
//                                        shelves; only well-matured interiors rise to emerged land. The
//                                        onset above the bare continental threshold (0.55) is what splits
//                                        the continental crust into shelf vs land — its internal bimodality.

// Hyperextension → breakup. Crust stretched past its breakup threshold has rifted through: it is
// replaced by thin, undifferentiated oceanic-grade lithosphere — the DEEP mode and the fragmentation
// engine (drowned corridors that split a continent into microcontinents). This is the model's one hard
// bistable switch, standing in for the continental/oceanic crustal dichotomy that makes Earth's
// hypsometry fundamentally bimodal. Its threshold RISES WITH MATURITY: thick, cratonic lithosphere
// resists rifting, while thin, marginally-differentiated crust ruptures under modest extension. So
// stretched marginal crust converts to oceanic — shrinking the continental area toward Earth's ~41%
// and carving passive margins — while cratons survive all but the most extreme stretching. (The prior
// per-era `RIFT_RECYCLE_THRESHOLD = 0.35` was dead code: per-era rift peaks ~0.30, so margins never
// converted; this revives that physics on cumulative extension with a strength-graded threshold.)
// (fragmentation: `config.hyperextensionBreakupBase` — breakup threshold for marginal crust)
const HYPEREXTENSION_BREAKUP_RESIST = 0.45; // added per unit of cratonic maturity (cratons resist)
const HYPEREXTENSION_RESIST_SPAN = 0.4; // maturity span (above the continental threshold) over which
//                                         breakup resistance ramps from marginal to full cratonic
const HYPEREXTENSION_MATURITY_CAP = 0.1; // residual maturity of newly-rifted oceanic-grade crust

// Continental survival vs foundering. Crust that never truly differentiated — maturity only marginally
// past the bare continental threshold — is weak, thin and isostatically unstable: its dense lower
// lithosphere founders/delaminates and the cell reverts to thin oceanic-grade crust. This caps the
// continental area near Earth's ~41% (the model otherwise over-matures ~66% of cells just past the bare
// threshold), so at an earthlike water budget sea level lands in the continental/oceanic gap instead of
// drowning a too-large platform into flat shelves. Keyed on MATURITY (differentiation), not on keel: a
// margin that matured and then thinned is real continental crust that subsided — it must survive as a
// drowned shelf, so foundering must not catch it. Only genuinely under-differentiated crust founders.
// (abundance: `config.continentalSurvivalMaturity` — maturity below which marginal crust founders)
const SHELF_PRESERVE_EXTENSION = 0.1; // …a stretched margin (high extension) survives as drowned shelf

// ── Abyssal subsidence: the oceanic floor's margin→abyss depth profile ────────────────────────────
// Oceanic crust deepens with geodesic distance from the continental margin — the age / distance-from-
// ridge → depth relationship (young passive margins shallow; old abyssal plains deep). The MECHANISM
// (deepen-with-distance) is universal structure; the MAGNITUDE is the per-class knob
// `config.oceanicAbyssalDepth`. Why it is load-bearing: the downstream shelf classifier
// (compute-shelf-mask) is GRADIENT-based — it floods gentle seabed outward from shore and only stops
// at a steep break (the continental slope). A FLAT oceanic floor presents no such break anywhere, so
// the shelf floods the entire basin (a drowned, shelf-only world). This offshore deepening reinstates
// the continental slope that separates shelf from deep ocean. Distance is in mesh hops from the
// nearest continental cell; the exponential falloff concentrates the drop in the first cells off the
// margin (the continental slope), then plateaus across the abyssal plain. The shelf is kept by the
// downstream classifier's shore-adjacency rule (it always makes shoreline water coast), so this can
// deepen from the first oceanic ring while the margin still reads a real shelf.
const ABYSS_DISTANCE_SCALE = 0.8; // mesh-hops over which the continental slope falls toward the abyss

/** Hermite smoothstep in [0,1]; 0 below edge0, 1 above edge1. */
function smoothstep(edge0: number, edge1: number, x: number): number {
  if (edge1 <= edge0) return x >= edge1 ? 1 : 0;
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

const computeCrustEvolution = createOp(ComputeCrustEvolutionContract, {
  strategies: {
    default: createStrategy(ComputeCrustEvolutionContract, "default", {
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

        const crustInit = input.crustInit;
        const tectonics = input.tectonics;
        const tectonicHistory = input.tectonicHistory;
        if (crustInit.thickness.length !== cellCount || crustInit.strength.length !== cellCount) {
          throw new Error("[Foundation] Invalid crustInit.cellCount for compute-crust-evolution.");
        }
        if (
          tectonics.boundaryType.length !== cellCount ||
          tectonics.cumulativeUplift.length !== cellCount
        ) {
          throw new Error("[Foundation] Invalid tectonics.cellCount for compute-crust-evolution.");
        }
        if (
          tectonicHistory.upliftTotal.length !== cellCount ||
          tectonicHistory.fractureTotal.length !== cellCount
        ) {
          throw new Error(
            "[Foundation] Invalid tectonicHistory.cellCount for compute-crust-evolution."
          );
        }

        const maturity = new Float32Array(cellCount);
        const thickness = new Float32Array(cellCount);
        const thermalAge = new Uint8Array(cellCount);
        const damage = new Uint8Array(cellCount);

        const type = new Uint8Array(cellCount);
        const age = new Uint8Array(cellCount);
        const buoyancy = new Float32Array(cellCount);
        const baseElevation = new Float32Array(cellCount);
        const strength = new Float32Array(cellCount);

        const eraCount = tectonicHistory.eraCount | 0;
        const eras = tectonicHistory.eras;
        const thermalAgeStep = eraCount > 0 ? 1 / eraCount : 0;

        for (let i = 0; i < cellCount; i++) {
          const initThickness = crustInit.thickness[i] ?? 0.25;

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

            // Cumulative continental extension (β-stretching integral). `continentalness` gates it so
            // oceanic / not-yet-differentiated crust does not register stretching. Mapped to thinning /
            // breakup AFTER the loop via the critical thresholds.
            const continentalness = clamp01(
              (maturity01 - THINNING_CONTINENTAL_MIN) / THINNING_CONTINENTAL_SPAN
            );
            extension01 = clamp01(extension01 + r * continentalness);

            // Running "un-stretched" fraction: a cell already past the critical stretch cannot
            // consolidate a keel even in a later quiet era — the extension is recorded in the crust.
            // This is the coupling that makes thinning and cratonization near-exclusive per cell.
            const unstretched = 1 - smoothstep(THIN_CRIT_LO, THIN_CRIT_HI, extension01);

            // Cratonization: a continental cell that survives quiescent, un-stretched eras thickens its
            // keel. `cratonizing` ramps in with maturity so only continental-grade crust consolidates;
            // `quiescence` is the inverse of this era's disruption; `unstretched` denies keels to
            // stretched margins; the keel-feedback term runs consolidation away to a deep root. Cells
            // that matured early then drifted off the active belt grow the deepest keels (high mode).
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

          // Critical-stretching thinning: map the cumulative extension integral through β_crit.
          const thinning01 = smoothstep(THIN_CRIT_LO, THIN_CRIT_HI, extension01);

          // Continental survival vs reversion to oceanic. A cell stays continental only if it BOTH
          // (a) avoided hyperextension breakup (stretched past its maturity-graded threshold — marginal
          // crust ruptures at low extension, cratons resist) AND (b) consolidated enough crust
          // (maturity + keel) to be isostatically stable. Otherwise its lower lithosphere founders and
          // it reverts to thin oceanic-grade crust — the deep mode, the fragmentation engine, and the
          // cap on emerged continental area. Surviving thinned-but-continental crust below the breakup
          // threshold remains as the shelf / lowland down-variety.
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

          // Continental freeboard step — the granitic/basaltic dichotomy (see constant). Computed from
          // the post-breakup maturity so ruptured crust forfeits its freeboard and joins the deep mode,
          // and GATED by (1 − thinning): a stretched margin loses its freeboard and subsides to a
          // distinct drowned-shelf level, while stable interiors keep full freeboard as emerged land.
          // This split — emerged land vs drowned shelf — is what makes the CONTINENTAL crust itself
          // bimodal, opening the gap at sea level (where the water-fill solver cuts) instead of a flat
          // platform straddling the waterline.
          const continentalFreeboardStep =
            continentalFreeboard *
            smoothstep(CONTINENTAL_FREEBOARD_LO, CONTINENTAL_FREEBOARD_HI, maturity01) *
            (1 - thinning01);

          // Thickness = differentiated-crust base (maturity) + continental-freeboard step + cratonic
          // keel − critical-stretch thinning. Freeboard lifts the whole continental platform clear of
          // the waterline (emptying the band at sea level); the keel is the HIGH-mode driver
          // (long-quiescent cratons ride highest); thinning is the LOW-mode driver (stretched margins
          // lose thickness, lose isostatic support, subside, drown). The thresholds keep these
          // near-exclusive per cell, so thickness — and hence buoyancy — turns bimodal across the world.
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
    }),
  },
});

export default computeCrustEvolution;
