// ============================================================================
// DEFAULT PIPELINE CONFIGURATION
// ============================================================================
// This is the default configuration for the map generation pipeline.
//
// Backend Engineers: This structure should match your pipeline schema.
// Each stage contains knobs plus recipe-owned public config groups or internal
// step-id config where a stage has no public surface.
// ============================================================================

import type { PipelineConfig } from "../types";

export const defaultConfig: PipelineConfig = {
  // ============================================================================
  // Foundation Stage
  // Creates the base mesh, crust, and tectonic structure
  // ============================================================================
  foundation: {
    knobs: {
      plateCount: 28,
      plateActivity: 0.5,
    },
  },

  // ============================================================================
  // Morphology Coasts Stage
  // Landmass formation + coastline shaping
  // ============================================================================
  "morphology-coasts": {
    knobs: {
      seaLevel: "earthlike",
      coastRuggedness: "normal",
    },
    "landmass-plates": {
      substrate: {
        strategy: "default",
        config: {
          continentalBaseErodibility: 0.63,
          oceanicBaseErodibility: 0.53,
          continentalBaseSediment: 0.19,
          oceanicBaseSediment: 0.29,
        },
      },
      seaLevel: {
        strategy: "default",
        config: {
          targetWaterPercent: 63,
          targetScalar: 1,
          variance: 1.5,
        },
      },
    },
  },

  // ============================================================================
  // Morphology Routing Stage
  // Drainage routing truth
  // ============================================================================
  "morphology-routing": {
    routing: {
      routing: {
        strategy: "default",
        config: {},
      },
    },
  },

  // Morphology Erosion Stage
  // Erosion and geomorphology
  // ============================================================================
  "morphology-erosion": {
    knobs: {
      erosion: "normal",
    },
    geomorphology: {
      geomorphology: {
        strategy: "default",
        config: {
          geomorphology: {
            fluvial: { rate: 0.26, m: 0.5, n: 1 },
            diffusion: { rate: 0.23, talus: 0.5 },
            deposition: { rate: 0.11 },
            eras: 3,
          },
          worldAge: "mature",
        },
      },
    },
  },

  // ============================================================================
  // Morphology Features Stage
  // Islands, volcanism, landmass decomposition
  // ============================================================================
  "morphology-features": {
    knobs: {
      volcanism: "normal",
    },
  },

  // Hydrology & Climate Baseline Stage
  // Climate simulation and water systems
  // ============================================================================
  "hydrology-climate-baseline": {
    knobs: {
      dryness: "mix",
      temperature: "hot",
      seasonality: "high",
      oceanCoupling: "earthlike",
    },
    seasonalCycle: {
      modeCount: 4,
      axialTiltDeg: 23,
    },
    solarForcing: {
      equatorInsolation: 1.5,
      poleInsolation: 0.22,
      latitudeExponent: 1.2,
    },
    thermalState: {
      baseTemperatureC: 8,
      insolationScaleC: 50,
      lapseRateCPerM: -0.0065,
      landCoolingC: 3.2,
      minC: -40,
      maxC: 50,
    },
    atmosphericCirculation: {
      maxSpeed: 160,
      zonalStrength: 130,
      meridionalStrength: 130,
      geostrophicStrength: 170,
      pressureNoiseScale: 20,
      pressureNoiseAmp: 62,
      waveStrength: 48,
      landHeatStrength: 23,
      mountainDeflectStrength: 22,
      smoothIters: 5,
    },
    oceanCurrents: {
      maxSpeed: 80,
      windStrength: 0.58,
      ekmanStrength: 0.38,
      gyreStrength: 30,
      coastStrength: 36,
      smoothIters: 4,
      projectionIters: 8,
    },
    oceanGeometry: {
      maxCoastDistance: 64,
      maxCoastVectorDistance: 10,
    },
    oceanThermalState: {
      equatorTempC: 27,
      poleTempC: -1,
      advectIters: 30,
      diffusion: 0.2,
      secondaryWeightMin: 0.25,
      seaIceThresholdC: -1,
    },
    evaporation: {
      oceanStrength: 1,
      landStrength: 0.2,
      minTempC: -10,
      maxTempC: 32,
    },
    moistureTransport: {
      iterations: 26,
      advection: 0.74,
      retention: 0.91,
      secondaryWeightMin: 0.2,
    },
    precipitation: {
      rainfallScale: 174,
      humidityExponent: 1.05,
      noiseAmplitude: 14,
      noiseScale: 0.16,
      waterGradient: {
        radius: 6,
        perRingBonus: 5,
        lowlandBonus: 3,
        lowlandElevationMax: 200,
      },
      upliftStrength: 27,
      convergenceStrength: 19,
    },
  },

  // ============================================================================
  // Hydrology Hydrography Stage
  // Runoff, river classification, and lake intent
  // ============================================================================
  "hydrology-hydrography": {
    knobs: {
      riverDensity: "normal",
      lakeiness: "many",
    },
    runoff: {
      runoffScale: 1,
      infiltrationFraction: 0.18,
      humidityDampening: 0.22,
      minRunoff: 0,
    },
    riverNetwork: {
      minorPercentile: 0.78,
      majorPercentile: 0.91,
      minMinorDischarge: 0,
      minMajorDischarge: 0,
    },
    lakes: {
      maxUpstreamSteps: 2,
      sinkDischargePercentileMin: 0.94,
      maxLakeLandFraction: 0.07,
    },
  },

  // ============================================================================
  // Hydrology Climate Refine Stage
  // Local precipitation, cryosphere, and diagnostics refinement
  // ============================================================================
  "hydrology-climate-refine": {
    knobs: {
      dryness: "mix",
      temperature: "hot",
      cryosphere: "on",
    },
    precipitationRefinement: {
      riverCorridor: {
        adjacencyRadius: 2,
        lowlandAdjacencyBonus: 16,
        highlandAdjacencyBonus: 12,
        lowlandElevationMax: 280,
      },
      lowBasin: {
        radius: 3,
        delta: 8,
        elevationMax: 220,
        openThresholdM: 24,
      },
    },
    solarForcing: {
      equatorInsolation: 0.9,
      poleInsolation: 0.1,
      latitudeExponent: 1,
    },
    thermalState: {
      baseTemperatureC: 9,
      insolationScaleC: 50,
      lapseRateCPerM: -0.0095,
      landCoolingC: 0.32,
      minC: -60,
      maxC: 50,
    },
    albedoFeedback: {
      iterations: 3,
      snowCoolingC: 3,
      seaIceCoolingC: 5,
      minC: -60,
      maxC: 60,
      landSnowStartC: 0,
      landSnowFullC: -30,
      seaIceStartC: -0.1,
      seaIceFullC: -60,
      precipitationInfluence: 0.6,
    },
    cryosphereState: {
      landSnowStartC: 1,
      landSnowFullC: -12,
      seaIceStartC: 0,
      seaIceFullC: -10,
      freezeIndexStartC: 2,
      freezeIndexFullC: -12,
      precipitationInfluence: 0.8,
      permafrostStartFreezeIndex: 0.4,
      permafrostFullFreezeIndex: 0.8,
      meltStartC: 0,
      meltFullC: 10,
      groundIceSnowInfluence: 0.75,
      baseAlbedo: 30,
      snowAlbedoBoost: 180,
      seaIceAlbedoBoost: 180,
    },
    landWaterBudget: {
      tMinC: 0,
      tMaxC: 36,
      petBase: 19,
      petTemperatureWeight: 82,
      humidityDampening: 0.5,
    },
    diagnostics: {
      barrierSteps: 2,
      barrierElevationM: 1000,
      continentalityMaxDist: 14,
      convergenceNormalization: 78,
    },
  },

  // ============================================================================
  // Ecology Pedology Stage
  // Soil and resource-basin truth
  // ============================================================================
  "ecology-pedology": {
    knobs: {},
  },

  // ============================================================================
  // Ecology Biomes Stage
  // Biome classification
  // ============================================================================
  "ecology-biomes": {
    knobs: {},
    biomeClassification: {
      temperature: {
        equator: 34,
        pole: -22,
        lapseRate: 7.5,
      },
    },
  },

  // ============================================================================
  // Ecology Features Stage
  // Feature scoring and planning
  // ============================================================================
  "ecology-features": {
    knobs: {},
  },
};

/**
 * Get the list of stage names in pipeline order.
 */
export function getStageOrder(): string[] {
  return Object.keys(defaultConfig);
}

/**
 * Get the default config for a specific stage.
 */
export function getStageDefaults(stageName: string) {
  return defaultConfig[stageName];
}
