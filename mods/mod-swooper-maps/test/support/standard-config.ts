import type { StandardRecipeConfig } from "../../src/recipes/standard/recipe.js";

const reliefConfig = {
  crustEdgeBlend: 0.35,
  crustNoiseAmplitude: 0.1,
  continentalHeight: 0.4,
  oceanicHeight: -0.75,
  boundaryBias: 0.2,
  tectonics: {
    boundaryArcWeight: 0.37,
    boundaryArcNoiseWeight: 0.35,
    interiorNoiseWeight: 0.75,
    fractalGrain: 5,
  },
};

const hypsometryConfig = {
  targetWaterPercent: 68,
  targetScalar: 1,
  boundaryShareTarget: 0.2,
};

const coastConfig = {
  plateBias: {
    threshold: 0.45,
    power: 1.25,
    convergent: 1.4,
    transform: 0.4,
    divergent: -0.4,
    interior: 0.4,
    bayWeight: 0.8,
    bayNoiseBonus: 0.5,
    fjordWeight: 0.8,
  },
  bay: {},
  fjord: {},
};

const mountainsConfig = {
  // Physics-first: mountain placement should be primarily driven by belts/uplift history, not
  // fractal noise. Keep thresholds compatible with current driver magnitudes so invariants can
  // catch "no mountains" regressions.
  tectonicIntensity: 1.4,
  mountainThreshold: 0.55,
  hillThreshold: 0.32,
  upliftWeight: 0.45,
  fractalWeight: 0.2,
  riftDepth: 0.25,
  boundaryWeight: 1.0,
  boundaryGate: 0,
  boundaryExponent: 1.15,
  interiorPenaltyWeight: 0.15,
  convergenceBonus: 1.0,
  transformPenalty: 0.6,
  riftPenalty: 0.76,
  hillBoundaryWeight: 0.32,
  hillRiftBonus: 0.65,
  hillConvergentFoothill: 0.32,
  hillInteriorFalloff: 0.05,
  hillUpliftWeight: 0.22,
};

const volcanoesConfig = {
  baseDensity: 5 / 190,
  minSpacing: 3,
  boundaryThreshold: 0.35,
  boundaryWeight: 1.2,
  convergentMultiplier: 2.5,
  transformMultiplier: 1.0,
  divergentMultiplier: 0.4,
  hotspotWeight: 0.18,
  shieldPenalty: 0.6,
  randomJitter: 0.08,
  minVolcanoes: 5,
  maxVolcanoes: 30,
};

const foundationConfig = {
  knobs: { plateCount: 23, plateActivity: 0.5 },
};

const landmaskConfig = {
  continentPotentialGrain: 8,
  continentPotentialBlurSteps: 3,
  keepLandComponentFraction: 0.985,
};

const biomesConfig = {
  strategy: "default",
  config: {
    temperature: {
      equator: 30,
      pole: -8,
      lapseRate: 6.5,
      seaLevel: 0,
      bias: 2.5,
      polarCutoff: -5,
      tundraCutoff: 2,
      midLatitude: 12,
      tropicalThreshold: 24,
    },
    moisture: {
      thresholds: [130, 180, 230, 280] as [number, number, number, number],
    },
    aridity: {
      temperatureMin: 0,
      temperatureMax: 35,
      petBase: 18,
      petTemperatureWeight: 75,
      humidityDampening: 0.55,
      rainfallWeight: 1,
      bias: 0,
      normalization: 125,
      moistureShiftThresholds: [0.45, 0.7] as [number, number],
      vegetationPenalty: 0.12,
    },
    vegetation: {
      base: 0.35,
      moistureWeight: 0.65,
      moistureNormalizationPadding: 60,
    },
  },
};

const biomeBindingsConfig = {
  snow: "BIOME_TUNDRA",
  tundra: "BIOME_TUNDRA",
  boreal: "BIOME_TUNDRA",
  temperateDry: "BIOME_PLAINS",
  temperateHumid: "BIOME_GRASSLAND",
  tropicalSeasonal: "BIOME_GRASSLAND",
  tropicalRainforest: "BIOME_TROPICAL",
  desert: "BIOME_DESERT",
  marine: "BIOME_MARINE",
};

