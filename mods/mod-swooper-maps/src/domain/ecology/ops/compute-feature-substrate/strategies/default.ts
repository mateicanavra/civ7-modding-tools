import { createStrategy } from "@swooper/mapgen-core/authoring";

import ComputeFeatureSubstrateContract from "../contract.js";
import {
  computeCoastalLandMask,
  computeNavigableRiverMask,
  computeRiverAdjacencyMask,
  validateFeatureSubstrateInputs,
} from "../rules/index.js";

export const defaultStrategy = createStrategy(ComputeFeatureSubstrateContract, "default", {
  run: (input, config) => {
    const size = validateFeatureSubstrateInputs({
      width: input.width,
      height: input.height,
      riverClass: input.riverClass as Uint8Array,
      landMask: input.landMask as Uint8Array,
    });

    const width = input.width | 0;
    const height = input.height | 0;
    const riverClass = input.riverClass as Uint8Array;
    const landMask = input.landMask as Uint8Array;

    const navigableRiverMask = computeNavigableRiverMask({
      size,
      riverClass,
      navigableRiverClass: config.navigableRiverClass,
    });

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

    return { navigableRiverMask, nearRiverMask, isolatedRiverMask, coastalLandMask };
  },
});

