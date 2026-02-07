import { createOp } from "@swooper/mapgen-core/authoring";
import { clamp01, clampU8 } from "@swooper/mapgen-core/lib/math";

import { requireCrust, requireMesh, requireTectonicHistory, requireTectonicProvenance, requireTectonics } from "../../lib/require.js";
import ComputeCrustEvolutionContract from "./contract.js";

const MATURITY_CONTINENT_THRESHOLD = 0.55;

const OCEANIC_BASE_ELEVATION = 0.32;
const OCEANIC_AGE_DEPTH = 0.22;
const MATURITY_BUOYANCY_BOOST = 0.45;
const THICKNESS_BUOYANCY_BOOST = 0.25;

const STRENGTH_BASE_MIN = 0.45;
const STRENGTH_MATURITY_MIN = 0.5;
const STRENGTH_THICKNESS_MIN = 0.55;

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

function strengthFromThermalAge(age01: number): number {
  return STRENGTH_BASE_MIN + (1 - STRENGTH_BASE_MIN) * clamp01(age01);
}

function strengthFromMaturity(maturity: number): number {
  return STRENGTH_MATURITY_MIN + (1 - STRENGTH_MATURITY_MIN) * clamp01(maturity);
}

function strengthFromThickness(thickness: number): number {
  return STRENGTH_THICKNESS_MIN + (1 - STRENGTH_THICKNESS_MIN) * clamp01(thickness);
}

function deriveBuoyancy(params: { maturity: number; thickness: number; thermalAge01: number }): number {
  const maturityBoost = MATURITY_BUOYANCY_BOOST * clamp01(params.maturity);
  const thicknessBoost = THICKNESS_BUOYANCY_BOOST * clamp01(params.thickness);
  const subsidence = OCEANIC_AGE_DEPTH * clamp01(params.thermalAge01);
  return clamp01(OCEANIC_BASE_ELEVATION + maturityBoost + thicknessBoost - subsidence);
}

const computeCrustEvolution = createOp(ComputeCrustEvolutionContract, {
  strategies: {
    default: {
      run: (input, _config) => {
        const mesh = requireMesh(input.mesh, "foundation/compute-crust-evolution");
        const cellCount = mesh.cellCount | 0;

        const crustInit = requireCrust(input.crustInit, cellCount, "foundation/compute-crust-evolution");
        const tectonics = requireTectonics(input.tectonics, cellCount, "foundation/compute-crust-evolution");
        const tectonicHistory = requireTectonicHistory(
          input.tectonicHistory,
          cellCount,
          "foundation/compute-crust-evolution"
        );
        // Keep provenance as a hard input even if this strategy doesn't currently consume its fields.
        requireTectonicProvenance(input.tectonicProvenance, cellCount, "foundation/compute-crust-evolution");

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

          // Baseline damage proxy (existing one-shot formula).
          const fractureTotal01 = clamp01((tectonicHistory.fractureTotal[i] ?? 0) / 255);
          const riftNow01 = clamp01((tectonics.riftPotential[i] ?? 0) / 255);
          const shearNow01 = clamp01((tectonics.shearStress[i] ?? 0) / 255);
          let damage01 = clamp01((0.55 * fractureTotal01 + 0.6 * riftNow01 + 0.45 * shearNow01) / DAMAGE_COEFF_SUM);

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
            thermalAge01 = clamp01(thermalAge01 + thermalAgeStep * (1 - THERMAL_AGE_RIFT_SLOWDOWN * r));
          }

          maturity[i] = maturity01;
          thickness[i] = thickness01;
          thermalAge[i] = clampU8(thermalAge01 * 255);
          damage[i] = clampU8(damage01 * 255);

          const isContinent = maturity01 >= MATURITY_CONTINENT_THRESHOLD ? 1 : 0;
          type[i] = isContinent;
          age[i] = thermalAge[i];

          const buoy = deriveBuoyancy({ maturity: maturity01, thickness: thickness01, thermalAge01 });
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
