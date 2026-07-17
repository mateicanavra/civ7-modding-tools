/**
 * Generated from ../configs/latest-juicy.config.json.
 * Do not edit by hand; re-run `bun run gen:maps`.
 */

/// <reference types="@civ7/types" />

import { createMap } from "@mateicanavra/civ7-sdk/mapgen";
import type { StandardMapConfigEnvelope } from "../configs/canonical.js";
import standardRecipe from "../../recipes/standard/recipe.js";

// The file plan only receives an admitted immutable envelope; this assertion
// projects its serialized data without adding a second runtime admission path.
const mapConfig = {
  "id": "latest-juicy",
  "name": "Latest Juicy",
  "description": "Config and seed last proved through Run in Game.",
  "recipe": "standard",
  "sortIndex": 1900,
  "latitudeBounds": {
    "topLatitude": 80,
    "bottomLatitude": -80
  },
  "config": {
    "foundation-mantle": {
      "knobs": {},
      "meshResolution": {
        "plateCount": 28,
        "cellsPerPlate": 13,
        "relaxationSteps": 2
      },
      "mantleSources": {
        "plumeCount": 17,
        "downwellingCount": 7,
        "plumeRadius": 0.1,
        "downwellingRadius": 0.28,
        "plumeAmplitude": 1.5,
        "downwellingAmplitude": -1.5,
        "smoothingIterations": 1,
        "smoothingAlpha": 0.35,
        "minSeparationScale": 0.85
      },
      "mantleForcing": {
        "velocityScale": 1.5,
        "rotationScale": 0.2,
        "stressNorm": 1,
        "curvatureWeight": 0.45,
        "upwellingThreshold": 0.25,
        "downwellingThreshold": 0.35
      }
    },
    "foundation-lithosphere": {
      "knobs": {},
      "lithosphere": {
        "basalticThickness01": 0.25,
        "yieldStrength01": 0.55,
        "mantleCoupling01": 0.6,
        "riftWeakening01": 0.35
      },
      "platePartition": {
        "plateCount": 42,
        "polarCaps": {
          "capFraction": 0.08,
          "microplateBandFraction": 0.2,
          "microplatesPerPole": 0,
          "microplatesMinPlateCount": 14,
          "microplateMinAreaCells": 8
        }
      }
    },
    "foundation-tectonics": {
      "knobs": {
        "plateActivity": 0.85
      },
      "plateMotion": {
        "omegaFactor": 1,
        "plateRadiusMin": 1,
        "residualNormScale": 1,
        "p90NormScale": 1,
        "histogramBins": 32,
        "smoothingSteps": 0
      },
      "tectonicSegmentation": {
        "intensityScale": 900,
        "regimeMinIntensity": 4
      },
      "tectonicEras": {
        "eraWeights": [
          0.3,
          0.25,
          0.2,
          0.15,
          0.1
        ],
        "driftStepsByEra": [
          12,
          9,
          6,
          3,
          1
        ]
      },
      "tectonicFields": {
        "beltInfluenceDistance": 8,
        "beltDecay": 0.55,
        "orogenyActivityGain": 1
      },
      "tectonicRollups": {
        "activityThreshold": 1
      }
    },
    "foundation-orogeny": {
      "knobs": {},
      "crustCharacter": {
        "continentalSurvivalMaturity": 0.6,
        "continentalFreeboard": 0.35,
        "hyperextensionBreakupBase": 0.1,
        "thinningThicknessLoss": 0.55,
        "oceanicAbyssalDepth": 0.75
      }
    },
    "foundation-projection": {
      "knobs": {}
    },
    "morphology-coasts": {
      "knobs": {
        "seaLevel": "earthlike",
        "coastRuggedness": "normal"
      },
      "substrate": {
        "continentalBaseErodibility": 0.3,
        "oceanicBaseErodibility": 0.53,
        "continentalBaseSediment": 0.19,
        "oceanicBaseSediment": 0.29,
        "ageErodibilityReduction": 0.35,
        "ageSedimentBoost": 0.15,
        "upliftErodibilityBoost": 0.35,
        "riftSedimentBoost": 0.34,
        "convergentBoundaryErodibilityBoost": 0.12,
        "divergentBoundaryErodibilityBoost": 0.18,
        "transformBoundaryErodibilityBoost": 0.08,
        "convergentBoundarySedimentBoost": 0.05,
        "divergentBoundarySedimentBoost": 0.1,
        "transformBoundarySedimentBoost": 0.03
      },
      "relief": {
        "boundaryBias": 0.12,
        "clusteringBias": 0.7,
        "crustEdgeBlend": 0.6,
        "crustNoiseAmplitude": 0.36,
        "continentalHeight": 0.54,
        "oceanicHeight": -0.75,
        "tectonics": {
          "interiorNoiseWeight": 0.5,
          "boundaryArcWeight": 0.32,
          "boundaryArcNoiseWeight": 0.26,
          "fractalGrain": 3
        }
      },
      "continentalMargin": {
        "breakCrustFraction": 0.45,
        "apronTopCrustFraction": 0.62,
        "apronBlendStrength": 0.8,
        "baseApronLengthTiles": 3,
        "activeApronFactor": 0.4,
        "riftApronFactor": 0.6,
        "passiveApronFactor": 1.5,
        "ageApronGain": 0.6,
        "buoyancyApronGain": 0.4,
        "activeClosenessThreshold": 0.35
      },
      "waterCoverage": {
        "targetWaterPercent": 63,
        "targetScalar": 1,
        "variance": 1.15,
        "boundaryShareTarget": 0.005,
        "continentalFraction": 0.39
      },
      "continents": {
        "continentPotentialGrain": 1,
        "continentPotentialBlurSteps": 1,
        "keepLandComponentFraction": 0.985,
        "cratonStepsPerEra": 7,
        "cratonNucleationScale": 0.9,
        "cratonDiffusion": 0.25,
        "cratonAdvection": 0.15,
        "cratonHalfSaturation": 0.35,
        "cratonPotentialWeight": 0.72
      },
      "coastlineShape": {
        "bay": {
          "noiseGateAdd": 0.05,
          "rollDenActive": 4,
          "rollDenDefault": 7
        },
        "fjord": {
          "baseDenom": 15,
          "activeBonus": 2,
          "passiveBonus": 1
        },
        "plateBias": {
          "threshold": 0.42,
          "power": 1.3,
          "convergent": 1.5,
          "transform": 0.35,
          "divergent": -0.45,
          "interior": 0.35,
          "bayWeight": 0.9,
          "bayNoiseBonus": 0.45,
          "fjordWeight": 0.85
        }
      }
    },
    "morphology-routing": {
      "knobs": {}
    },
    "morphology-erosion": {
      "knobs": {
        "erosion": "low"
      },
      "geomorphicCycle": {
        "geomorphology": {
          "fluvial": {
            "rate": 0.26,
            "m": 0.5,
            "n": 1
          },
          "diffusion": {
            "rate": 0.23,
            "talus": 0.5
          },
          "deposition": {
            "rate": 0.21
          },
          "eras": 1
        },
        "worldAge": "young"
      }
    },
    "morphology-features": {
      "knobs": {
        "orogeny": "high",
        "volcanism": "high"
      },
      "islandChains": {
        "fractalThresholdPercent": 96,
        "minDistFromLandRadius": 5,
        "baseIslandDenNearActive": 2,
        "baseIslandDenElse": 2,
        "hotspotSeedDenom": 3,
        "clusterMax": 12,
        "microcontinentChance": 0.12
      },
      "mountainRanges": {
        "tectonicActivity": 0.3,
        "rangeSystemSpacingTiles": 13,
        "rangeSystemLengthTiles": 21,
        "provinceRadiusTiles": 4,
        "ridgeWidthTiles": 2,
        "foothillExtentTiles": 2,
        "interiorHighlandExpression": 0.67,
        "terrainTextureFractalMix": 0.81,
        "erosionMaturity": 0.36,
        "tectonicSignalSensitivity": 1
      },
      "volcanoes": {
        "enabled": true,
        "baseDensity": 0.00625,
        "minSpacing": 6,
        "boundaryThreshold": 0.32,
        "boundaryWeight": 1.35,
        "convergentMultiplier": 3.3,
        "transformMultiplier": 0.8,
        "divergentMultiplier": 0.32,
        "hotspotWeight": 0.32,
        "shieldPenalty": 0.55,
        "randomJitter": 0.04,
        "minVolcanoes": 12,
        "maxVolcanoes": 42
      }
    },
    "morphology-shelf": {
      "knobs": {
        "shelfWidth": "wide"
      },
      "shelf": {
        "breakGradient": 8,
        "breakGradientScale": 1,
        "activeClosenessThreshold": 0.35
      }
    },
    "hydrology-climate-baseline": {
      "knobs": {
        "dryness": "dry",
        "temperature": "hot",
        "seasonality": "high",
        "oceanCoupling": "earthlike"
      },
      "seasonalCycle": {
        "modeCount": 4,
        "axialTiltDeg": 23
      },
      "solarForcing": {
        "equatorInsolation": 1.5,
        "poleInsolation": 0.22,
        "latitudeExponent": 1.2
      },
      "thermalState": {
        "baseTemperatureC": 8,
        "insolationScaleC": 50,
        "lapseRateCPerM": -0.0065,
        "landCoolingC": 3.2,
        "minC": -40,
        "maxC": 50
      },
      "atmosphericCirculation": {
        "maxSpeed": 160,
        "zonalStrength": 130,
        "meridionalStrength": 130,
        "geostrophicStrength": 170,
        "pressureNoiseScale": 20,
        "pressureNoiseAmp": 62,
        "waveStrength": 48,
        "landHeatStrength": 23,
        "mountainDeflectStrength": 22,
        "smoothIters": 5
      },
      "oceanCurrents": {
        "maxSpeed": 80,
        "windStrength": 0.58,
        "ekmanStrength": 0.38,
        "gyreStrength": 30,
        "coastStrength": 36,
        "smoothIters": 4,
        "projectionIters": 8
      },
      "oceanGeometry": {
        "maxCoastDistance": 64,
        "maxCoastVectorDistance": 10
      },
      "oceanThermalState": {
        "equatorTempC": 27,
        "poleTempC": -1,
        "advectIters": 30,
        "diffusion": 0.2,
        "secondaryWeightMin": 0.25,
        "seaIceThresholdC": -1
      },
      "evaporation": {
        "oceanStrength": 1,
        "landStrength": 0.2,
        "minTempC": -10,
        "maxTempC": 32
      },
      "moistureTransport": {
        "iterations": 26,
        "advection": 0.74,
        "retention": 0.91,
        "secondaryWeightMin": 0.2
      },
      "precipitation": {
        "rainfallScale": 150,
        "humidityExponent": 1.15,
        "noiseAmplitude": 14,
        "noiseScale": 0.16,
        "waterGradient": {
          "radius": 6,
          "perRingBonus": 5,
          "lowlandBonus": 3,
          "lowlandElevationMax": 200
        },
        "upliftStrength": 27,
        "convergenceStrength": 19
      }
    },
    "hydrology-hydrography": {
      "knobs": {
        "riverDensity": "normal",
        "lakeiness": "many"
      },
      "drainageRouting": {
        "allowExternalEdgeOutlets": false
      },
      "runoff": {
        "runoffScale": 1,
        "infiltrationFraction": 0.18,
        "humidityDampening": 0.22,
        "minRunoff": 0
      },
      "riverNetwork": {
        "minorPercentile": 0.78,
        "majorPercentile": 0.91,
        "minMinorDischarge": 0,
        "minMajorDischarge": 0
      },
      "lakes": {
        "maxUpstreamSteps": 2,
        "sinkDischargePercentileMin": 0.94,
        "maxLakeLandFraction": 0.07
      }
    },
    "hydrology-climate-refine": {
      "knobs": {
        "dryness": "dry",
        "temperature": "hot",
        "cryosphere": "on"
      },
      "precipitationRefinement": {
        "riverCorridor": {
          "adjacencyRadius": 2,
          "lowlandAdjacencyBonus": 27,
          "highlandAdjacencyBonus": 12,
          "lowlandElevationMax": 360
        },
        "lowBasin": {
          "radius": 3,
          "delta": 18,
          "elevationMax": 320,
          "openThresholdM": 24
        }
      },
      "solarForcing": {
        "equatorInsolation": 0.9,
        "poleInsolation": 0.1,
        "latitudeExponent": 1
      },
      "thermalState": {
        "baseTemperatureC": 9,
        "insolationScaleC": 50,
        "lapseRateCPerM": -0.0095,
        "landCoolingC": 0.32,
        "minC": -60,
        "maxC": 50
      },
      "albedoFeedback": {
        "iterations": 3,
        "snowCoolingC": 3,
        "seaIceCoolingC": 5,
        "minC": -60,
        "maxC": 60,
        "landSnowStartC": 0,
        "landSnowFullC": -30,
        "seaIceStartC": -0.1,
        "seaIceFullC": -60,
        "precipitationInfluence": 0.6
      },
      "cryosphereState": {
        "landSnowStartC": 1,
        "landSnowFullC": -12,
        "seaIceStartC": 0,
        "seaIceFullC": -10,
        "freezeIndexStartC": 2,
        "freezeIndexFullC": -12,
        "precipitationInfluence": 0.8,
        "permafrostStartFreezeIndex": 0.4,
        "permafrostFullFreezeIndex": 0.8,
        "meltStartC": 0,
        "meltFullC": 10,
        "groundIceSnowInfluence": 0.75,
        "baseAlbedo": 30,
        "snowAlbedoBoost": 180,
        "seaIceAlbedoBoost": 180
      },
      "landWaterBudget": {
        "tMinC": 0,
        "tMaxC": 36,
        "petBase": 19,
        "petTemperatureWeight": 82,
        "humidityDampening": 0.5
      },
      "diagnostics": {
        "barrierSteps": 2,
        "barrierElevationM": 1000,
        "continentalityMaxDist": 14,
        "convergenceNormalization": 78
      }
    },
    "ecology-pedology": {
      "knobs": {},
      "soilClassification": {
        "profile": "orogenyBoosted",
        "climateWeight": 1.25,
        "reliefWeight": 1.18,
        "sedimentWeight": 1,
        "bedrockWeight": 0.82,
        "fertilityCeiling": 0.95
      },
      "resourceBasinPlanning": {
        "profile": "mixed",
        "resources": []
      },
      "resourceBasinScoring": {
        "minConfidence": 0.32,
        "maxPerResource": 14
      }
    },
    "ecology-biomes": {
      "knobs": {},
      "biomeClassification": {
        "temperature": {
          "equator": 30,
          "pole": -54,
          "lapseRate": 7.1,
          "seaLevel": 200,
          "bias": 0.15,
          "polarCutoff": -1,
          "tundraCutoff": 4,
          "midLatitude": 10,
          "tropicalThreshold": 30
        },
        "moisture": {
          "thresholds": [
            90,
            188,
            228,
            252
          ]
        },
        "aridity": {
          "temperatureMin": 0,
          "temperatureMax": 45,
          "petBase": 19,
          "petTemperatureWeight": 92,
          "humidityDampening": 0.5,
          "rainfallWeight": 1.08,
          "bias": 2,
          "normalization": 118,
          "moistureShiftThresholds": [
            0.2,
            0.66
          ],
          "vegetationPenalty": 0.78
        },
        "vegetation": {
          "base": 0.39,
          "moistureWeight": 0.78,
          "moistureNormalizationPadding": 48
        },
        "edgeRefine": {
          "radius": 1,
          "iterations": 3
        }
      }
    },
    "map-morphology": {
      "knobs": {}
    },
    "map-hydrology": {
      "knobs": {}
    },
    "map-elevation": {
      "knobs": {}
    },
    "map-rivers": {
      "knobs": {
        "navigableRiverDensity": "normal"
      }
    },
    "ecology-features": {
      "knobs": {},
      "substrateScoring": {
        "vegetationGrowth": {
          "moistureNormalization": 238,
          "temperatureMinC": -22,
          "temperatureMaxC": 42
        },
        "featureHabitats": {
          "nearRiverRadius": 2,
          "isolatedRiverRadius": 1,
          "coastalAdjacencyRadius": 1,
          "lowlandMaxElevationAboveSeaM": 150,
          "intertidalMaxElevationAboveSeaM": 28,
          "floodplainDischargeMin": 96
        }
      },
      "wetlandScoring": {
        "marsh": {
          "waterMin01": 0.55,
          "fertilityMin01": 0.2,
          "aridityMax01": 0.6,
          "tempMinC": -2,
          "tempPeakC": 10,
          "tempMaxC": 24
        },
        "tundraBog": {
          "waterMin01": 0.55,
          "fertilityMin01": 0.1,
          "freezeMin01": 0.55,
          "tempColdMaxC": 4,
          "tempWarmMaxC": 14
        },
        "mangrove": {
          "waterMin01": 0.45,
          "fertilityMin01": 0.15,
          "aridityMax01": 0.7,
          "tempWarmStartC": 18,
          "tempWarmEndC": 30
        },
        "oasis": {
          "dryMin01": 0.6,
          "dryMax01": 0.95,
          "waterMin01": 0.35,
          "tempWarmStartC": 20,
          "tempWarmEndC": 45
        },
        "wateringHole": {
          "dryMin01": 0.45,
          "dryMax01": 0.85,
          "waterMin01": 0.25,
          "fertilityMin01": 0.1,
          "tempWarmStartC": 12,
          "tempWarmEndC": 32
        }
      },
      "reefScoring": {
        "warmReef": {
          "tempWarmStartC": 18,
          "tempWarmEndC": 28,
          "shallowDepthM": 0,
          "deepDepthM": 120,
          "maxDistanceToCoast": 3
        },
        "coldReef": {
          "tempColdMaxC": 14,
          "tempWarmMaxC": 24,
          "minDepthM": 0,
          "peakDepthM": 18,
          "maxDepthM": 120,
          "minDistanceToCoast": 1,
          "maxDistanceToCoast": 10
        },
        "atoll": {
          "tempWarmStartC": 18,
          "tempWarmEndC": 30,
          "shallowDepthM": 0,
          "deepDepthM": 100,
          "minDistanceToCoast": 4,
          "maxDistanceToCoast": 24
        },
        "lotus": {
          "tempWarmStartC": 16,
          "tempWarmEndC": 32,
          "shallowDepthM": 0,
          "deepDepthM": 40,
          "maxDistanceToCoast": 2
        }
      },
      "iceScoring": {
        "ice": {
          "seaTempColdC": -10,
          "seaTempWarmC": -2,
          "alpineElevationMinM": 2200,
          "alpineElevationMaxM": 3400,
          "alpineFreezeMin01": 0.55
        }
      },
      "icePlanning": {
        "profile": "continentality",
        "minConfidence01": 0.5
      },
      "reefPlanning": {
        "profile": "default",
        "minConfidence01": 0.84,
        "stride": 4
      },
      "wetlandPlanning": {
        "minConfidence01": 0.42
      },
      "floodplainPlanning": {
        "minConfidence01": 0.8
      },
      "vegetationPlanning": {
        "forestMinConfidence01": 0.04,
        "rainforestMinConfidence01": 0.29,
        "taigaMinConfidence01": 0,
        "savannaWoodlandMinConfidence01": 0,
        "sagebrushSteppeMinConfidence01": 0
      },
      "plotEffectScoring": {
        "snow": {
          "maxTemperature": 2,
          "maxAridity": 0.82,
          "freezeWeight": 1.05,
          "elevationWeight": 0.9,
          "moistureWeight": 0.7,
          "scoreNormalization": 2.65,
          "scoreBias": 0,
          "elevationStrategy": "percentile",
          "elevationMin": 220,
          "elevationMax": 2800,
          "elevationPercentileMin": 0.72,
          "elevationPercentileMax": 0.98,
          "moistureMin": 45,
          "moistureMax": 170
        },
        "sand": {
          "minAridity": 0.3,
          "minTemperature": 5,
          "maxFreeze": 0.5,
          "maxVegetation": 0.5,
          "maxMoisture": 200,
          "allowedBiomes": [
            "desert",
            "temperateDry"
          ]
        },
        "burned": {
          "minAridity": 0.52,
          "minTemperature": 21,
          "maxFreeze": 0.22,
          "maxVegetation": 0.26,
          "maxMoisture": 98,
          "allowedBiomes": [
            "temperateDry",
            "tropicalSeasonal"
          ]
        },
        "jungle": {
          "minTemperature": 22,
          "minMoisture": 110,
          "minVegetation": 0.45,
          "allowedBiomes": [
            "tropicalRainforest"
          ]
        }
      },
      "plotEffectCoverage": {
        "snow": {
          "enabled": true,
          "coveragePct": 55,
          "lightThreshold": 0.38,
          "mediumThreshold": 0.62,
          "heavyThreshold": 0.82,
          "hazardEnabled": false,
          "hazardThreshold": 0.85
        },
        "sand": {
          "enabled": true,
          "hazardEnabled": false,
          "coveragePct": 24
        },
        "burned": {
          "enabled": true,
          "coveragePct": 6
        },
        "jungle": {
          "enabled": false,
          "coveragePct": 12
        }
      }
    },
    "map-ecology": {
      "knobs": {},
      "biomeBindings": {
        "snow": "BIOME_TUNDRA",
        "tundra": "BIOME_TUNDRA",
        "boreal": "BIOME_TUNDRA",
        "temperateDry": "BIOME_PLAINS",
        "temperateHumid": "BIOME_GRASSLAND",
        "tropicalSeasonal": "BIOME_PLAINS",
        "tropicalRainforest": "BIOME_TROPICAL",
        "desert": "BIOME_DESERT",
        "marine": "BIOME_MARINE"
      }
    },
    "placement": {
      "knobs": {},
      "naturalWonders": {
        "minSpacingTiles": 6
      },
      "resources": {
        "density": 1.3,
        "sparsity": 0.1,
        "rarityFidelity": 0.9,
        "siteSpacingTiles": 3,
        "perTypeSpacingFloorScale": 1.2,
        "equityMaxDensityRatio": 1,
        "familyDensity": {
          "aquatic": 2,
          "cultivated": 1.5,
          "terrestrial": 1.3,
          "geological": 1
        },
        "affinityRules": [
          {
            "resourceA": "RESOURCE_IRON",
            "resourceB": "RESOURCE_HORSES",
            "relation": "affinity",
            "radiusTiles": 3
          },
          {
            "resourceA": "RESOURCE_IRON",
            "resourceB": "RESOURCE_WOOL",
            "relation": "affinity",
            "radiusTiles": 2
          }
        ]
      },
      "starts": {
        "minContiguousLandTiles": 24,
        "expansionRadiusTiles": 4,
        "minExpansionLandTiles": 4,
        "islandClusterRadiusTiles": 5,
        "minIslandClusterLandTiles": 3,
        "maxIslandStartCoastDistance": 8,
        "marginalLandRatio": 0.5,
        "marginalExpansionRatio": 0.65,
        "spacingFloorTiles": 6,
        "desiredSpacingTiles": 9,
        "fertilityWeight": 3,
        "resourceSupportWeight": 0.5,
        "resourceSupportRadiusTiles": 1,
        "freshwaterWeight": 1.3,
        "largeLandmassWeight": 1,
        "climateWeight": 1.6,
        "climateExtremePenaltyWeight": 1.5,
        "roughnessPenaltyWeight": 0.6,
        "roughnessDivisor": 900,
        "tierBias": {
          "primary": 0.08,
          "islandCluster": 0.02,
          "marginal": -0.08
        },
        "rankingBlend": 0.86,
        "fairnessTolerance": 0.3,
        "coastalPreferenceWeight": 0,
        "riverPreferenceWeight": 0,
        "startBiasWeight": 1
      },
      "support": {
        "enabled": true,
        "supportFloor": 2,
        "supportRadiusTiles": 4,
        "equityTolerance": 2,
        "strength": 1
      }
    }
  }
} as unknown as StandardMapConfigEnvelope;

export default createMap({
  ...mapConfig,
  recipe: standardRecipe,
  sourceConfigId: "latest-juicy",
  configHash: "00cc9af500b85cbeabe678eb6faae125c29c86e4ddce18de6b1ce31c488d1f48",
  envelopeHash: "edf5222390fa99e1ba278b1837ba292760e67d930eaf1c4b20ea89fd3aa245a8",
  config: mapConfig.config,
});
