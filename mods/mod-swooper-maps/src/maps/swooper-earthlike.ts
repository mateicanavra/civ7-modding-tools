/**
 * Swooper Earthlike — Realistic, plate-driven Earth analogue (TypeScript)
 *
 * Goals:
 * - Ocean-dominant world (~70% water)
 * - Few large continents with a mix of active (Pacific-like) and passive (Atlantic-like) margins
 * - Earth-like latitude rainfall bands, with subtropical deserts and wet tropics
 * - Moderate coastal moisture spread and low-frequency rainfall noise
 */

/// <reference types="@civ7/types" />

import { createMap } from "@swooper/mapgen-core/authoring/maps";
import standardRecipe, { type StandardRecipeConfig } from "../recipes/standard/recipe.js";

export default createMap({
  id: "swooper-earthlike",
  name: "Swooper Earthlike",
  recipe: standardRecipe,
  config: (
    {
      "foundation": {
        "knobs": {
          "plateCount": "normal",
          "plateActivity": "normal"
        },
        "advanced": {
          "mesh": {
            "computeMesh": {
              "strategy": "default",
              "config": {
                "plateCount": 28,
                "cellsPerPlate": 23,
                "referenceArea": 6996,
                "plateScalePower": 0.5,
                "relaxationSteps": 2
              }
            }
          },
          "crust": {
            "computeCrust": {
              "strategy": "default",
              "config": {
                "continentalRatio": 0.3,
                "shelfWidthCells": 6,
                "shelfElevationBoost": 0.12,
                "marginElevationPenalty": 0.04,
                "continentalBaseElevation": 0.78,
                "continentalAgeBoost": 0.12,
                "oceanicBaseElevation": 0.32,
                "oceanicAgeDepth": 0.22
              }
            }
          },
          "plate-graph": {
            "computePlateGraph": {
              "strategy": "default",
              "config": {
                "plateCount": 28,
                "referenceArea": 6996,
                "plateScalePower": 0.5,
                "polarCaps": {
                  "capFraction": 0.1,
                  "microplateBandFraction": 0.2,
                  "microplatesPerPole": 0,
                  "microplatesMinPlateCount": 14,
                  "microplateMinAreaCells": 8,
                  "tangentialSpeed": 0.9,
                  "tangentialJitterDeg": 12
                }
              }
            }
          },
          "tectonics": {
            "computeTectonicSegments": {
              "strategy": "default",
              "config": {
                "intensityScale": 180,
                "regimeMinIntensity": 4
              }
            },
            "computeTectonicHistory": {
              "strategy": "default",
              "config": {
                "eraWeights": [
                  0.35,
                  0.35,
                  0.3
                ],
                "driftStepsByEra": [
                  2,
                  1,
                  0
                ],
                "beltInfluenceDistance": 8,
                "beltDecay": 0.55,
                "activityThreshold": 1
              }
            }
          },
          "projection": {
            "computePlates": {
              "strategy": "default",
              "config": {
                "boundaryInfluenceDistance": 5,
                "boundaryDecay": 0.55,
                "movementScale": 100,
                "rotationScale": 100
              }
            }
          }
        }
      },
      "morphology-pre": {
        "knobs": {
          "seaLevel": "earthlike"
        },
        "advanced": {
          "landmass-plates": {
            "substrate": {
              "strategy": "default",
              "config": {
                "continentalBaseErodibility": 0.37,
                "oceanicBaseErodibility": 0.35,
                "continentalBaseSediment": 0.15,
                "oceanicBaseSediment": 0.25,
                "ageErodibilityReduction": 0.25,
                "ageSedimentBoost": 0.15,
                "upliftErodibilityBoost": 0.3,
                "riftSedimentBoost": 0.2,
                "convergentBoundaryErodibilityBoost": 0.12,
                "divergentBoundaryErodibilityBoost": 0.18,
                "transformBoundaryErodibilityBoost": 0.08,
                "convergentBoundarySedimentBoost": 0.05,
                "divergentBoundarySedimentBoost": 0.1,
                "transformBoundarySedimentBoost": 0.03
              }
            },
            "baseTopography": {
              "strategy": "default",
              "config": {
                "boundaryBias": 0,
                "clusteringBias": 0,
                "crustEdgeBlend": 0.45,
                "crustNoiseAmplitude": 0.1,
                "continentalHeight": 0.32,
                "oceanicHeight": -0.55,
                "tectonics": {
                  "interiorNoiseWeight": 0.5,
                  "boundaryArcWeight": 0.35,
                  "boundaryArcNoiseWeight": 0.2,
                  "fractalGrain": 4
                }
              }
            },
            "seaLevel": {
              "strategy": "default",
              "config": {
                "targetWaterPercent": 60,
                "targetScalar": 1,
                "variance": 0,
                "boundaryShareTarget": 0.15
              }
            },
            "landmask": {
              "strategy": "default",
              "config": {
                "basinSeparation": {
                  "enabled": false,
                  "bandPairs": [],
                  "baseSeparationTiles": 0,
                  "boundaryClosenessMultiplier": 1,
                  "maxPerRowDelta": 3,
                  "minChannelWidth": 3,
                  "channelJitter": 0,
                  "respectSeaLanes": true,
                  "edgeWest": {
                    "enabled": false,
                    "baseTiles": 0,
                    "boundaryClosenessMultiplier": 1,
                    "maxPerRowDelta": 3
                  },
                  "edgeEast": {
                    "enabled": false,
                    "baseTiles": 0,
                    "boundaryClosenessMultiplier": 1,
                    "maxPerRowDelta": 3
                  }
                }
              }
            }
          }
        }
      },
      "morphology-mid": {
        "knobs": {
          "erosion": "low",
          "coastRuggedness": "rugged"
        },
        "advanced": {
          "rugged-coasts": {
            "coastlines": {
              "strategy": "default",
              "config": {
                "coast": {
                  "bay": {
                    "noiseGateAdd": 0,
                    "rollDenActive": 4,
                    "rollDenDefault": 5
                  },
                  "fjord": {
                    "baseDenom": 12,
                    "activeBonus": 1,
                    "passiveBonus": 2
                  },
                  "plateBias": {
                    "threshold": 0.45,
                    "power": 1.25,
                    "convergent": 1,
                    "transform": 0.4,
                    "divergent": -0.6,
                    "interior": 0,
                    "bayWeight": 0.35,
                    "bayNoiseBonus": 1,
                    "fjordWeight": 0.8
                  }
                }
              }
            }
          },
          "routing": {
            "routing": {
              "strategy": "default",
              "config": {}
            }
          },
          "geomorphology": {
            "geomorphology": {
              "strategy": "default",
              "config": {
                "geomorphology": {
                  "fluvial": {
                    "rate": 0.15,
                    "m": 0.5,
                    "n": 1
                  },
                  "diffusion": {
                    "rate": 0.2,
                    "talus": 0.5
                  },
                  "deposition": {
                    "rate": 0.1
                  },
                  "eras": 2
                },
                "worldAge": "mature"
              }
            }
          }
        }
      },
      "morphology-post": {
        "knobs": {
          "volcanism": "normal"
        },
        "advanced": {
          "islands": {
            "islands": {
              "strategy": "default",
              "config": {
                "islands": {
                  "fractalThresholdPercent": 90,
                  "minDistFromLandRadius": 2,
                  "baseIslandDenNearActive": 5,
                  "baseIslandDenElse": 7,
                  "hotspotSeedDenom": 2,
                  "clusterMax": 3,
                  "microcontinentChance": 0
                }
              }
            }
          },
          "volcanoes": {
            "volcanoes": {
              "strategy": "default",
              "config": {
                "enabled": true,
                "baseDensity": 0.0058823529411764705,
                "minSpacing": 3,
                "boundaryThreshold": 0.35,
                "boundaryWeight": 1.2,
                "convergentMultiplier": 2.4,
                "transformMultiplier": 1.1,
                "divergentMultiplier": 0.35,
                "hotspotWeight": 0.12,
                "shieldPenalty": 0.6,
                "randomJitter": 0.08,
                "minVolcanoes": 5,
                "maxVolcanoes": 40
              }
            }
          },
          "landmasses": {
            "landmasses": {
              "strategy": "default",
              "config": {}
            }
          }
        }
      },
      "hydrology-climate-baseline": {
        "knobs": {
          "dryness": "mix",
          "temperature": "temperate",
          "seasonality": "normal",
          "oceanCoupling": "earthlike"
        }
      },
      "hydrology-hydrography": {
        "knobs": {
          "riverDensity": "normal"
        }
      },
      "hydrology-climate-refine": {
        "knobs": {
          "dryness": "mix",
          "temperature": "temperate",
          "cryosphere": "on"
        }
      },
      "ecology": {
        "pedology": {
          "classify": {
            "strategy": "default",
            "config": {
              "climateWeight": 1.2,
              "reliefWeight": 0.8,
              "sedimentWeight": 1.1,
              "bedrockWeight": 0.6,
              "fertilityCeiling": 0.95
            }
          }
        },
        "resourceBasins": {
          "plan": {
            "strategy": "default",
            "config": {
              "resources": []
            }
          },
          "score": {
            "strategy": "default",
            "config": {
              "minConfidence": 0.3,
              "maxPerResource": 12
            }
          }
        },
        "biomes": {
          "classify": {
            "strategy": "default",
            "config": {
              "temperature": {
                "equator": 28,
                "pole": -8,
                "lapseRate": 6.5,
                "seaLevel": 0,
                "bias": 0,
                "polarCutoff": -5,
                "tundraCutoff": 2,
                "midLatitude": 12,
                "tropicalThreshold": 24
              },
              "moisture": {
                "thresholds": [
                  45,
                  90,
                  140,
                  190
                ],
                "bias": 0,
                "humidityWeight": 0.35
              },
              "aridity": {
                "temperatureMin": 0,
                "temperatureMax": 35,
                "petBase": 20,
                "petTemperatureWeight": 80,
                "humidityDampening": 0.5,
                "rainfallWeight": 1,
                "bias": 0,
                "normalization": 120,
                "moistureShiftThresholds": [
                  0.45,
                  0.7
                ],
                "vegetationPenalty": 0.15
              },
              "freeze": {
                "minTemperature": -10,
                "maxTemperature": 2
              },
              "vegetation": {
                "base": 0.2,
                "moistureWeight": 0.55,
                "humidityWeight": 0.25,
                "moistureNormalizationPadding": 40,
                "biomeModifiers": {
                  "snow": {
                    "multiplier": 1,
                    "bonus": 0
                  },
                  "tundra": {
                    "multiplier": 1,
                    "bonus": 0
                  },
                  "boreal": {
                    "multiplier": 1,
                    "bonus": 0
                  },
                  "temperateDry": {
                    "multiplier": 1,
                    "bonus": 0
                  },
                  "temperateHumid": {
                    "multiplier": 1,
                    "bonus": 0
                  },
                  "tropicalSeasonal": {
                    "multiplier": 1,
                    "bonus": 0
                  },
                  "tropicalRainforest": {
                    "multiplier": 1,
                    "bonus": 0
                  },
                  "desert": {
                    "multiplier": 1,
                    "bonus": 0
                  }
                }
              },
              "noise": {
                "amplitude": 0.03,
                "seed": 1337
              },
              "riparian": {
                "adjacencyRadius": 1,
                "minorRiverMoistureBonus": 4,
                "majorRiverMoistureBonus": 8
              }
            }
          }
        },
        "biomeEdgeRefine": {
          "refine": {
            "strategy": "default",
            "config": {
              "radius": 1,
              "iterations": 1
            }
          }
        },
        "featuresPlan": {
          "vegetation": {
            "strategy": "default",
            "config": {
              "baseDensity": 0.35,
              "fertilityWeight": 0.4,
              "moistureWeight": 0.6,
              "moistureNormalization": 230,
              "coldCutoff": -10
            }
          },
          "wetlands": {
            "strategy": "default",
            "config": {
              "moistureThreshold": 0.75,
              "fertilityThreshold": 0.35,
              "moistureNormalization": 230,
              "maxElevation": 1200
            }
          },
          "reefs": {
            "strategy": "default",
            "config": {
              "warmThreshold": 12,
              "density": 0.35
            }
          },
          "ice": {
            "strategy": "default",
            "config": {
              "seaIceThreshold": -8,
              "alpineThreshold": 2800,
              "featherC": 4,
              "jitterC": 1.5,
              "densityScale": 1
            }
          }
        }
      },
      "map-morphology": {
        "knobs": {
          "orogeny": "normal"
        },
        "mountains": {
          "mountains": {
            "strategy": "default",
            "config": {
              "tectonicIntensity": 1,
              "mountainThreshold": 0.58,
              "hillThreshold": 0.32,
              "upliftWeight": 0.35,
              "fractalWeight": 0.15,
              "riftDepth": 0.2,
              "boundaryWeight": 1,
              "boundaryGate": 0.1,
              "boundaryExponent": 1.6,
              "interiorPenaltyWeight": 0,
              "convergenceBonus": 1,
              "transformPenalty": 0.6,
              "riftPenalty": 1,
              "hillBoundaryWeight": 0.35,
              "hillRiftBonus": 0.25,
              "hillConvergentFoothill": 0.35,
              "hillInteriorFalloff": 0.1,
              "hillUpliftWeight": 0.2
            }
          }
        }
      },
      "map-hydrology": {
        "knobs": {
          "lakeiness": "normal",
          "riverDensity": "normal"
        }
      },
      "map-ecology": {
        "biomes": {
          "bindings": {
            "snow": "BIOME_TUNDRA",
            "tundra": "BIOME_TUNDRA",
            "boreal": "BIOME_TUNDRA",
            "temperateDry": "BIOME_PLAINS",
            "temperateHumid": "BIOME_GRASSLAND",
            "tropicalSeasonal": "BIOME_GRASSLAND",
            "tropicalRainforest": "BIOME_TROPICAL",
            "desert": "BIOME_DESERT",
            "marine": "BIOME_MARINE"
          }
        },
        "featuresApply": {
          "apply": {
            "strategy": "default",
            "config": {
              "maxPerTile": 1
            }
          }
        },
        "plotEffects": {
          "plotEffects": {
            "strategy": "default",
            "config": {
              "snow": {
                "enabled": true,
                "selectors": {
                  "light": {
                    "typeName": "PLOTEFFECT_SNOW_LIGHT_PERMANENT"
                  },
                  "medium": {
                    "typeName": "PLOTEFFECT_SNOW_MEDIUM_PERMANENT"
                  },
                  "heavy": {
                    "typeName": "PLOTEFFECT_SNOW_HEAVY_PERMANENT"
                  }
                },
                "coverageChance": 80,
                "freezeWeight": 1,
                "elevationWeight": 1,
                "moistureWeight": 1,
                "scoreNormalization": 3,
                "scoreBias": 0,
                "lightThreshold": 0.35,
                "mediumThreshold": 0.6,
                "heavyThreshold": 0.8,
                "elevationStrategy": "absolute",
                "elevationMin": 200,
                "elevationMax": 2400,
                "elevationPercentileMin": 0.7,
                "elevationPercentileMax": 0.98,
                "moistureMin": 40,
                "moistureMax": 160,
                "maxTemperature": 4,
                "maxAridity": 0.9
              },
              "sand": {
                "enabled": false,
                "selector": {
                  "typeName": "PLOTEFFECT_SAND"
                },
                "chance": 18,
                "minAridity": 0.55,
                "minTemperature": 18,
                "maxFreeze": 0.25,
                "maxVegetation": 0.2,
                "maxMoisture": 90,
                "allowedBiomes": [
                  "desert",
                  "temperateDry"
                ]
              },
              "burned": {
                "enabled": false,
                "selector": {
                  "typeName": "PLOTEFFECT_BURNED"
                },
                "chance": 8,
                "minAridity": 0.45,
                "minTemperature": 20,
                "maxFreeze": 0.2,
                "maxVegetation": 0.35,
                "maxMoisture": 110,
                "allowedBiomes": [
                  "temperateDry",
                  "tropicalSeasonal"
                ]
              }
            }
          }
        }
      },
      "placement": {}
    }
  ) satisfies StandardRecipeConfig,
});
