import { createOp } from "@swooper/mapgen-core/authoring";
import { clamp01 } from "@swooper/mapgen-core/lib/math";

import { requireMantleForcing, requireMesh } from "../../lib/require.js";
import ComputeCrustContract from "./contract.js";

const MATURITY_CONTINENT_THRESHOLD = 0.55;

const OCEANIC_BASE_ELEVATION = 0.32;
const OCEANIC_AGE_DEPTH = 0.22;
const MATURITY_BUOYANCY_BOOST = 0.45;
const THICKNESS_BUOYANCY_BOOST = 0.25;

const STRENGTH_BASE_MIN = 0.45;
const STRENGTH_MATURITY_MIN = 0.5;
const STRENGTH_THICKNESS_MIN = 0.55;

function clampU8(value: number): number {
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

const computeCrust = createOp(ComputeCrustContract, {
  strategies: {
    default: {
      run: (input, config) => {
        const mesh = requireMesh(input.mesh, "foundation/compute-crust");
        const mantleForcing = requireMantleForcing(
          input.mantleForcing,
          mesh.cellCount | 0,
          "foundation/compute-crust"
        );
        const cellCount = mesh.cellCount | 0;

        const maturity = new Float32Array(cellCount);
        const thickness = new Float32Array(cellCount);
        const thermalAge = new Uint8Array(cellCount);
        const damage = new Uint8Array(cellCount);

        const type = new Uint8Array(cellCount);
        const age = new Uint8Array(cellCount);
        const buoyancy = new Float32Array(cellCount);
        const baseElevation = new Float32Array(cellCount);
        const strength = new Float32Array(cellCount);

        const basalticThickness = clamp01(config.basalticThickness01 ?? 0.25);
        const yieldStrength = clamp01(config.yieldStrength01 ?? 0.55);
        const mantleCoupling = clamp01(config.mantleCoupling01 ?? 0.6);
        const riftWeakening = clamp01(config.riftWeakening01 ?? 0.35);

        const strengthYieldScalar = 0.85 + 0.3 * yieldStrength;
        const strengthCouplingScalar = 0.9 + 0.2 * mantleCoupling;

        for (let i = 0; i < cellCount; i++) {
          const divergenceRaw = mantleForcing.divergence[i] ?? 0;
          const divergencePos = clamp01(Math.max(0, divergenceRaw));
          const divergenceNeg = clamp01(Math.max(0, -divergenceRaw));
          const stress = clamp01(mantleForcing.stress[i] ?? 0);
          const forcingMag = clamp01(mantleForcing.forcingMag[i] ?? 0);

          const riftSignal = clamp01(divergencePos * (0.35 + 0.65 * forcingMag) * (0.5 + 0.5 * stress));
          const maturitySeed = clamp01(divergenceNeg * (0.4 + 0.6 * stress)) * 0.25;
          const thicknessSeed = clamp01(basalticThickness + maturitySeed * 0.25);

          maturity[i] = maturitySeed;
          thickness[i] = thicknessSeed;
          thermalAge[i] = 0;
          damage[i] = clampU8(riftSignal * riftWeakening * 255);

          const m = maturity[i] ?? 0;
          const t = thickness[i] ?? 0;
          const a = thermalAge[i] ?? 0;
          const d = damage[i] ?? 0;
          const age01 = clamp01(a / 255);
          const damage01 = clamp01(d / 255);

          type[i] = m >= MATURITY_CONTINENT_THRESHOLD ? 1 : 0;
          age[i] = clampU8(a);

          const buoy = deriveBuoyancy({ maturity: m, thickness: t, thermalAge01: age01 });
          buoyancy[i] = buoy;
          baseElevation[i] = buoy;

          const strengthBase = strengthFromThermalAge(age01);
          const strengthComp = strengthFromMaturity(m);
          const strengthThk = strengthFromThickness(t);
          const strengthDamage = 1 - damage01;
          const rawStrength = strengthBase * strengthComp * strengthThk * strengthDamage;
          strength[i] = clamp01(rawStrength * strengthYieldScalar * strengthCouplingScalar);
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

export default computeCrust;
