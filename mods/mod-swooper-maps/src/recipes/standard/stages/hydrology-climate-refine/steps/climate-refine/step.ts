import {
  HYDROLOGY_DRYNESS_WETNESS_SCALE,
  HYDROLOGY_TEMPERATURE_BASE_TEMPERATURE_C,
} from "@mapgen/domain/hydrology/model/policy/climate-knob-policy.js";
import { computeRiverAdjacencyMaskFromRiverClass } from "@mapgen/domain/hydrology/model/policy/river-adjacency.js";
import {
  isMajorRiverClass,
  isMinorRiverClass,
  RIVER_CLASS_NONE,
} from "@mapgen/domain/hydrology/model/policy/river-class.js";
import { ctxRandom, ctxRandomLabel } from "@swooper/mapgen-core";
import { createStep } from "@swooper/mapgen-core/authoring";
import { ClimateRefineStepContract } from "./config.js";
import { buildClimateRefineVizProjections, type ClimateRefineVizEvidence } from "./viz.js";

type HydrologyCryosphereKnob = "off" | "on";
type HydrologyDrynessKnob = "wet" | "mix" | "dry";
type HydrologyTemperatureKnob = "cold" | "temperate" | "hot";

const EFFECTIVE_MOISTURE_HUMIDITY_WEIGHT = 0.35;
const EFFECTIVE_MOISTURE_RIPARIAN_RADIUS = 1;
const EFFECTIVE_MOISTURE_MINOR_RIVER_BONUS = 4;
const EFFECTIVE_MOISTURE_MAJOR_RIVER_BONUS = 8;

/**
 * Refines baseline climate against topography and hydrography, publishing
 * cryosphere state, water-budget indices, and diagnostics as one bounded result.
 */
