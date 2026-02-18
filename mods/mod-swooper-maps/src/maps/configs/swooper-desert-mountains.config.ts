import type { StandardRecipeConfig } from "../../recipes/standard/recipe.js";

export const SWOOPER_DESERT_MOUNTAINS_CONFIG: StandardRecipeConfig = {
  foundation: {
    knobs: {
      plateCount: 9,
      plateActivity: 0.5,
    },
  },
  "morphology-coasts": {
    "advanced": {
    "landmass-plates": {
      substrate: {
        strategy: "default",
        config: {
          continentalBaseErodibility: 0.65,
          oceanicBaseErodibility: 0.55,
          continentalBaseSediment: 0.15,
          oceanicBaseSediment: 0.25,
          upliftErodibilityBoost: 0.3,
          riftSedimentBoost: 0.2,
        },
      },
      baseTopography: {
        strategy: "default",
        config: {
          boundaryBias: 0.18,
          clusteringBias: 0.35,
          crustEdgeBlend: 0.35,
          crustNoiseAmplitude: 0.14,
          continentalHeight: 0.52,
          oceanicHeight: -0.6,
          tectonics: {
            interiorNoiseWeight: 0.45,
            boundaryArcWeight: 0.5,
            boundaryArcNoiseWeight: 0.35,
            fractalGrain: 5,
          },
        },
      },
      seaLevel: {
        strategy: "default",
        config: {
          targetWaterPercent: 48,
          targetScalar: 1,
          variance: 0,
          boundaryShareTarget: 0.22,
          continentalFraction: 0.3,
        },
      },
      landmask: {
        strategy: "default",
        config: {
          continentPotentialGrain: 8,
          continentPotentialBlurSteps: 3,
          keepLandComponentFraction: 0.985,
        },
      },
    },
    "rugged-coasts": {
      coastlines: {
        strategy: "default",
        config: {
          coast: {
            plateBias: {
              threshold: 0.15,
              power: 1.3,
              convergent: 3.0,
              transform: 0.2,
              divergent: 0.5,
              interior: 0.35,
              bayWeight: 0.75,
              bayNoiseBonus: 0.1,
              fjordWeight: 0.8,
            },
            bay: {
              noiseGateAdd: 0,
              rollDenActive: 4,
              rollDenDefault: 5,
            },
            fjord: {
              baseDenom: 12,
              activeBonus: 1,
              passiveBonus: 2,
            },
          },
        },
      },
    },
    }
  },
  "morphology-routing": {
    "advanced": {
    routing: {
      routing: {
        strategy: "default",
        config: {},
      },
    },
    }
  },
  "morphology-erosion": {
    "advanced": {
    geomorphology: {
      geomorphology: {
        strategy: "default",
        config: {
          geomorphology: {
            fluvial: {
              rate: 0.08,
              m: 0.5,
              n: 1.0,
            },
            diffusion: {
              rate: 0.12,
              talus: 0.45,
            },
            deposition: {
              rate: 0.07,
            },
            eras: 3,
          },
          worldAge: "old",
        },
      },
    },
    }
  },
  "morphology-features": {
    "advanced": {
    islands: {
      islands: {
        strategy: "default",
        config: {
          islands: {
            fractalThresholdPercent: 96,
            minDistFromLandRadius: 4,
            baseIslandDenNearActive: 2,
            baseIslandDenElse: 2,
            hotspotSeedDenom: 6,
            clusterMax: 1,
            microcontinentChance: 0,
          },
        },
      },
    },
    volcanoes: {
      volcanoes: {
        strategy: "default",
        config: {
          enabled: true,
          baseDensity: 0.006,
          minSpacing: 5,
          boundaryThreshold: 0.32,
          boundaryWeight: 1.4,
          convergentMultiplier: 2.2,
          transformMultiplier: 0.7,
          divergentMultiplier: 0.2,
          hotspotWeight: 0.15,
          shieldPenalty: 0.3,
          randomJitter: 0.08,
          minVolcanoes: 6,
          maxVolcanoes: 18,
        },
      },
    },
    landmasses: {
      landmasses: {
        strategy: "default",
        config: {},
      },
    },
    }
  },
  "map-morphology": {
    mountains: {
      ridges: {
        strategy: "default",
        config: {
          // Desert mountains: frequent peaks, strong rift relief, reduced erosion
          tectonicIntensity: 0.63,
          mountainThreshold: 0.64,
          hillThreshold: 0.36,
          upliftWeight: 0.20,
          fractalWeight: 0.90,
          riftDepth: 0.45,
          boundaryWeight: 0.38,
          boundaryGate: 0.14,
          boundaryExponent: 1.1,
          interiorPenaltyWeight: 0.16,
          convergenceBonus: 0.6,
          transformPenalty: 0.55,
          riftPenalty: 0.65,
          hillBoundaryWeight: 0.22,
          hillRiftBonus: 0.5,
          hillConvergentFoothill: 0.36,
          hillInteriorFalloff: 0.2,
          hillUpliftWeight: 0.2,
        },
      },
      foothills: {
        strategy: "default",
        config: {
          // Desert mountains: frequent peaks, strong rift relief, reduced erosion
          tectonicIntensity: 0.63,
          mountainThreshold: 0.64,
          hillThreshold: 0.36,
          upliftWeight: 0.20,
          fractalWeight: 0.90,
          riftDepth: 0.45,
          boundaryWeight: 0.38,
          boundaryGate: 0.14,
          boundaryExponent: 1.1,
          interiorPenaltyWeight: 0.16,
          convergenceBonus: 0.6,
          transformPenalty: 0.55,
          riftPenalty: 0.65,
          hillBoundaryWeight: 0.22,
          hillRiftBonus: 0.5,
          hillConvergentFoothill: 0.36,
          hillInteriorFalloff: 0.2,
          hillUpliftWeight: 0.2,
        },
      },
    },
  },
  "hydrology-climate-baseline": {
    knobs: {
      dryness: "dry",
      temperature: "hot",
      seasonality: "low",
      oceanCoupling: "simple",
    },
  },
  "hydrology-hydrography": {
    knobs: {
      riverDensity: "sparse",
    },
  },
  "hydrology-climate-refine": {
    knobs: {
      dryness: "dry",
      temperature: "hot",
      cryosphere: "off",
    },
  },
  "map-hydrology": {
    knobs: {
      lakeiness: "few",
      riverDensity: "sparse",
    },
  },
  "ecology-pedology": {
    knobs: {},
    pedology: {
      classify: {
        strategy: "orogeny-boosted",
        config: {
          climateWeight: 1.2,
          reliefWeight: 0.8,
          sedimentWeight: 1.1,
          bedrockWeight: 0.6,
          fertilityCeiling: 0.95,
        },
      }, // Dramatic mountain soils
    },
    "resource-basins": {
      plan: { strategy: "default", config: { resources: [] } },
      score: { strategy: "default", config: { minConfidence: 0.3, maxPerResource: 12 } },
    },
  },
  "ecology-biomes": {
    knobs: {},
    biomes: {
      classify: {
        strategy: "default",
        config: {
          temperature: {
            equator: 35,
            pole: 8,
            lapseRate: 7.8,
            seaLevel: 0,
            bias: 2.2,
            polarCutoff: -8,
            tundraCutoff: -2,
            midLatitude: 11,
            tropicalThreshold: 25,
          },
          moisture: {
            thresholds: [48, 78, 112, 160] as [number, number, number, number],
          },
          aridity: {
            temperatureMin: 2,
            temperatureMax: 42,
            petBase: 30,
            petTemperatureWeight: 122,
            humidityDampening: 0.28,
            rainfallWeight: 0.95,
            bias: 24,
            normalization: 76,
            moistureShiftThresholds: [0.38, 0.62] as [number, number],
            vegetationPenalty: 0.31,
          },
          vegetation: {
            base: 0.09,
            moistureWeight: 0.46,
            moistureNormalizationPadding: 40,
          },
          edgeRefine: { radius: 1, iterations: 2 }, // Sharp desert/mountain transitions
        },
      },
    },
  },
  "ecology-ice": {
    knobs: {},
    "plan-ice": {
      planIce: { strategy: "continentality", config: {} },
    },
  },
  "ecology-reefs": {
    knobs: {},
    "plan-reefs": {
      planReefs: { strategy: "default", config: {} },
    },
  },
  "ecology-wetlands": {
    knobs: {},
    "plan-wetlands": {
      planWetlands: { strategy: "default", config: {} },
    },
  },
  "ecology-vegetation": {
    knobs: {},
    "plan-vegetation": {
      planVegetation: { strategy: "default", config: {} },
    },
  },
  "map-ecology": {
    "plot-biomes": {
      bindings: {
        snow: "BIOME_TUNDRA",
        tundra: "BIOME_TUNDRA",
        boreal: "BIOME_TUNDRA",
        temperateDry: "BIOME_PLAINS",
        temperateHumid: "BIOME_GRASSLAND",
        tropicalSeasonal: "BIOME_GRASSLAND",
        tropicalRainforest: "BIOME_TROPICAL",
        desert: "BIOME_DESERT",
        marine: "BIOME_MARINE",
      },
    },
    "plot-effects": {
      scoreSnow: {
        strategy: "default",
        config: {
          elevationStrategy: "percentile" as const,
          elevationMin: 400,
          elevationMax: 3200,
          elevationPercentileMin: 0.85,
          elevationPercentileMax: 0.99,
          moistureMin: 20,
          moistureMax: 120,
          maxTemperature: 2,
          maxAridity: 0.8,
          freezeWeight: 1,
          elevationWeight: 1.2,
          moistureWeight: 0.4,
          scoreNormalization: 2.6,
          scoreBias: 0,
        },
      },
      scoreSand: {
        strategy: "default",
        config: {
          minAridity: 0.58, // Capture more arid tiles
          minTemperature: 19, // Include cooler desert edges
          maxFreeze: 0.2,
          maxVegetation: 0.15,
          maxMoisture: 70,
          allowedBiomes: ["desert", "temperateDry"] as ["desert", "temperateDry"],
        },
      },
      scoreBurned: {
        strategy: "default",
        config: {
          minAridity: 0.62, // Capture more tiles
          minTemperature: 24,
          maxFreeze: 0.15,
          maxVegetation: 0.22,
          maxMoisture: 90,
          allowedBiomes: ["desert", "temperateDry", "tropicalSeasonal"] as [
            "desert",
            "temperateDry",
            "tropicalSeasonal",
          ],
        },
      },
      plotEffects: {
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
            coveragePct: 35,
            lightThreshold: 0.5,
            mediumThreshold: 0.7,
            heavyThreshold: 0.85,
          },
          sand: {
            enabled: true,
            selector: {
              typeName: "PLOTEFFECT_SAND",
            },
            coveragePct: 42,       // Aggressive for desert world
          },
          burned: {
            enabled: true,
            selector: {
              typeName: "PLOTEFFECT_BURNED",
            },
            coveragePct: 16,       // More scorched earth
          },
        },
      },
    },
    "features-apply": {
      apply: { strategy: "default", config: { maxPerTile: 1 } },
    },
  },
  placement: {
    "derive-placement-inputs": {
      wonders: { strategy: "default", config: {} },
      floodplains: { strategy: "default", config: { minLength: 4, maxLength: 10 } },
      starts: { strategy: "default", config: { overrides: {} } },
    },
    placement: {},
  },
  };
