import type { StandardRecipeConfig } from "../../recipes/standard/recipe.js";

export const SHATTERED_RING_CONFIG: StandardRecipeConfig = {
  foundation: {
    version: 1,
    profiles: {
      resolutionProfile: "fine",
      lithosphereProfile: "maximal-basaltic-lid-v1",
      mantleProfile: "maximal-potential-v1",
    },
    knobs: {
      plateCount: 28,
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
          // Sharp continental edges from impact scarring
          clusteringBias: 0.15,
          crustEdgeBlend: 0.18,
          crustNoiseAmplitude: 0.18,
          continentalHeight: 0.5,
          oceanicHeight: -0.85,
          // Strong plate-driven coasts for ring structure
          boundaryBias: 0.6,
          tectonics: {
            // Strong coastal arcs for ring formation
            boundaryArcWeight: 0.7,
            boundaryArcNoiseWeight: 0.55,
            interiorNoiseWeight: 0.4,
            fractalGrain: 5,
          },
        },
      },
      seaLevel: {
        strategy: "default",
        config: {
          // Central crater sea with ring continent
          targetWaterPercent: 60,
          targetScalar: 1,
          variance: 0,
          boundaryShareTarget: 0.45,
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
              threshold: 0.4,
              power: 1.4,
              // Strong convergent coasts for ring mountains
              convergent: 2.2,
              transform: 0.3,
              divergent: -0.3,
              interior: 0.5,
              // Complex coastlines from fracturing
              bayWeight: 0.9,
              bayNoiseBonus: 0.6,
              fjordWeight: 0.7,
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
              rate: 0.15,
              m: 0.5,
              n: 1.0,
            },
            diffusion: {
              rate: 0.2,
              talus: 0.5,
            },
            deposition: {
              rate: 0.1,
            },
            eras: 2,
          },
          worldAge: "mature",
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
            fractalThresholdPercent: 92,
            minDistFromLandRadius: 2,
            baseIslandDenNearActive: 4,
            baseIslandDenElse: 5,
            hotspotSeedDenom: 2,
            clusterMax: 3,
            microcontinentChance: 0.1,
          },
        },
      },
    },
    volcanoes: {
      volcanoes: {
        strategy: "default",
        config: {
          enabled: true,
          // High volcanic activity in crater sea
          baseDensity: 1 / 120,
          minSpacing: 3,
          boundaryThreshold: 0.22,
          boundaryWeight: 1.5,
          convergentMultiplier: 3.0,
          transformMultiplier: 1.1,
          divergentMultiplier: 0.45,
          // Strong hotspot activity for crater islands
          hotspotWeight: 0.55,
          shieldPenalty: 0.35,
          randomJitter: 0.14,
          minVolcanoes: 10,
          maxVolcanoes: 45,
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
          // High intensity for ring mountain formation
          tectonicIntensity: 0.85,
          mountainThreshold: 0.5,
          hillThreshold: 0.3,
          upliftWeight: 0.45,
          fractalWeight: 0.3,
          riftDepth: 0.3,
          // Strong emphasis on plate boundaries for the ring
          boundaryWeight: 1.35,
          boundaryGate: 0.1,
          boundaryExponent: 2.0,
          interiorPenaltyWeight: 0.1,
          convergenceBonus: 0.95,
          transformPenalty: 0.5,
          riftPenalty: 0.7,
          hillBoundaryWeight: 0.45,
          hillRiftBonus: 0.35,
          hillConvergentFoothill: 0.5,
          hillInteriorFalloff: 0.2,
          hillUpliftWeight: 0.3,
        },
      },
      foothills: {
        strategy: "default",
        config: {
          // High intensity for ring mountain formation
          tectonicIntensity: 0.85,
          mountainThreshold: 0.5,
          hillThreshold: 0.3,
          upliftWeight: 0.45,
          fractalWeight: 0.3,
          riftDepth: 0.3,
          // Strong emphasis on plate boundaries for the ring
          boundaryWeight: 1.35,
          boundaryGate: 0.1,
          boundaryExponent: 2.0,
          interiorPenaltyWeight: 0.1,
          convergenceBonus: 0.95,
          transformPenalty: 0.5,
          riftPenalty: 0.7,
          hillBoundaryWeight: 0.45,
          hillRiftBonus: 0.35,
          hillConvergentFoothill: 0.5,
          hillInteriorFalloff: 0.2,
          hillUpliftWeight: 0.3,
        },
      },
    },
  },
  "hydrology-climate-baseline": {
    knobs: {
      dryness: "mix",
      temperature: "temperate",
      seasonality: "high",
      oceanCoupling: "earthlike",
    },
  },
  "hydrology-hydrography": {
    knobs: {
      riverDensity: "dense",
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
      lakeiness: "normal",
      riverDensity: "dense",
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
      }, // Volcanic terrain soils
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
            equator: 30,
            pole: -14,
            lapseRate: 7.3,
            seaLevel: 0,
            bias: 0.8,
            polarCutoff: -7,
            tundraCutoff: 0,
            midLatitude: 10,
            tropicalThreshold: 22,
          },
          moisture: {
            thresholds: [64, 96, 132, 176] as [number, number, number, number],
          },
          aridity: {
            temperatureMin: 0,
            temperatureMax: 36,
            petBase: 21,
            petTemperatureWeight: 86,
            humidityDampening: 0.42,
            rainfallWeight: 1.08,
            bias: 7,
            normalization: 104,
            moistureShiftThresholds: [0.4, 0.64] as [number, number],
            vegetationPenalty: 0.2,
          },
          vegetation: {
            base: 0.24,
            moistureWeight: 0.62,
            moistureNormalizationPadding: 50,
          },
          edgeRefine: { radius: 1, iterations: 2 },
        },
      },
    },
  },
  "ecology-ice": {
    knobs: {},
    "plan-ice": {
      planIce: { strategy: "default", config: {} },
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
          elevationMin: 250,
          elevationMax: 3000,
          elevationPercentileMin: 0.78,
          elevationPercentileMax: 0.98,
          moistureMin: 40,
          moistureMax: 150,
          maxTemperature: 4,
          maxAridity: 0.85,
          freezeWeight: 1.0,
          elevationWeight: 1.0,
          moistureWeight: 0.6,
          scoreNormalization: 2.7,
          scoreBias: 0,
        },
      },
      scoreSand: {
        strategy: "default",
        config: {
          minAridity: 0.62,
          minTemperature: 20,
          maxFreeze: 0.25,
          maxVegetation: 0.18,
          maxMoisture: 90,
          allowedBiomes: ["desert", "temperateDry"] as ["desert", "temperateDry"],
        },
      },
      scoreBurned: {
        strategy: "default",
        config: {
          minAridity: 0.46, // Capture more volcanic tiles
          minTemperature: 17,
          maxFreeze: 0.25,
          maxVegetation: 0.4, // Allow more in volcanic areas
          maxMoisture: 128,
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
            coveragePct: 55,
            lightThreshold: 0.4,
            mediumThreshold: 0.65,
            heavyThreshold: 0.82,
          },
          sand: {
            enabled: true,
            selector: {
              typeName: "PLOTEFFECT_SAND",
            },
            coveragePct: 14,
          },
          burned: {
            enabled: true,
            selector: {
              typeName: "PLOTEFFECT_BURNED",
            },
            coveragePct: 20,       // More volcanic scorched earth
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
      wonders: { strategy: "default", config: { wondersPlusOne: true } },
      floodplains: { strategy: "default", config: { minLength: 4, maxLength: 10 } },
      starts: { strategy: "default", config: { overrides: {} } },
    },
    placement: {},
  },
  };
