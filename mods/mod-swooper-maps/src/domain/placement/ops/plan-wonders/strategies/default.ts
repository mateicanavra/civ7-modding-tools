import { createStrategy } from "@swooper/mapgen-core/authoring";

import PlanWondersContract from "../contract.js";
export const defaultStrategy = createStrategy(PlanWondersContract, "default", {
  run: (input) => {
    const mapInfo = input.mapInfo;
    let wondersCount = 0;

    if (mapInfo && typeof mapInfo.NumNaturalWonders === "number") {
      wondersCount = Math.max(0, Math.round(mapInfo.NumNaturalWonders));
    }

    return { wondersCount };
  },
});
