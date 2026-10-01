import { createStep } from "@swooper/mapgen-core/authoring";
import { HYDROLOGY_DRYNESS_WETNESS_SCALE } from "../../../model/policy/climate-knob-policy.js";
import { config } from "./config.js";
import { buildClimateRefineVizProjections } from "./viz.js";

type HydrologyCryosphereKnob = "off" | "on";
type HydrologyDrynessKnob = "wet" | "mix" | "dry";

/**
 * Refines baseline climate against topography and hydrography, publishing physical products while
 * returning advisory diagnostics only to optional evidence projectors.
 */
export const ClimateRefineStep = createStep(config, {
  normalize: (stepConfig, ctx) => {
    const { dryness, cryosphere } = ctx.knobs as {
      dryness: HydrologyDrynessKnob;
      cryosphere: HydrologyCryosphereKnob;
    };

    const wetnessScale = HYDROLOGY_DRYNESS_WETNESS_SCALE[dryness];

    const next = { ...stepConfig };

    const precipitationRefinement = next.refinePrecipitation.config;
    next.refinePrecipitation = {
      ...next.refinePrecipitation,
      config: {
        ...precipitationRefinement,
        riverCorridor: {
          ...precipitationRefinement.riverCorridor,
          lowlandAdjacencyBonus: Math.round(
            precipitationRefinement.riverCorridor.lowlandAdjacencyBonus * wetnessScale
          ),
          highlandAdjacencyBonus: Math.round(
            precipitationRefinement.riverCorridor.highlandAdjacencyBonus * wetnessScale
          ),
        },
        lowBasin: {
          ...precipitationRefinement.lowBasin,
          delta: Math.round(precipitationRefinement.lowBasin.delta * wetnessScale),
        },
      },
    };

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

    const refined = ops.refinePrecipitation(
      {
        width,
        height,
        elevation: topography.elevation,
        landMask: exposedLandMask,
        rainfall: baselineClimateField.rainfall,
        humidity: baselineClimateField.humidity,
        riverClass: hydrography.riverClass,
      },
      stepConfig.refinePrecipitation
    );

    const albedoFeedback = ops.applyAlbedoFeedback(
      {
        width,
        height,
        landMask: topography.landMask,
        rainfall: refined.rainfall,
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
        rainfall: refined.rainfall,
      },
      stepConfig.computeCryosphereState
    );

    const demand = ops.computePotentialDemand(
      {
        width,
        height,
        surfaceTemperatureC: albedoFeedback.surfaceTemperatureC,
        humidity: refined.humidity,
        parameters: baselineClimateField.demandParameters,
      },
      stepConfig.computePotentialDemand
    );
    const waterBudget = ops.computeLandWaterBudget(
      {
        width,
        height,
        landMask: exposedLandMask,
        rainfall: refined.rainfall,
        humidity: refined.humidity,
        pet: demand.pet,
        riverClass: hydrography.riverClass,
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
        rainfall: refined.rainfall,
      },
      stepConfig.computeClimateDiagnostics
    );

    const climateField = deps.artifacts.climateField.publish({
      rainfall: new Uint8Array(refined.rainfall),
      humidity: new Uint8Array(refined.humidity),
    });
    const climateIndices = deps.artifacts.climateIndices.publish({
      surfaceTemperatureC: albedoFeedback.surfaceTemperatureC,
      effectiveMoisture: waterBudget.effectiveMoisture,
      pet: waterBudget.pet,
      aridityIndex: waterBudget.aridityIndex,
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
