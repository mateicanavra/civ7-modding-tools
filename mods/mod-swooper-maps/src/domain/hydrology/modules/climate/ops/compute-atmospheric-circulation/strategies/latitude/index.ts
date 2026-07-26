import { createStrategy } from "@swooper/mapgen-core/authoring";
import ComputeAtmosphericCirculationContract from "../../contract.js";
import { computeWinds } from "../../rules/index.js";
import LatitudeDefinition from "./config.js";

/** Latitude bands and seeded jet variation provide a deterministic low-cost prevailing-wind fallback. */
const latitudeStrategy = createStrategy(ComputeAtmosphericCirculationContract, LatitudeDefinition, {
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

export default latitudeStrategy;
