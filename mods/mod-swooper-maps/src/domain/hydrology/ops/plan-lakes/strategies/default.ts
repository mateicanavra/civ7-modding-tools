import { createStrategy } from "@swooper/mapgen-core/authoring";

import PlanLakesContract from "../contract.js";

/**
 * Default lake planning strategy.
 *
 * Hydrology routing publishes drainage/depression candidates, but a candidate
 * is not automatically a lake. This strategy admits deterministic basins only
 * when accumulated drainage and the map-level lake budget agree, then optional
 * upstream expansion follows receivers so denser lakeiness still grows from
 * drainage structure instead of projection frequency heuristics.
 */
export const defaultStrategy = createStrategy(PlanLakesContract, "default", {
  run: (input, config) => {
    const width = input.width | 0;
    const height = input.height | 0;
    const size = Math.max(0, width * height);

    const lakeMask = new Uint8Array(size);
    const sinkCandidates: Array<{ tileIndex: number; discharge: number }> = [];
    let landTileCount = 0;
    for (let i = 0; i < size; i++) {
      if (input.landMask[i] !== 1) continue;
      landTileCount += 1;
      if (input.sinkMask[i] !== 1) continue;
      const discharge = input.discharge[i] ?? 0;
      if (!Number.isFinite(discharge) || discharge <= 0) continue;
      sinkCandidates.push({ tileIndex: i, discharge });
    }

    const maxLakeLandFraction = Number.isFinite(config.maxLakeLandFraction)
      ? Math.max(0, Math.min(1, config.maxLakeLandFraction))
      : 0;
    const maxSinkLakes = Math.min(
      sinkCandidates.length,
      Math.ceil(Math.max(0, landTileCount) * maxLakeLandFraction)
    );

    let sinkLakeCount = 0;
    if (maxSinkLakes > 0 && sinkCandidates.length > 0) {
      const dischargeValues = sinkCandidates
        .map((candidate) => candidate.discharge)
        .sort((a, b) => a - b);
      const percentile = Number.isFinite(config.sinkDischargePercentileMin)
        ? Math.max(0, Math.min(1, config.sinkDischargePercentileMin))
        : 1;
      const cutoffIndex = Math.min(
        dischargeValues.length - 1,
        Math.max(0, Math.floor(percentile * (dischargeValues.length - 1)))
      );
      const dischargeCutoff = dischargeValues[cutoffIndex] ?? Number.POSITIVE_INFINITY;

      sinkCandidates.sort((a, b) => {
        if (a.discharge !== b.discharge) return b.discharge - a.discharge;
        return a.tileIndex - b.tileIndex;
      });

      for (const candidate of sinkCandidates) {
        if (sinkLakeCount >= maxSinkLakes) break;
        if (candidate.discharge < dischargeCutoff) continue;
        lakeMask[candidate.tileIndex] = 1;
        sinkLakeCount += 1;
      }
    }

    let frontier = new Uint8Array(lakeMask);
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
