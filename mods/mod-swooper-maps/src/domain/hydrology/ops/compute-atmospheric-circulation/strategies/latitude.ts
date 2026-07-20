import { createStrategy } from "@swooper/mapgen-core/authoring";
import ComputeAtmosphericCirculationContract from "../contract.js";
import { computeWinds } from "../rules/index.js";

export const latitudeStrategy = createStrategy(ComputeAtmosphericCirculationContract, "latitude", {
  run: (input, config) => {
    const width = input.width;
    const height = input.height;
    const rngSeed = input.rngSeed | 0;
    const latitudeByRow = input.latitudeByRow;

    return computeWinds(width, height, latitudeByRow, {
      seed: rngSeed,
      jetStreaks: config.windJetStreaks,
      jetStrength: config.windJetStrength,
      variance: config.windVariance,
    });
  },
});
