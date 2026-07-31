import { createStrategy } from "@swooper/mapgen-core/authoring";
import ComputeAtmosphericCirculationContract from "../../contract.js";
import { computeWinds } from "../../rules/index.js";
import LatitudeDefinition from "./config.js";

/**
 * Builds prevailing winds directly from latitude bands and seeded jet variation, deliberately
 * omitting pressure response, continuous cell shaping, and perturbation budgeting. It remains the
 * deterministic low-cost fallback to geostrophic projection.
 */
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
