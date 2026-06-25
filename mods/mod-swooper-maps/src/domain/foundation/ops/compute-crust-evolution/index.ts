import { createOp } from "@swooper/mapgen-core/authoring";
import { clamp01, clampU8 } from "@swooper/mapgen-core/lib/math";

import {
  deriveBuoyancy,
  isContinentalMaturity,
  strengthFromMaturity,
  strengthFromThermalAge,
  strengthFromThickness,
} from "../../lib/crust/buoyancy.js";
import {
  requireCrust,
  requireMesh,
  requireTectonicHistory,
  requireTectonics,
} from "../../lib/require.js";
import ComputeCrustEvolutionContract from "./contract.js";

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

const RIFT_RECYCLE_THRESHOLD = 0.35;
const RIFT_RECYCLE_MATURITY_CAP = 0.08;
const RIFT_THERMAL_AGE_MUL = 0.4;
const THERMAL_AGE_RIFT_SLOWDOWN = 0.6;

// Cratonization: stable continental crust consolidates a thick, buoyant felsic keel over quiescent
// eras — the positive feedback that grows a real high-craton elevation mode (vs. a single band
// hugging the continent threshold) and leaves young/recently-rifted margins thin and low. Rates are
// physical (per-era keel growth / rift recycling), never tuned to a land/ocean output ratio.
const CRATON_MATURITY_MIN = 0.55; // keel growth begins at continental maturity…
const CRATON_MATURITY_SPAN = 0.3; // …and reaches full rate by maturity ~0.85 (only true cratons)
const CRATON_THICKEN_RATE = 0.08; // keel thickness gained per fully-quiescent era (adds a high tail,
//                                   not a wholesale lift — the isostatic spread carries the gradient)
const CRATON_RIFT_RECYCLE_MUL = 0.3; // fraction of the keel surviving a rifting era

const computeCrustEvolution = createOp(ComputeCrustEvolutionContract, {
  strategies: {
    default: {
      run: (input, _config) => {
        const mesh = requireMesh(input.mesh, "foundation/compute-crust-evolution");
        const cellCount = mesh.cellCount | 0;

        const crustInit = requireCrust(
          input.crustInit,
          cellCount,
          "foundation/compute-crust-evolution"
        );
        const tectonics = requireTectonics(
          input.tectonics,
          cellCount,
          "foundation/compute-crust-evolution"
        );
        const tectonicHistory = requireTectonicHistory(
          input.tectonicHistory,
          cellCount,
          "foundation/compute-crust-evolution"
        );

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

            // Rift reset (recycling).
            if (r >= RIFT_RECYCLE_THRESHOLD) {
              maturity01 = Math.min(maturity01, RIFT_RECYCLE_MATURITY_CAP);
              thermalAge01 *= RIFT_THERMAL_AGE_MUL;
            }

            // Damage update.
            damage01 = clamp01(Math.max(damage01, disrupt));

            // Thermal age accrual.
            thermalAge01 = clamp01(
              thermalAge01 + thermalAgeStep * (1 - THERMAL_AGE_RIFT_SLOWDOWN * r)
            );

            // Cratonization: a continental cell that survives a quiescent era thickens its keel; an
            // active/rifting era adds little, and a rift recycles most of it. `cratonizing` ramps in
            // with maturity so only continental-grade crust consolidates; `quiescence` is the inverse
            // of this era's disruption. Cells that matured early then drifted off the active belt
            // accumulate a deep keel (high mode); perpetually-active or rifted margins stay thin (low).
            const cratonizing = clamp01((maturity01 - CRATON_MATURITY_MIN) / CRATON_MATURITY_SPAN);
            const quiescence = clamp01(1 - disrupt);
            cratonRoot01 = clamp01(cratonRoot01 + CRATON_THICKEN_RATE * cratonizing * quiescence);
            if (r >= RIFT_RECYCLE_THRESHOLD) cratonRoot01 *= CRATON_RIFT_RECYCLE_MUL;
          }

          // Thickness = differentiated-crust base (from maturity) + the accumulated cratonic keel.
          // The keel is the high-mode driver: long-quiescent cratons reach full thickness and ride
          // highest; young/rifted margins keep only the maturity base and stay low → real shelf depth.
          thickness01 = clamp01(
            initThickness + THICKNESS_FROM_MATURITY_GAIN * maturity01 + cratonRoot01
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
    },
  },
});

export default computeCrustEvolution;
