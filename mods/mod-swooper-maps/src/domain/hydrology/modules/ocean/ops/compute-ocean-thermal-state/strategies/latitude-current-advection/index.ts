import { createStrategy } from "@swooper/mapgen-core/authoring";

import ComputeOceanThermalStateContract from "../../contract.js";
import { computeOceanThermalState } from "../../rules/index.js";
import LatitudeCurrentAdvectionDefinition from "./config.js";

/** Current-weighted advection reshapes a latitudinal SST field before a shared threshold classifies sea ice. */
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
