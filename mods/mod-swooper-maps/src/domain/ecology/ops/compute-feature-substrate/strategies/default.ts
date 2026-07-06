import { createStrategy } from "@swooper/mapgen-core/authoring";

import ComputeFeatureSubstrateContract from "../contract.js";
import { computeWetlandSubstrateMasks } from "../policy/index.js";
import {
  computeCoastalLandMask,
  computeRiverAdjacencyMask,
  validateFeatureSubstrateInputs,
} from "../rules/index.js";

export const defaultStrategy = createStrategy(ComputeFeatureSubstrateContract, "default", {
  run: (input, config) => {
    validateFeatureSubstrateInputs({
      width: input.width,
      height: input.height,
      riverClass: input.riverClass as Uint8Array,
      navigableRiverMask: input.navigableRiverMask as Uint8Array,
      landMask: input.landMask as Uint8Array,
      elevation: input.elevation as Int16Array,
      discharge: input.discharge as Float32Array,
      sinkMask: input.sinkMask as Uint8Array,
    });

    const width = input.width | 0;
    const height = input.height | 0;
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
