import { createOp } from "@swooper/mapgen-core/authoring";
import { clamp01 } from "@swooper/mapgen-core/lib/math";

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

function clampByte(value: number): number {
  if (!Number.isFinite(value)) return 0;
  if (value <= 0) return 0;
  if (value >= 255) return 255;
  return value | 0;
}

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
      run: (input, config) => {
        const mesh = requireMesh(input.mesh, "foundation/compute-crust-evolution");
        const cellCount = mesh.cellCount | 0;

        const crustInit = requireCrust(input.crustInit, cellCount, "foundation/compute-crust-evolution");
        const tectonics = requireTectonics(input.tectonics, cellCount, "foundation/compute-crust-evolution");
        const tectonicHistory = requireTectonicHistory(
          input.tectonicHistory,
          cellCount,
          "foundation/compute-crust-evolution"
        );
        const tectonicProvenance = requireTectonicProvenance(
          input.tectonicProvenance,
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

        const provenance = tectonicProvenance.provenance;
        const ageToMaturity = clamp01(config.ageToMaturity ?? 0.8);
        const upliftToMaturity = clamp01(config.upliftToMaturity ?? 1.0);
        const disruptionToMaturity = clamp01(config.disruptionToMaturity ?? 0.9);

        for (let i = 0; i < cellCount; i++) {
          const initThickness = crustInit.thickness[i] ?? 0.25;
          const materialAge01 = clamp01((provenance.crustAge[i] ?? 0) / 255);

          const uplift01 = clamp01((tectonicHistory.upliftTotal[i] ?? 0) / 255);
          const volcanism01 = clamp01((tectonicHistory.volcanismTotal[i] ?? 0) / 255);
          const fracture01 = clamp01((tectonicHistory.fractureTotal[i] ?? 0) / 255);

          const riftNow01 = clamp01((tectonics.riftPotential[i] ?? 0) / 255);
          const shearNow01 = clamp01((tectonics.shearStress[i] ?? 0) / 255);
          const fractureNow01 = clamp01((tectonics.fracture[i] ?? 0) / 255);

          // Craton/differentiation-first heuristic:
          // - Mature crust emerges from long-lived uplift + material age.
          // - Disruption (rift/fracture/shear) suppresses maturity and increases damage.
          const disruption01 = clamp01((riftNow01 + fractureNow01 + shearNow01 + fracture01) / 3);
          const maturity01 = clamp01(
            upliftToMaturity * uplift01 +
              ageToMaturity * materialAge01 +
              0.25 * volcanism01 -
              disruptionToMaturity * disruption01
          );

          // Thickness: basaltic lid + thickening from maturity + uplift + volcanic plateaus.
          const thickness01 = clamp01(initThickness + 0.6 * maturity01 + 0.15 * uplift01 + 0.12 * volcanism01);

          // Thermal age: tie primarily to material age, with partial resets where rifting is recent/strong.
          const reset01 = clamp01(riftNow01 * 0.8 + fractureNow01 * 0.3);
          const thermalAge01 = clamp01(materialAge01 * (1 - 0.6 * reset01));

          // Damage: disruption + fracture accumulation.
          const damage01 = clamp01(0.55 * fracture01 + 0.6 * riftNow01 + 0.45 * shearNow01);

          maturity[i] = maturity01;
          thickness[i] = thickness01;
          thermalAge[i] = clampByte(thermalAge01 * 255);
          damage[i] = clampByte(damage01 * 255);

          const isContinent = maturity01 >= MATURITY_CONTINENT_THRESHOLD ? 1 : 0;
          type[i] = isContinent;
          age[i] = thermalAge[i] ?? 0;

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

