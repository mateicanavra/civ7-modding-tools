import type { StandardRecipeConfig } from "../../recipes/standard/recipe.js";

export const SUNDERED_ARCHIPELAGO_CONFIG: StandardRecipeConfig = {
  foundation: {
    version: 1,
    profiles: {
      resolutionProfile: "ultra",
    },
    knobs: {
      plateCount: 32,
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
          // Sharp edges to fragment land into islands
          clusteringBias: 0.05,
          crustEdgeBlend: 0.12,
          crustNoiseAmplitude: 0.3,
          // Lower continental height to keep land fragmented and low-lying
          continentalHeight: 0.38,
          oceanicHeight: -0.62,
          // Maximum boundary influence - all land at plate edges
          boundaryBias: 0.8,
          tectonics: {
            // Maximum boundary arc weight - islands form along plate edges only
            boundaryArcWeight: 0.9,
            boundaryArcNoiseWeight: 0.8,
            // Minimal interior weight - no continental cores
            interiorNoiseWeight: 0.1,
            fractalGrain: 9,
          },
        },
      },
      seaLevel: {
        strategy: "default",
        config: {
          // Very high water with fragmented island chains
          targetWaterPercent: 80,
          targetScalar: 1,
          variance: 0,
          boundaryShareTarget: 0.75,
          continentalFraction: 0.28,
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
              threshold: 0.35,
              power: 1.5,
              // Strong convergent coasts for island arcs
              convergent: 2.0,
              transform: 0.5,
              divergent: -0.2,
              interior: 0.3,
              // Very complex coastlines for island detail
              bayWeight: 1.2,
              bayNoiseBonus: 0.8,
              fjordWeight: 0.9,
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
            fractalThresholdPercent: 82,
            minDistFromLandRadius: 1,
            baseIslandDenNearActive: 7,
            baseIslandDenElse: 12,
            hotspotSeedDenom: 1,
            clusterMax: 6,
            microcontinentChance: 0.2,
          },
        },
      },
    },
    volcanoes: {
      volcanoes: {
        strategy: "default",
        config: {
          enabled: true,
          // High volcanic density for island chains
          baseDensity: 1 / 80,
          minSpacing: 2,
          boundaryThreshold: 0.18,
          boundaryWeight: 1.7,
          convergentMultiplier: 3.4,
          transformMultiplier: 1.4,
          divergentMultiplier: 0.7,
          // Maximum hotspot activity for volcanic chains
          hotspotWeight: 0.7,
          shieldPenalty: 0.2,
          randomJitter: 0.18,
          minVolcanoes: 16,
          maxVolcanoes: 70,
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
          // Focused volcanic peaks rather than ranges
          tectonicIntensity: 0.65,
          mountainThreshold: 0.6,
          hillThreshold: 0.32,
          upliftWeight: 0.25,
          fractalWeight: 0.3,
          riftDepth: 0.35,
          // Strong boundary influence for arc volcanism
          boundaryWeight: 1.1,
          boundaryGate: 0.1,
          boundaryExponent: 1.6,
          interiorPenaltyWeight: 0.2,
          convergenceBonus: 1.0,
          transformPenalty: 0.5,
          riftPenalty: 0.7,
          hillBoundaryWeight: 0.55,
          hillRiftBonus: 0.4,
          hillConvergentFoothill: 0.45,
          hillInteriorFalloff: 0.25,
          hillUpliftWeight: 0.28,
        },
      },
      foothills: {
        strategy: "default",
        config: {
          // Focused volcanic peaks rather than ranges
          tectonicIntensity: 0.65,
          mountainThreshold: 0.6,
          hillThreshold: 0.32,
          upliftWeight: 0.25,
          fractalWeight: 0.3,
          riftDepth: 0.35,
          // Strong boundary influence for arc volcanism
          boundaryWeight: 1.1,
          boundaryGate: 0.1,
          boundaryExponent: 1.6,
          interiorPenaltyWeight: 0.2,
          convergenceBonus: 1.0,
          transformPenalty: 0.5,
          riftPenalty: 0.7,
          hillBoundaryWeight: 0.55,
          hillRiftBonus: 0.4,
          hillConvergentFoothill: 0.45,
          hillInteriorFalloff: 0.25,
          hillUpliftWeight: 0.28,
        },
      },
    },
  },
  "hydrology-climate-baseline": {
    knobs: {
      dryness: "wet",
      temperature: "hot",
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
      dryness: "wet",
      temperature: "hot",
      cryosphere: "off",
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
        strategy: "coastal-shelf",
        config: {
          climateWeight: 1.2,
          reliefWeight: 0.8,
          sedimentWeight: 1.1,
          bedrockWeight: 0.6,
          fertilityCeiling: 0.95,
        },
      }, // Island-focused coastal soils
    },
    "resource-basins": {
      plan: { strategy: "hydro-fluvial", config: { resources: [] } }, // Water-focused resources
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
            equator: 31,
            pole: -6,
            lapseRate: 6.7,
            seaLevel: 0,
            bias: 1.8,
            polarCutoff: -5,
            tundraCutoff: 2,
            midLatitude: 13,
            tropicalThreshold: 24,
          },
          moisture: {
            thresholds: [88, 120, 162, 210] as [number, number, number, number],
          },
          aridity: {
            temperatureMin: 2,
            temperatureMax: 37,
            petBase: 22,
            petTemperatureWeight: 95,
            humidityDampening: 0.52,
            rainfallWeight: 1.08,
            bias: 2,
            normalization: 132,
            moistureShiftThresholds: [0.43, 0.66] as [number, number],
            vegetationPenalty: 0.14,
          },
          vegetation: {
            base: 0.34,
            moistureWeight: 0.66,
            moistureNormalizationPadding: 64,
          },
          edgeRefine: { radius: 1, iterations: 2 }, // Smooth tropical biome blending
        },
      },
    },
  },
  "ecology-ice": {
    knobs: {},
    "plan-ice": {
      planIce: { strategy: "default", config: {} }, // Minimal polar ice
    },
  },
  "ecology-reefs": {
    knobs: {},
    "plan-reefs": {
      planReefs: { strategy: "shipping-lanes", config: {} }, // Island chain reef patterns
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
          elevationMin: 300, // Only high elevations
          elevationMax: 2600,
          elevationPercentileMin: 0.82, // Only very high peaks
          elevationPercentileMax: 0.98,
          moistureMin: 70,
          moistureMax: 180,
          maxTemperature: 3, // Stricter temperature
          maxAridity: 0.75,
          freezeWeight: 0.9,
          elevationWeight: 0.8,
          moistureWeight: 0.7,
          scoreNormalization: 2.6,
          scoreBias: -0.1, // Bias against snow
        },
      },
      scoreSand: {
        strategy: "default",
        config: {
          minAridity: 0.7,
          minTemperature: 24,
          maxFreeze: 0.2,
          maxVegetation: 0.1,
          maxMoisture: 70,
          allowedBiomes: ["desert", "temperateDry"] as ["desert", "temperateDry"],
        },
      },
      scoreBurned: {
        strategy: "default",
        config: {
          minAridity: 0.65,
          minTemperature: 26,
          maxFreeze: 0.15,
          maxVegetation: 0.15,
          maxMoisture: 90,
          allowedBiomes: ["temperateDry", "tropicalSeasonal"] as [
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
            coveragePct: 28,              // Reduced for tropical world
            lightThreshold: 0.45,         // Higher threshold
            mediumThreshold: 0.7,
            heavyThreshold: 0.85,
          },
          sand: {
            enabled: false,               // Tropical islands don't have desert sand
            selector: {
              typeName: "PLOTEFFECT_SAND",
            },
            coveragePct: 5,
          },
          burned: {
            enabled: false,               // Lush tropical - no scorched earth
            selector: {
              typeName: "PLOTEFFECT_BURNED",
            },
            coveragePct: 4,
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
