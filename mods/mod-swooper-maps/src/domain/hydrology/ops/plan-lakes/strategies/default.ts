import { createStrategy } from "@swooper/mapgen-core/authoring";
import PlanLakesContract from "../contract.js";

export const defaultStrategy = createStrategy(PlanLakesContract, "default", {
  run: (input, config) => {
    const width = input.width | 0;
    const height = input.height | 0;
    const size = Math.max(0, width * height);
    if (!(input.landMask instanceof Uint8Array) || input.landMask.length !== size) {
      throw new Error("[Hydrology] Invalid landMask for hydrology/plan-lakes.");
    }
    if (!(input.flowDir instanceof Int32Array) || input.flowDir.length !== size) {
      throw new Error("[Hydrology] Invalid flowDir for hydrology/plan-lakes.");
    }
    if (!(input.sinkMask instanceof Uint8Array) || input.sinkMask.length !== size) {
      throw new Error("[Hydrology] Invalid sinkMask for hydrology/plan-lakes.");
    }

    const lakeMask = new Uint8Array(size);
    let sinkLakeCount = 0;
    for (let i = 0; i < size; i++) {
      if (input.landMask[i] !== 1) continue;
      if (input.sinkMask[i] !== 1) continue;
      lakeMask[i] = 1;
      sinkLakeCount += 1;
    }

    // Deterministic basin fill: expand upstream from sink tiles by a bounded number of drainage hops.
    const maxUpstreamSteps = Math.max(0, config.maxUpstreamSteps | 0);
    for (let step = 0; step < maxUpstreamSteps; step++) {
      let changed = false;
      for (let i = 0; i < size; i++) {
        if (input.landMask[i] !== 1) continue;
        if (lakeMask[i] === 1) continue;

        const receiver = input.flowDir[i] ?? -1;
        if (receiver < 0 || receiver >= size) continue;
        if ((lakeMask[receiver] ?? 0) !== 1) continue;
        lakeMask[i] = 1;
        changed = true;
      }
      if (!changed) break;
    }

    let plannedLakeTileCount = 0;
    for (let i = 0; i < size; i++) {
      if (lakeMask[i] === 1) plannedLakeTileCount += 1;
    }

    return { lakeMask, plannedLakeTileCount, sinkLakeCount } as const;
  },
});
