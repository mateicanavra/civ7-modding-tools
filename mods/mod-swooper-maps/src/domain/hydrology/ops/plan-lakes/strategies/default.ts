import { createStrategy } from "@swooper/mapgen-core/authoring";

import PlanLakesContract from "../contract.js";

/**
 * Default lake planning strategy.
 *
 * Sinks are the minimum lake intent because they are where Hydrology routing
 * terminates on land. Optional upstream expansion is deliberately bounded and
 * follows `flowDir` receivers so "many lakes" grows from drainage structure
 * rather than reintroducing engine frequency heuristics.
 */
export const defaultStrategy = createStrategy(PlanLakesContract, "default", {
  run: (input, config) => {
    const width = input.width | 0;
    const height = input.height | 0;
    const size = Math.max(0, width * height);

    const lakeMask = new Uint8Array(size);
    let sinkLakeCount = 0;
    for (let i = 0; i < size; i++) {
      if (input.landMask[i] !== 1 || input.sinkMask[i] !== 1) continue;
      lakeMask[i] = 1;
      sinkLakeCount += 1;
    }

    let frontier = lakeMask;
    const maxUpstreamSteps = Math.max(0, config.maxUpstreamSteps | 0);
    for (let step = 0; step < maxUpstreamSteps; step++) {
      const nextFrontier = new Uint8Array(size);
      for (let i = 0; i < size; i++) {
        if (input.landMask[i] !== 1 || lakeMask[i] === 1) continue;
        const receiver = input.flowDir[i] ?? -1;
        if (receiver < 0 || receiver >= size) continue;
        if (frontier[receiver] !== 1) continue;
        lakeMask[i] = 1;
        nextFrontier[i] = 1;
      }
      frontier = nextFrontier;
    }

    let plannedLakeTileCount = 0;
    for (let i = 0; i < size; i++) {
      if (lakeMask[i] === 1) plannedLakeTileCount += 1;
    }

    return { lakeMask, plannedLakeTileCount, sinkLakeCount } as const;
  },
});
