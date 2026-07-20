import { clamp01 } from "@swooper/mapgen-core";

import type {
  ResourcePlanBasinsAdmittedInput,
  ResourcePlanBasinsConfig,
  ResourcePlanBasinsOutput,
} from "../types.js";

/**
 * Plans per-resource ecological basins over the admitted map grid.
 * Strategies shape resource biases before entering this shared algorithm rather than delegating
 * through another strategy descriptor.
 */
export function planResourceBasins(
  input: ResourcePlanBasinsAdmittedInput,
  config: ResourcePlanBasinsConfig
): ResourcePlanBasinsOutput {
  const { width, height } = input;
  const size = width * height;
  const basins: ResourcePlanBasinsOutput["basins"][number][] = [];

  for (const resource of config.resources) {
    const plots: number[] = [];
    const intensity: number[] = [];
    let seededCount = 0;
    for (let i = 0; i < size; i++) {
      if (input.landMask[i] === 0) continue;
      const fertility = input.fertility[i];
      const moisture = (input.rainfall[i] + input.humidity[i]) / 510;
      const soilBonus = input.soilType[i] === 2 ? 0.1 : 0;
      const score =
        fertility * resource.fertilityBias +
        moisture * resource.moistureBias +
        soilBonus -
        (seededCount / Math.max(1, resource.target)) * 0.1;
      if (score > 0.8 || (plots.length < resource.target && score > 0.55)) {
        plots.push(i);
        intensity.push(clamp01(score));
        seededCount += 1;
      }
    }
    basins.push({
      resourceId: resource.id,
      plots,
      intensity,
      confidence: clamp01(plots.length / Math.max(1, resource.target * 1.5)),
    });
  }

  return { basins };
}