const featuresDensityConfig = {
  shelfReefMultiplier: 0.8,
  shelfReefRadius: 1,
  rainforestExtraChance: 50,
  forestExtraChance: 40,
  taigaExtraChance: 20,
  rainforestVegetationScale: 50,
  forestVegetationScale: 30,
  taigaVegetationScale: 20,
  rainforestMinRainfall: 130,
  forestMinRainfall: 100,
  taigaMaxElevation: 300,
  minVegetationForBonus: 0.01,
};

const featuresPlacementConfig = {
  vegetated: {
    strategy: "default",
    config: {
      multiplier: 1.5,
      chances: {
        FEATURE_FOREST: 50,
        FEATURE_RAINFOREST: 65,
        FEATURE_TAIGA: 50,
        FEATURE_SAVANNA_WOODLAND: 30,
        FEATURE_SAGEBRUSH_STEPPE: 30,
      },
      rules: {
        minVegetationByBiome: {
          snow: 0.08,
          tundra: 0.04,
          boreal: 0.06,
          temperateDry: 0.06,
          temperateHumid: 0.05,
          tropicalSeasonal: 0.05,
          tropicalRainforest: 0.04,
          desert: 0.02,
        },
        vegetationChanceScalar: 1,
        desertSagebrushMinVegetation: 0.15,
        desertSagebrushMaxAridity: 0.85,
        tundraTaigaMinVegetation: 0.08,
        tundraTaigaMinTemperature: -2,
        tundraTaigaMaxFreeze: 0.95,
        temperateDryForestMoisture: 120,
        temperateDryForestMaxAridity: 0.6,
        temperateDryForestVegetation: 0.45,
        tropicalSeasonalRainforestMoisture: 140,
        tropicalSeasonalRainforestMaxAridity: 0.55,
      },
    },
  },
  wet: {
    strategy: "default",
    config: {
      multiplier: 0.65,
      chances: {
        FEATURE_MARSH: 30,
        FEATURE_TUNDRA_BOG: 20,
        FEATURE_MANGROVE: 30,
        FEATURE_OASIS: 25,
        FEATURE_WATERING_HOLE: 30,
      },
      rules: {
        nearRiverRadius: 2,
        coldTemperatureMax: 2,
        coldBiomeSymbols: ["snow", "tundra", "boreal"],
        mangroveWarmTemperatureMin: 18,
        mangroveWarmBiomeSymbols: ["tropicalRainforest", "tropicalSeasonal"],
        coastalAdjacencyRadius: 1,
        isolatedRiverRadius: 1,
        isolatedSpacingRadius: 1,
        oasisBiomeSymbols: ["desert", "temperateDry"],
      },
    },
  },
  aquatic: {
    strategy: "default",
    config: {
      multiplier: 0.65,
      chances: {
        FEATURE_REEF: 30,
        FEATURE_COLD_REEF: 30,
        FEATURE_ATOLL: 10,
        FEATURE_LOTUS: 15,
      },
      rules: {
        reefLatitudeSplit: 55,
        atoll: {
          enableClustering: true,
          clusterRadius: 1,
          equatorialBandMaxAbsLatitude: 23,
          shallowWaterAdjacencyGateChance: 30,
          shallowWaterAdjacencyRadius: 1,
          growthChanceEquatorial: 15,
          growthChanceNonEquatorial: 5,
        },
      },
    },
  },
  ice: {
    strategy: "default",
    config: {
      multiplier: 1,
      chances: { FEATURE_ICE: 90 },
      rules: {
        minAbsLatitude: 78,
        forbidAdjacentToLand: true,
        landAdjacencyRadius: 1,
        forbidAdjacentToNaturalWonders: true,
        naturalWonderAdjacencyRadius: 1,
      },
    },
  },
};

