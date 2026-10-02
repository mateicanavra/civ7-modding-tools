import { createMockAdapter } from "@civ7/adapter";
import { getCiv7StandardMapSizePreset } from "@civ7/map-policy";
import { createMapContext } from "@swooper/mapgen-core";
import { readArtifact } from "@swooper/mapgen-core/authoring";
import {
  buildStepTestDependencies,
  publishTestArtifact,
  validateSchemaValueForTest,
  withMapContextExecutionForTest,
} from "@swooper/mapgen-core/testing";
import { artifacts as climateArtifacts } from "../../../../../src/domain/hydrology/modules/climate/artifacts/index.js";
import hydrology from "../../../../../src/domain/hydrology/router.js";
import { artifacts as landformArtifacts } from "../../../../../src/domain/morphology/modules/landforms/artifacts/index.js";
import { artifacts as shelfArtifacts } from "../../../../../src/domain/morphology/modules/shelf/artifacts/index.js";
import morphology from "../../../../../src/domain/morphology/router.js";
import recipe from "../../../../../src/recipes/standard/recipe.js";
import { config as climateConfig } from "../../../../../src/recipes/standard/stages/hydrology/climate/baseline/steps/climate-baseline/config.js";
import { ClimateBaselineStep } from "../../../../../src/recipes/standard/stages/hydrology/climate/baseline/steps/climate-baseline/step.js";
import { createStandardRecipeTestInitialSetup, standardMapConfig } from "../standard-recipe.js";
import { createEarthReferenceSurface, earthReference, northFirstIndex } from "./reference.js";

export type EarthCoastClimateArm = "earth-coast" | "aquaplanet";

/**
 * Test-owned composition of the actual baseline step, not a new recipe or a completed Earth map.
 * Source water (including enclosed water) receives SST; flat relief has no physical height claim.
 */
export function runEarthCoastBaseline(
  arm: EarthCoastClimateArm = "earth-coast",
  recipeConfig = standardMapConfig.config
) {
  const source = createEarthReferenceSurface();
  const { width, height } = source;
  const size = width * height;
  const mapConfig = {
    ...standardMapConfig,
    config: recipeConfig,
    latitudeBounds: {
      topLatitude: earthReference.grid.topLatitude,
      bottomLatitude: earthReference.grid.bottomLatitude,
    },
  };
  const initial = createStandardRecipeTestInitialSetup({
    preset: getCiv7StandardMapSizePreset("MAPSIZE_HUGE"),
    mapConfig,
  });
  const plan = recipe.compile(initial, recipeConfig);
  const node = plan.nodes.find((step) => step.stageId === "hydrology-climate-baseline");
  if (!node) throw new Error("The public Standard plan must contain baseline climate.");
  const config = validateSchemaValueForTest(
    climateConfig.schema,
    node.config,
    "/earth-reference/climate-baseline"
  );
  const context = createMapContext({
    setup: plan.setup,
    adapter: createMockAdapter({ width, height }),
  });
  const landMask = new Uint8Array(size);
  const shelfMask = new Uint8Array(size);
  if (arm === "earth-coast") {
    for (let cell = 0; cell < size; cell++) {
      landMask[northFirstIndex(cell)] = source.landMask[cell]!;
      shelfMask[northFirstIndex(cell)] = source.sourceShelfMask[cell]!;
    }
  }
  const coasts = morphology.coasts.ops.computeCoastalAdjacency;
  const distances = morphology.coasts.ops.computeDistanceToCoast;
  const { coastalLand, coastalWater } = coasts.run(
    { width, height, landMask },
    coasts.defaultConfig
  );
  const coastal = Uint8Array.from(coastalLand, (value, cell) => value || coastalWater[cell]!);
  const { distanceToCoast } = distances.run({ width, height, coastal }, distances.defaultConfig);
  const topography = {
    elevation: new Int16Array(size),
    seaLevel: 0,
    landMask,
    externalWaterMask: Uint8Array.from(landMask, (land) => land === 0 ? 1 : 0),
    bathymetry: new Int16Array(size),
  };
  const shelf = { shelfMask, coastalLand, coastalWater, distanceToCoast };
  const heldInputs = structuredClone({ topography, shelf, config });
  let observation: ReturnType<typeof ClimateBaselineStep.run> | undefined;
  withMapContextExecutionForTest(context, (stepContext) => {
    publishTestArtifact(stepContext, landformArtifacts.topography, topography);
    publishTestArtifact(stepContext, shelfArtifacts.shelf, shelf);
    observation = ClimateBaselineStep.run(
      stepContext,
      config,
      {
        computeSeasonalSampling: hydrology.climate.ops.computeSeasonalSampling.run,
        computeAtmosphericAggregate: hydrology.climate.ops.computeAtmosphericAggregate.run,
        computeMoistureAggregate: hydrology.climate.ops.computeMoistureAggregate.run,
        computeOceanGeometry: hydrology.ocean.ops.computeOceanGeometry.run,
        computeOceanSurfaceCurrents: hydrology.ocean.ops.computeOceanSurfaceCurrents.run,
        computeOceanThermalState: hydrology.ocean.ops.computeOceanThermalState.run,
        computeRadiativeForcing: hydrology.climate.ops.computeRadiativeForcing.run,
        computeThermalState: hydrology.climate.ops.computeThermalState.run,
        computePressureField: hydrology.climate.ops.computePressureField.run,
        computeAtmosphericCirculation: hydrology.climate.ops.computeAtmosphericCirculation.run,
        computeEvaporationSources: hydrology.climate.ops.computeEvaporationSources.run,
        transportMoisture: hydrology.climate.ops.transportMoisture.run,
        computePrecipitation: hydrology.climate.ops.computePrecipitation.run,
        computePotentialDemand: hydrology.climate.ops.computePotentialDemand.run,
      },
      buildStepTestDependencies(ClimateBaselineStep, stepContext)
    );
  });
  if (!observation || observation instanceof Promise)
    throw new Error("Expected synchronous climate evidence.");
  return {
    arm,
    initial,
    mapConfig,
    setup: plan.setup,
    config,
    coastConfigs: { adjacency: coasts.defaultConfig, distance: distances.defaultConfig },
    topography,
    shelf,
    heldInputs,
    baseline: readArtifact(context, climateArtifacts.baselineClimateField),
    thermal: readArtifact(context, climateArtifacts.thermalField),
    pressure: readArtifact(context, climateArtifacts.pressureField),
    wind: readArtifact(context, climateArtifacts.windField),
    observation,
  };
}

export type EarthCoastBaseline = ReturnType<typeof runEarthCoastBaseline>;
