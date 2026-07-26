import { createStrategy } from "@swooper/mapgen-core/authoring";

import ComputeOceanThermalStateContract from "../../contract.js";
import { computeOceanThermalState } from "../../rules/index.js";
import LatitudeCurrentAdvectionDefinition from "./config.js";

/**
 * Initializes SST from latitude, advects and diffuses it along admitted currents, then classifies
 * sea ice with the same authored threshold. Fixed passes keep the thermal state reproducible while
 * shelf and current evidence reshape the zonal baseline.
 */
const latitudeCurrentAdvectionStrategy = createStrategy(
  ComputeOceanThermalStateContract,
  LatitudeCurrentAdvectionDefinition,
  {
    run: (input, config) => {
      const width = input.width;
      const height = input.height;

      return computeOceanThermalState(
        width,
        height,
        input.latitudeByRow,
        input.isWaterMask,
        input.shelfMask,
        input.currentU,
        input.currentV,
        {
          equatorTempC: config.equatorTempC,
          poleTempC: config.poleTempC,
          advectIters: config.advectIters,
          diffusion: config.diffusion,
          secondaryWeightMin: config.secondaryWeightMin,
          seaIceThresholdC: config.seaIceThresholdC,
        }
      );
    },
  }
);

export default latitudeCurrentAdvectionStrategy;
