import { createStrategy } from "@swooper/mapgen-core/authoring";
import ComputeRadiativeForcingContract from "../contract.js";
import { computeInsolationByLatitude } from "../rules/index.js";

export const defaultStrategy = createStrategy(ComputeRadiativeForcingContract, "default", {
  run: (input, config) => {
    const width = input.width;
    const height = input.height;
    const size = width * height;
    const latitudeByRow = input.latitudeByRow;

    const insolation = new Float32Array(size);
    const equator = config.equatorInsolation;
    const pole = config.poleInsolation;
    const exponent = config.latitudeExponent;

    for (let y = 0; y < height; y++) {
      const lat = Math.abs(latitudeByRow[y] ?? 0);
      const value = computeInsolationByLatitude(lat, { equator, pole, exponent });
      const row = y * width;
      for (let x = 0; x < width; x++) {
        insolation[row + x] = value;
      }
    }

    return { insolation } as const;
  },
});
