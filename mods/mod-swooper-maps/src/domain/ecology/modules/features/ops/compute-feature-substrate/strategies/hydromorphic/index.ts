import { isAnyRiverClass } from "@mapgen/domain/hydrology/modules/hydrography/model/policy/river-class.js";
import { createStrategy } from "@swooper/mapgen-core/authoring";

import Contract from "../../contract.js";
import {
  computeCoastalLandMask,
  computeRiverAdjacencyMask,
  computeWetlandSubstrateMasks,
} from "../../rules/index.js";
import StrategyDefinition from "./config.js";

/** Builds hydromorphic and coastal eligibility masks from admitted hydrography and elevation evidence. */
const hydromorphicStrategy = createStrategy(Contract, StrategyDefinition, {
  run: (input, config) => {
    const width = input.width;
    const height = input.height;
    const riverClass = input.riverClass;
    const navigableRiverMask = input.navigableRiverMask;
    const landMask = input.landMask;
    const elevation = input.elevation;
    const discharge = input.discharge;
    const sinkMask = input.sinkMask;
    const riverMask = new Uint8Array(riverClass.length);
    for (let index = 0; index < riverClass.length; index++) {
      riverMask[index] = isAnyRiverClass(riverClass[index]) ? 1 : 0;
    }

    const nearRiverMask = computeRiverAdjacencyMask({
      width,
      height,
      riverMask,
      radius: config.nearRiverRadius,
    });

    const isolatedRiverMask = computeRiverAdjacencyMask({
      width,
      height,
      riverMask,
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
      riverMask,
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
      navigableRiverMask: new Uint8Array(navigableRiverMask),
      nearRiverMask,
      isolatedRiverMask,
      coastalLandMask,
      ...wetlandSubstrate,
    };
  },
});

export default hydromorphicStrategy;