const plotEffectsScoreSnowConfig = {
  strategy: "default",
  config: {
    elevationStrategy: "percentile" as const,
    elevationMin: 200,
    elevationMax: 2800,
    elevationPercentileMin: 0.7,
    elevationPercentileMax: 0.98,
    moistureMin: 50,
    moistureMax: 170,
    maxTemperature: 4,
    maxAridity: 0.85,
    freezeWeight: 1.1,
    elevationWeight: 0.9,
    moistureWeight: 0.7,
    scoreNormalization: 2.7,
    scoreBias: 0,
  },
};
const plotEffectsScoreSandConfig = {
  strategy: "default",
  config: {
    minAridity: 0.65,
    minTemperature: 20,
    maxFreeze: 0.25,
    maxVegetation: 0.15,
    maxMoisture: 80,
    allowedBiomes: ["desert", "temperateDry"] as ["desert", "temperateDry"],
  },
};
const plotEffectsScoreBurnedConfig = {
  strategy: "default",
  config: {
    minAridity: 0.5,
    minTemperature: 22,
    maxFreeze: 0.2,
    maxVegetation: 0.25,
    maxMoisture: 100,
    allowedBiomes: ["temperateDry", "tropicalSeasonal"] as [
      "temperateDry",
      "tropicalSeasonal",
    ],
  },
};
const plotEffectsPlanConfig = {
  strategy: "default",
  config: {
    snow: {
      enabled: true,
      selectors: {
        light: {
          typeName: "PLOTEFFECT_SNOW_LIGHT_PERMANENT",
        },
        medium: {
          typeName: "PLOTEFFECT_SNOW_MEDIUM_PERMANENT",
        },
        heavy: {
          typeName: "PLOTEFFECT_SNOW_HEAVY_PERMANENT",
        },
      },
      coveragePct: 70,
      lightThreshold: 0.35,
      mediumThreshold: 0.6,
      heavyThreshold: 0.8,
    },
    sand: {
      enabled: true,
      selector: {
        typeName: "PLOTEFFECT_SAND",
      },
      coveragePct: 6,
    },
    burned: {
      enabled: false,
      selector: {
        typeName: "PLOTEFFECT_BURNED",
      },
      coveragePct: 6,
    },
  },
};

const islandsConfig = {};
const islandsPlanConfig = {
  islands: islandsConfig,
};

const geomorphologyConfig = {
  fluvial: {},
  diffusion: {},
  deposition: {},
  eras: 2,
};
const placementConfig = {
  wonders: { strategy: "default", config: {} },
  floodplains: { strategy: "default", config: { minLength: 4, maxLength: 10 } },
  starts: { strategy: "default", config: {} },
};

export const standardConfig = {
  foundation: foundationConfig,
  "morphology-coasts": {
    advanced: {
      "landmass-plates": {
        substrate: { strategy: "default", config: {} },
        baseTopography: { strategy: "default", config: reliefConfig },
        seaLevel: { strategy: "default", config: hypsometryConfig },
        landmask: {
          strategy: "default",
          config: landmaskConfig,
        },
      },
      "rugged-coasts": {
        coastlines: {
          strategy: "default",
          config: {
            coast: coastConfig,
          },
        },
      },
    },
  },
  "morphology-routing": {
    advanced: {
      routing: {
        routing: { strategy: "default", config: {} },
      },
    },
  },
  "morphology-erosion": {
    advanced: {
      geomorphology: {
        geomorphology: {
          strategy: "default",
          config: {
            geomorphology: geomorphologyConfig,
            worldAge: "mature",
          },
        },
      },
    },
  },
  "morphology-features": {
    advanced: {
      islands: {
        islands: { strategy: "default", config: islandsPlanConfig },
      },
      volcanoes: { volcanoes: { strategy: "default", config: volcanoesConfig } },
      landmasses: { landmasses: { strategy: "default", config: {} } },
    },
  },
  "map-morphology": {
    mountains: {
      ridges: { strategy: "default", config: mountainsConfig },
      foothills: { strategy: "default", config: mountainsConfig },
    },
  },
  "hydrology-climate-baseline": {
    knobs: {
      dryness: "mix",
      temperature: "temperate",
      seasonality: "normal",
      oceanCoupling: "earthlike",
    },
  },
  "hydrology-hydrography": {
    knobs: {
      riverDensity: "normal",
    },
  },
  "hydrology-climate-refine": {
    knobs: {
      dryness: "mix",
      temperature: "temperate",
      cryosphere: "on",
    },
  },
  "map-hydrology": {
    knobs: {
      riverDensity: "normal",
      lakeiness: "normal",
    },
  },
  ecology: {
    biomes: { classify: biomesConfig },
  },
  "map-ecology": {
    biomes: { bindings: biomeBindingsConfig },
    plotEffects: {
      scoreSnow: plotEffectsScoreSnowConfig,
      scoreSand: plotEffectsScoreSandConfig,
      scoreBurned: plotEffectsScoreBurnedConfig,
      plotEffects: plotEffectsPlanConfig,
    },
  },
  placement: {
    "derive-placement-inputs": placementConfig,
    placement: {},
  },
} satisfies StandardRecipeConfig;
