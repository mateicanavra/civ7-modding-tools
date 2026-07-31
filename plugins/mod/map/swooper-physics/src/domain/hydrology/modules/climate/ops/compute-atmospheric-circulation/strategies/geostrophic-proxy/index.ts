import { createStrategy } from "@swooper/mapgen-core/authoring";

import ComputeAtmosphericCirculationContract from "../../contract.js";
import { computeWindsEarthlike } from "../../rules/index.js";
import GeostrophicProxyDefinition from "./config.js";

/** Synthesizes wind vectors from a continuous latitude-cell backbone and supplied pressure. */
const geostrophicProxyStrategy = createStrategy(
  ComputeAtmosphericCirculationContract,
  GeostrophicProxyDefinition,
  {
    run: (input, config) => {
      const width = input.width;
      const height = input.height;

      return computeWindsEarthlike(width, height, input.latitudeByRow, {
        pressureField: input.pressureField,
        maxSpeed: config.maxSpeed,
        zonalStrength: config.zonalStrength,
        meridionalStrength: config.meridionalStrength,
        pressureDrivenRms: config.pressureDrivenRms,
        smoothIters: config.smoothIters,
        equatorialTaperDeg: config.equatorialTaperDeg,
      });
    },
  }
);

export default geostrophicProxyStrategy;
