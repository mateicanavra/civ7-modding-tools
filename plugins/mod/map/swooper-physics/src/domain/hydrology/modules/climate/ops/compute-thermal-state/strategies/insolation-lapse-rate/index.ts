import { createStrategy } from "@swooper/mapgen-core/authoring";
import ComputeThermalStateContract from "../../contract.js";
import { clampNumber } from "../../rules/index.js";
import InsolationLapseRateDefinition from "./config.js";

/**
 * Converts insolation and land height above sea level into bounded temperature, with an explicit
 * continental cooling term. Water uses admitted SST or sea-level forcing, never bathymetric lapse.
 */
const insolationLapseRateStrategy = createStrategy(
  ComputeThermalStateContract,
  InsolationLapseRateDefinition,
  {
    run: (input, config) => {
      if (input.model !== "insolation-lapse-rate")
        throw new RangeError("insolation-lapse-rate requires its matching input model.");
      const width = input.width;
      const height = input.height;
      const size = width * height;

      const surfaceTemperatureC = new Float32Array(size);
      const base = config.baseTemperatureC;
      const insolationScale = config.insolationScaleC;
      const lapseRate = config.lapseRateCPerElevationUnit;
      const landCooling = config.landCoolingC;
      const minC = config.minC;
      const maxC = config.maxC;
      const sstC = input.sstC;

      for (let i = 0; i < size; i++) {
        const forcing = (input.insolation[i] ?? 0) - 0.5;
        const isLand = input.landMask[i] === 1;
        if (!isLand && sstC) {
          surfaceTemperatureC[i] = clampNumber(sstC[i] ?? minC, minC, maxC);
          continue;
        }
        const landHeight = isLand ? Math.max(0, (input.elevation[i] | 0) - input.seaLevel) : 0;
        const temp =
          base + forcing * insolationScale + landHeight * lapseRate - (isLand ? landCooling : 0);
        surfaceTemperatureC[i] = clampNumber(temp, minC, maxC);
      }

      return { model: "insolation-lapse-rate", surfaceTemperatureC } as const;
    },
  }
);

export default insolationLapseRateStrategy;
