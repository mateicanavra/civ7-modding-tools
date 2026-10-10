import { createStep } from "@swooper/mapgen-core/authoring";
import { config } from "./config.js";
import { buildClimateRefineVizProjections } from "./viz.js";

type HydrologyCryosphereKnob = "off" | "on";

/**
 * Preserves baseline atmospheric climate, refines temperature and derived indices, and publishes
 * physical products while returning advisory diagnostics only to optional evidence projectors.
 */
export const ClimateRefineStep = createStep(config, {
  normalize: (stepConfig, ctx) => {
    const { cryosphere } = ctx.knobs as {
      cryosphere: HydrologyCryosphereKnob;
    };

    const next = { ...stepConfig };

    if (cryosphere === "off") {
      if (next.applyAlbedoFeedback.strategy === "bounded-snow-ice") {
        next.applyAlbedoFeedback = {
          ...next.applyAlbedoFeedback,
          config: { ...next.applyAlbedoFeedback.config, iterations: 0 },
        };
      }

      if (next.computeCryosphereState.strategy === "temperature-thresholds") {
        next.computeCryosphereState = {
          ...next.computeCryosphereState,
          config: {
            ...next.computeCryosphereState.config,
            landSnowStartC: -60,
            landSnowFullC: -80,
            seaIceStartC: -60,
            seaIceFullC: -80,
            freezeIndexStartC: -60,
            freezeIndexFullC: -80,
            precipitationInfluence: 0,
            snowAlbedoBoost: 0,
            seaIceAlbedoBoost: 0,
          },
        };
      }
    }

    return next;
  },
  run: (context, stepConfig, ops, deps) => {
    const { width, height } = context.setup.dimensions;
    const windField = deps.artifacts.windField.read();
    const hydrography = deps.artifacts.hydrography.read();
    const topography = deps.artifacts.topography.read();
    const lakePlan = deps.artifacts.lakePlan.read();
    const exposedLandMask = hydrography.exposedLandMask;

    const baselineClimateField = deps.artifacts.baselineClimateField.read();
    const thermalField = deps.artifacts.thermalField.read();

    const { topLatitude, bottomLatitude } = context.setup.latitudeBounds;
    const latitudeByRow = new Float32Array(height);
    if (height <= 1) {
      const mid = (topLatitude + bottomLatitude) / 2;
      for (let y = 0; y < height; y++) latitudeByRow[y] = mid;
    } else {
      const step = (bottomLatitude - topLatitude) / (height - 1);
      for (let y = 0; y < height; y++) {
        latitudeByRow[y] = topLatitude + step * y;
      }
    }

    const albedoFeedback = ops.applyAlbedoFeedback(
      {
        width,
        height,
        landMask: topography.landMask,
        rainfall: baselineClimateField.rainfall,
        surfaceTemperatureC: thermalField.surfaceTemperatureC,
      },
      stepConfig.applyAlbedoFeedback
    );

    const cryosphere = ops.computeCryosphereState(
      {
        width,
        height,
        landMask: topography.landMask,
        surfaceTemperatureC: albedoFeedback.surfaceTemperatureC,
        rainfall: baselineClimateField.rainfall,
      },
      stepConfig.computeCryosphereState
    );

    const demand = ops.computePotentialDemand(
      {
        width,
        height,
        surfaceTemperatureC: albedoFeedback.surfaceTemperatureC,
        humidity: baselineClimateField.humidity,
        parameters: baselineClimateField.demandParameters,
      },
      stepConfig.computePotentialDemand
    );
    const waterBudget = ops.computeLandWaterBudget(
      {
        width,
        height,
        landMask: exposedLandMask,
        externalWaterMask: topography.externalWaterMask,
        elevation: topography.elevation,
        componentId: lakePlan.componentId,
        discharge: hydrography.discharge,
        runoff: hydrography.runoff,
        bodies: lakePlan.bodies,
        rainfall: baselineClimateField.rainfall,
        humidity: baselineClimateField.humidity,
        pet: demand.pet,
      },
      stepConfig.computeLandWaterBudget
    );

    const diagnostics = ops.computeClimateDiagnostics(
      {
        width,
        height,
        latitudeByRow,
        elevation: topography.elevation,
        landMask: exposedLandMask,
        windU: windField.windU,
        windV: windField.windV,
        rainfall: baselineClimateField.rainfall,
      },
      stepConfig.computeClimateDiagnostics
    );

    const climateField = deps.artifacts.climateField.publish({
      rainfall: new Uint8Array(baselineClimateField.rainfall),
      humidity: new Uint8Array(baselineClimateField.humidity),
    });
    const climateIndices = deps.artifacts.climateIndices.publish({
      surfaceTemperatureC: albedoFeedback.surfaceTemperatureC,
      effectiveMoisture: waterBudget.effectiveMoisture,
      pet: waterBudget.pet,
      aridityIndex: waterBudget.aridityIndex,
      plantEffectiveMoisture: waterBudget.plantEffectiveMoisture,
      plantWaterStress: waterBudget.plantWaterStress,
      freezeIndex: cryosphere.freezeIndex,
    });
    const publishedCryosphere = deps.artifacts.cryosphere.publish({
      snowCover: cryosphere.snowCover,
      seaIceCover: cryosphere.seaIceCover,
      albedo: cryosphere.albedo,
      groundIce01: cryosphere.groundIce01,
      permafrost01: cryosphere.permafrost01,
      meltPotential01: cryosphere.meltPotential01,
    });

    return {
      climateField,
      climateIndices,
      cryosphere: publishedCryosphere,
      diagnostics,
    };
  },
  viz: ({ observation, dimensions }) => buildClimateRefineVizProjections(observation, dimensions),
});
