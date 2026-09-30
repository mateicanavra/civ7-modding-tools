import type { StandardRecipeConfig } from "../../../src/recipes/standard/recipe.js";

declare const completeConfig: StandardRecipeConfig;

const completeAsInput: StandardRecipeConfig = completeConfig;

const fixedProjectionConfig: StandardRecipeConfig["map-morphology"] = {};
// @ts-expect-error Fixed projection stages do not expose fictional knobs.
const fixedProjectionKnobs: StandardRecipeConfig["map-morphology"] = { knobs: {} };
// @ts-expect-error Retired procedural projection and quota selectors are not authored configuration.
const riverProjectionConfig: StandardRecipeConfig["map-rivers"] = { projection: { model: "legacy-procedural" } };
const authoredRiverProjectionConfig: StandardRecipeConfig["map-rivers"] = {};
// @ts-expect-error Fixed native projection has no dummy mode selector.
const oldAuthoredSelector: StandardRecipeConfig["map-rivers"] = { projection: { model: "authored-network" } };
// @ts-expect-error The physical model is a single supported literal, not a legacy selector.
const oldWaterModel: StandardRecipeConfig["hydrology-hydrography"]["water"]["model"] = "legacy-sink-budget";

// @ts-expect-error A persisted recipe config requires every stage.
const emptyComplete: StandardRecipeConfig = {};

void completeAsInput;
void fixedProjectionConfig;
void fixedProjectionKnobs;
void riverProjectionConfig;
void authoredRiverProjectionConfig;
void oldAuthoredSelector;
void oldWaterModel;
void emptyComplete;
