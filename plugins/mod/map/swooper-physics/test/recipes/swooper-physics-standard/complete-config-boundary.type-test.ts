import type { StandardRecipeConfig } from "../../../src/recipes/standard/recipe.js";

declare const completeConfig: StandardRecipeConfig;

const completeAsInput: StandardRecipeConfig = completeConfig;

const fixedProjectionConfig: StandardRecipeConfig["map-morphology"] = {};
// @ts-expect-error Fixed projection stages do not expose fictional knobs.
const fixedProjectionKnobs: StandardRecipeConfig["map-morphology"] = { knobs: {} };
const riverProjectionConfig: StandardRecipeConfig["map-rivers"] = {
  projection: {
    model: "legacy-procedural",
    navigableRiverDensity: "normal",
    endpointDischargePercentileMin: 0.94,
    targetMajorTileFraction: 0.28,
  },
};
const authoredRiverProjectionConfig: StandardRecipeConfig["map-rivers"] = {
  projection: { model: "authored-network" },
};

// @ts-expect-error A persisted recipe config requires every stage.
const emptyComplete: StandardRecipeConfig = {};

void completeAsInput;
void fixedProjectionConfig;
void fixedProjectionKnobs;
void riverProjectionConfig;
void authoredRiverProjectionConfig;
void emptyComplete;
