import { createStrategy } from "@swooper/mapgen-core/authoring";
import ComputeEvaporationSourcesContract from "../contract.js";
import { clamp01 } from "../rules/index.js";

function clampNumber(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, value));
}

export const defaultStrategy = createStrategy(ComputeEvaporationSourcesContract, "default", {
  run: (input, config) => {
    const width = input.width | 0;
    const height = input.height | 0;
    const size = Math.max(0, width * height);

    if (!(input.landMask instanceof Uint8Array) || input.landMask.length !== size) {
      throw new Error("[Hydrology] Invalid landMask for hydrology/compute-evaporation-sources.");
    }
    if (
      !(input.surfaceTemperatureC instanceof Float32Array) ||
      input.surfaceTemperatureC.length !== size
    ) {
      throw new Error("[Hydrology] Invalid surfaceTemperatureC for hydrology/compute-evaporation-sources.");
    }
    if (input.windU != null) {
      if (!(input.windU instanceof Int8Array) || input.windU.length !== size) {
        throw new Error("[Hydrology] Invalid windU for hydrology/compute-evaporation-sources.");
      }
    }
    if (input.windV != null) {
      if (!(input.windV instanceof Int8Array) || input.windV.length !== size) {
        throw new Error("[Hydrology] Invalid windV for hydrology/compute-evaporation-sources.");
      }
    }
    if (input.sstC != null) {
      if (!(input.sstC instanceof Float32Array) || input.sstC.length !== size) {
        throw new Error("[Hydrology] Invalid sstC for hydrology/compute-evaporation-sources.");
      }
    }
    if (input.seaIceMask != null) {
      if (!(input.seaIceMask instanceof Uint8Array) || input.seaIceMask.length !== size) {
        throw new Error("[Hydrology] Invalid seaIceMask for hydrology/compute-evaporation-sources.");
      }
    }

    const evaporation = new Float32Array(size);
    const minT = config.minTempC;
    const maxT = Math.max(minT + 1e-6, config.maxTempC);
    const oceanStrength = config.oceanStrength;
    const landStrength = config.landStrength;
    const windU = input.windU;
    const windV = input.windV;
    const sstC = input.sstC;
    const seaIceMask = input.seaIceMask;

    for (let i = 0; i < size; i++) {
      const isLand = input.landMask[i] === 1;
      const oceanTemp = !isLand && sstC ? sstC[i] ?? minT : undefined;
      const temp = clampNumber(oceanTemp ?? input.surfaceTemperatureC[i] ?? minT, minT, maxT);

      // Temperature-driven baseline.
      let factor = clamp01((temp - minT) / (maxT - minT));

      // Ocean coupling:
      // - Suppress evaporation under sea ice.
      // - Mildly boost evaporation with wind speed (saturated at the i8 max).
      if (!isLand) {
        if (seaIceMask && seaIceMask[i] === 1) factor *= 0.08;
        if (windU && windV) {
          const u = (windU[i] ?? 0) / 127;
          const v = (windV[i] ?? 0) / 127;
          const speed01 = clamp01(Math.sqrt(u * u + v * v));
          factor *= 0.65 + 0.35 * speed01;
        }
      }

      evaporation[i] = factor * (isLand ? landStrength : oceanStrength);
    }

    return { evaporation } as const;
  },
});
