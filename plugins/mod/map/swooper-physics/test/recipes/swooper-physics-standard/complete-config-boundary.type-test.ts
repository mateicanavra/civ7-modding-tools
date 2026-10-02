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

type ClimateBaseline = StandardRecipeConfig["hydrology-climate-baseline"]["climate-baseline"];
// @ts-expect-error Saved pre-periodic sampling is not current authored configuration.
const oldClimateSampling: ClimateBaseline["computeSeasonalSampling"]["strategy"] = "legacy-snapshots";
// @ts-expect-error Saved shifted-curve solar forcing is not current authored configuration.
const oldSolarForcing: ClimateBaseline["computeRadiativeForcing"]["strategy"] = "latitude-insolation";
// @ts-expect-error Saved instantaneous thermal forcing is not current authored configuration.
const oldThermalModel: ClimateBaseline["computeThermalState"]["strategy"] = "insolation-lapse-rate";
// @ts-expect-error Removed controls are refused, not translated into an annual offset.
const oldThermalControls: ClimateBaseline["computeThermalState"]["config"] = { baseTemperatureC: 9 };

// @ts-expect-error A persisted recipe config requires every stage.
const emptyComplete: StandardRecipeConfig = {};

void completeAsInput;
void fixedProjectionConfig;
void fixedProjectionKnobs;
void riverProjectionConfig;
void authoredRiverProjectionConfig;
void oldAuthoredSelector;
void oldWaterModel;
void oldClimateSampling;
void oldSolarForcing;
void oldThermalModel;
void oldThermalControls;
void emptyComplete;
