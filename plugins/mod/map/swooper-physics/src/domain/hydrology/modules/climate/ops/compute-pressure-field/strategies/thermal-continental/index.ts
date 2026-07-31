import { createStrategy } from "@swooper/mapgen-core/authoring";

import ComputePressureFieldContract from "../../contract.js";
import { computePressureAnomalyProxy } from "../../rules/index.js";
import ThermalContinentalDefinition from "./config.js";

/** Composes the circulation pressure proxy from admitted thermal and transient evidence. */
const thermalContinentalStrategy = createStrategy(
  ComputePressureFieldContract,
  ThermalContinentalDefinition,
  {
    run: (input, config) => ({
      pressure: computePressureAnomalyProxy(
        input.width,
        input.height,
        input.latitudeByRow,
        input.surfaceTemperatureC,
        input.meanSurfaceTemperatureC,
        input.landMask,
        input.rngSeed,
        input.seasonSalt,
        input.transientPolarity ?? 1,
        config
      ),
    }),
  }
);

export default thermalContinentalStrategy;