export const ClimateRefineStep = createStep(ClimateRefineStepContract, {
  normalize: (config, ctx) => {
    const { dryness, temperature, cryosphere } = ctx.knobs as {
      dryness: HydrologyDrynessKnob;
      temperature: HydrologyTemperatureKnob;
      cryosphere: HydrologyCryosphereKnob;
    };

    const wetnessScale = HYDROLOGY_DRYNESS_WETNESS_SCALE[dryness];
    const baseTemperatureC = HYDROLOGY_TEMPERATURE_BASE_TEMPERATURE_C[temperature];

    const next = { ...config };

    if (next.computeThermalState.strategy === "default") {
      const deltaC = baseTemperatureC - HYDROLOGY_TEMPERATURE_BASE_TEMPERATURE_C.temperate;
      if (deltaC !== 0) {
        next.computeThermalState = {
          ...next.computeThermalState,
          config: {
            ...next.computeThermalState.config,
            // Temperature knobs should not simply warm/cool the whole world uniformly (that erases tundra/snow).
            // Instead, bias the baseline modestly and put most of the adjustment into the equator-to-pole contrast.
            baseTemperatureC: next.computeThermalState.config.baseTemperatureC + deltaC * 0.5,
            insolationScaleC: Math.max(
              0,
              Math.min(80, next.computeThermalState.config.insolationScaleC + deltaC * 2)
            ),
          },
        };
      }
    }

    if (next.computePrecipitation.strategy === "refine") {
      const cur = next.computePrecipitation.config;
      next.computePrecipitation = {
        ...next.computePrecipitation,
        config: {
          ...cur,
          riverCorridor: {
            ...cur.riverCorridor,
            lowlandAdjacencyBonus: Math.round(
              cur.riverCorridor.lowlandAdjacencyBonus * wetnessScale
            ),
            highlandAdjacencyBonus: Math.round(
              cur.riverCorridor.highlandAdjacencyBonus * wetnessScale
            ),
          },
          lowBasin: {
            ...cur.lowBasin,
            delta: Math.round(cur.lowBasin.delta * wetnessScale),
          },
        },
      };
    }

    if (cryosphere === "off") {
      if (next.applyAlbedoFeedback.strategy === "default") {
        next.applyAlbedoFeedback = {
          ...next.applyAlbedoFeedback,
          config: { ...next.applyAlbedoFeedback.config, iterations: 0 },
        };
      }

      if (next.computeCryosphereState.strategy === "default") {
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
  run: (context, config, ops, deps) => {
    const { width, height } = context.dimensions;
    const windField = deps.artifacts.windField.read(context);
    const hydrography = deps.artifacts.hydrography.read(context) as { riverClass: Uint8Array };
    const topography = deps.artifacts.topography.read(context) as {
      elevation: Int16Array;
      landMask: Uint8Array;
    };

    const baselineClimateField = deps.artifacts.baselineClimateField.read(context);

    const { topLatitude, bottomLatitude } = context.env.latitudeBounds;
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

    const size = width * height;
    const humidityF32 = new Float32Array(size);
    for (let i = 0; i < size; i++) {
      const humidity = baselineClimateField.humidity[i];
      if (humidity === undefined) {
        throw new Error(`Baseline climate humidity is missing tile index ${i}.`);
      }
      humidityF32[i] = humidity / 255;
    }

    const stepId = `${ClimateRefineStepContract.phase}/${ClimateRefineStepContract.id}`;
    const perlinSeed = ctxRandom(
      context,
      ctxRandomLabel(stepId, "hydrology/compute-precipitation/noise"),
      2_147_483_647
    );

    const riverAdjacency = computeRiverAdjacencyMaskFromRiverClass({
      width,
      height,
      riverClass: hydrography.riverClass,
      radius: 1,
    });

    const refined = ops.computePrecipitation(
      {
        width,
        height,
        latitudeByRow,
        elevation: topography.elevation,
        landMask: topography.landMask,
        windU: windField.windU,
        windV: windField.windV,
        humidityF32,
        rainfallIn: baselineClimateField.rainfall,
        humidityIn: baselineClimateField.humidity,
        riverAdjacency,
        perlinSeed,
      },
      config.computePrecipitation
    );

    const riparianBonusByTile = new Float32Array(size);
    for (let y = 0; y < height; y++) {
      const y0 = Math.max(0, y - EFFECTIVE_MOISTURE_RIPARIAN_RADIUS);
      const y1 = Math.min(height - 1, y + EFFECTIVE_MOISTURE_RIPARIAN_RADIUS);
      const yOffset = y * width;
      for (let x = 0; x < width; x++) {
        const x0 = Math.max(0, x - EFFECTIVE_MOISTURE_RIPARIAN_RADIUS);
        const x1 = Math.min(width - 1, x + EFFECTIVE_MOISTURE_RIPARIAN_RADIUS);

        let maxClass = RIVER_CLASS_NONE;
        for (let yy = y0; yy <= y1; yy++) {
          const yyOffset = yy * width;
          for (let xx = x0; xx <= x1; xx++) {
            const cls = hydrography.riverClass[yyOffset + xx] ?? RIVER_CLASS_NONE;
            if (cls > maxClass) maxClass = cls;
            if (isMajorRiverClass(maxClass)) break;
          }
          if (isMajorRiverClass(maxClass)) break;
        }

        const idx = yOffset + x;
        if (isMajorRiverClass(maxClass)) {
          riparianBonusByTile[idx] = EFFECTIVE_MOISTURE_MAJOR_RIVER_BONUS;
        } else if (isMinorRiverClass(maxClass)) {
          riparianBonusByTile[idx] = EFFECTIVE_MOISTURE_MINOR_RIVER_BONUS;
        }
      }
    }

    const effectiveMoisture = new Float32Array(size);
    for (let i = 0; i < size; i++) {
      if (topography.landMask[i] === 0) {
        effectiveMoisture[i] = 0;
        continue;
      }
      const rainfall = refined.rainfall[i] ?? 0;
      const humidity = refined.humidity[i] ?? 0;
      const riparianBonus = riparianBonusByTile[i] ?? 0;
      effectiveMoisture[i] =
        rainfall + EFFECTIVE_MOISTURE_HUMIDITY_WEIGHT * humidity + riparianBonus;
    }

    const forcing = ops.computeRadiativeForcing(
      { width, height, latitudeByRow },
      config.computeRadiativeForcing
    );
    const thermal = ops.computeThermalState(
      {
        width,
        height,
        insolation: forcing.insolation,
        elevation: topography.elevation,
        landMask: topography.landMask,
      },
      config.computeThermalState
    );

    const albedoFeedback = ops.applyAlbedoFeedback(
      {
        width,
        height,
        landMask: topography.landMask,
        rainfall: refined.rainfall,
        surfaceTemperatureC: thermal.surfaceTemperatureC,
      },
      config.applyAlbedoFeedback
    );

    const cryosphere = ops.computeCryosphereState(
      {
        width,
        height,
        landMask: topography.landMask,
        surfaceTemperatureC: albedoFeedback.surfaceTemperatureC,
        rainfall: refined.rainfall,
      },
      config.computeCryosphereState
    );

    const waterBudget = ops.computeLandWaterBudget(
      {
        width,
        height,
        landMask: topography.landMask,
        rainfall: refined.rainfall,
        humidity: refined.humidity,
        surfaceTemperatureC: albedoFeedback.surfaceTemperatureC,
      },
      config.computeLandWaterBudget
    );

    const diagnostics = ops.computeClimateDiagnostics(
      {
        width,
        height,
        latitudeByRow,
        elevation: topography.elevation,
        landMask: topography.landMask,
        windU: windField.windU,
        windV: windField.windV,
        rainfall: refined.rainfall,
        humidity: refined.humidity,
      },
      config.computeClimateDiagnostics
    );

    const climateField = {
      rainfall: new Uint8Array(refined.rainfall),
      humidity: new Uint8Array(refined.humidity),
    };
    const climateIndices = {
      surfaceTemperatureC: albedoFeedback.surfaceTemperatureC,
      effectiveMoisture,
      pet: waterBudget.pet,
      aridityIndex: waterBudget.aridityIndex,
      freezeIndex: cryosphere.freezeIndex,
    };
    const publishedCryosphere = {
      snowCover: cryosphere.snowCover,
      seaIceCover: cryosphere.seaIceCover,
      albedo: cryosphere.albedo,
      groundIce01: cryosphere.groundIce01,
      permafrost01: cryosphere.permafrost01,
      meltPotential01: cryosphere.meltPotential01,
    };
    const publishedDiagnostics = {
      rainShadowIndex: diagnostics.rainShadowIndex,
      continentalityIndex: diagnostics.continentalityIndex,
      convergenceIndex: diagnostics.convergenceIndex,
    };
    deps.artifacts.climateField.publish(context, climateField);
    deps.artifacts.climateIndices.publish(context, climateIndices);
    deps.artifacts.cryosphere.publish(context, publishedCryosphere);
    deps.artifacts.climateDiagnostics.publish(context, publishedDiagnostics);

    return {
      climateField,
      climateIndices,
      cryosphere: publishedCryosphere,
      diagnostics: publishedDiagnostics,
    } satisfies ClimateRefineVizEvidence;
  },
  viz: ({ result, dimensions }) => buildClimateRefineVizProjections(result, dimensions),
});
