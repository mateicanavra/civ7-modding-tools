import { createStrategy } from "@swooper/mapgen-core/authoring";

import ComputeFeatureSubstrateContract from "../contract.js";
import { computeWetlandSubstrateMasks } from "../policy/index.js";
import { computeCoastalLandMask, computeRiverAdjacencyMask } from "../rules/index.js";

export const defaultStrategy = createStrategy(ComputeFeatureSubstrateContract, "default", {
  run: (input, config) => {
    const width = input.width;
    const height = input.height;
    const riverClass = input.riverClass as Uint8Array;
    const navigableRiverMask = input.navigableRiverMask as Uint8Array;
    const landMask = input.landMask as Uint8Array;
    const elevation = input.elevation as Int16Array;
    const discharge = input.discharge as Float32Array;
    const sinkMask = input.sinkMask as Uint8Array;

    const nearRiverMask = computeRiverAdjacencyMask({
      width,
      height,
      riverClass,
      radius: config.nearRiverRadius,
    });

    const isolatedRiverMask = computeRiverAdjacencyMask({
      width,
      height,
      riverClass,
      radius: config.isolatedRiverRadius,
    });

    const coastalLandMask = computeCoastalLandMask({
      width,
      height,
      landMask,
      radius: config.coastalAdjacencyRadius,
    });

    const wetlandSubstrate = computeWetlandSubstrateMasks({
      width,
      height,
      landMask,
      elevation,
      seaLevel: input.seaLevel,
      riverClass,
      discharge,
      sinkMask,
      nearRiverMask,
      isolatedRiverMask,
      coastalLandMask,
      nearRiverRadius: config.nearRiverRadius,
      lowlandMaxElevationAboveSeaM: config.lowlandMaxElevationAboveSeaM,
      intertidalMaxElevationAboveSeaM: config.intertidalMaxElevationAboveSeaM,
      floodplainDischargeMin: config.floodplainDischargeMin,
    });

    return {
      navigableRiverMask,
      nearRiverMask,
      isolatedRiverMask,
      coastalLandMask,
      ...wetlandSubstrate,
    };
  },
});
