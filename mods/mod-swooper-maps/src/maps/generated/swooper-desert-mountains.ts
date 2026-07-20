/**
 * Generated from ../configs/swooper-desert-mountains.config.json.
 * Do not edit by hand; re-run `bun run gen:maps`.
 */

/// <reference types="@civ7/types" />

import { createMap } from "@mateicanavra/civ7-sdk/mapgen";
import type { StandardMapConfigEnvelope } from "../configs/canonical.js";
import standardRecipe from "../../recipes/standard/recipe.js";

// The file plan only receives an admitted immutable envelope; this assertion
// projects its serialized data without adding a second runtime admission path.
const mapConfig = {
  "id": "swooper-desert-mountains",
  "name": "Swooper Desert Mountains",
  "description": "Plate-forged mega ranges carve a hyper-arid world into stark basins and windward oases. Expect towering boundary cordilleras, savage lee-side deserts, and a handful of monsoon belts clinging to the mountains that feed them.",
  "recipe": "standard",
  "sortIndex": 500,
  "latitudeBounds": {
    "topLatitude": 40,
    "bottomLatitude": -40
  },
  "config": {
    "foundation-mantle": {
      "meshResolution": {
        "plateCount": 24,
        "cellsPerPlate": 4,
        "relaxationSteps": 2
      },
      "mantleSources": {
        "plumeCount": 6,
        "downwellingCount": 6,
        "plumeRadius": 0.18,
        "downwellingRadius": 0.18,
        "plumeAmplitude": 1,
        "downwellingAmplitude": -1,
        "smoothingIterations": 2,
        "smoothingAlpha": 0.35,
        "minSeparationScale": 0.85
      },
      "mantleForcing": {
        "velocityScale": 1,
        "rotationScale": 0.2,
        "stressNorm": 1,
        "curvatureWeight": 0.35,
        "upwellingThreshold": 0.35,
        "downwellingThreshold": 0.35
      },
      "knobs": {}
    },
    "foundation-lithosphere": {
      "lithosphere": {
        "basalticThickness01": 0.25,
        "yieldStrength01": 0.55,
        "mantleCoupling01": 0.6,
        "riftWeakening01": 0.35
      },
      "platePartition": {
        "plateCount": 24,
        "polarCaps": {
          "capFraction": 0.1,
          "microplateBandFraction": 0.2,
          "microplatesPerPole": 0,
          "microplatesMinPlateCount": 14,
          "microplateMinAreaCells": 8
        }
      },
      "knobs": {}
    },
    "foundation-tectonics": {
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
      },
      "knobs": {
        "plateActivity": 0.5
      }
    },
    "morphology-coasts": {
      "substrate": {
        "continentalBaseErodibility": 0.65,
        "oceanicBaseErodibility": 0.55,
        "continentalBaseSediment": 0.15,
        "oceanicBaseSediment": 0.25,
        "upliftErodibilityBoost": 0.3,
        "riftSedimentBoost": 0.2,
        "ageErodibilityReduction": 0.25,
        "ageSedimentBoost": 0.15,
        "convergentBoundaryErodibilityBoost": 0.12,
        "divergentBoundaryErodibilityBoost": 0.18,
        "transformBoundaryErodibilityBoost": 0.08,
        "convergentBoundarySedimentBoost": 0.05,
        "divergentBoundarySedimentBoost": 0.1,
        "transformBoundarySedimentBoost": 0.03
      },
      "relief": {
        "boundaryBias": 0.18,
        "clusteringBias": 0.35,
        "crustEdgeBlend": 0.35,
        "crustNoiseAmplitude": 0.14,
        "continentalHeight": 0.52,
        "oceanicHeight": -0.6,
        "tectonics": {
          "interiorNoiseWeight": 0.45,
          "boundaryArcWeight": 0.5,
          "boundaryArcNoiseWeight": 0.35,
          "fractalGrain": 5
        }
      },
      "waterCoverage": {
        "targetWaterPercent": 48,
        "targetScalar": 1,
        "variance": 0,
        "boundaryShareTarget": 0.22,
        "continentalFraction": 0.3
      },
      "continents": {
        "continentPotentialGrain": 8,
        "continentPotentialBlurSteps": 3,
        "keepLandComponentFraction": 0.985,
        "cratonStepsPerEra": 2,
        "cratonNucleationScale": 0.9,
        "cratonDiffusion": 0.25,
        "cratonAdvection": 0.15,
        "cratonHalfSaturation": 0.35,
        "cratonPotentialWeight": 0.12
      },
      "coastlineShape": {
        "plateBias": {
          "threshold": 0.15,
          "power": 1.3,
          "convergent": 3,
          "transform": 0.2,
          "divergent": 0.5,
          "interior": 0.35,
          "bayWeight": 0.75,
          "bayNoiseBonus": 0.1,
          "fjordWeight": 0.8
        },
        "bay": {
          "noiseGateAdd": 0,
          "rollDenActive": 4,
          "rollDenDefault": 5
        },
        "fjord": {
          "baseDenom": 12,
          "activeBonus": 1,
          "passiveBonus": 2
        }
      },
      "knobs": {
        "seaLevel": "earthlike",
        "coastRuggedness": "normal"
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
      }
    },
    "morphology-routing": {
      "knobs": {}
    },
    "morphology-erosion": {
      "geomorphicCycle": {
        "geomorphology": {
          "fluvial": {
            "rate": 0.08,
            "m": 0.5,
            "n": 1
          },
          "diffusion": {
            "rate": 0.12,
            "talus": 0.45
          },
          "deposition": {
            "rate": 0.07
          },
          "eras": 3
        },
        "worldAge": "old"
      },
      "knobs": {
        "erosion": "normal"
      }
    },
    "morphology-features": {
      "islandChains": {
        "fractalThresholdPercent": 96,
        "minDistFromLandRadius": 4,
        "baseIslandDenNearActive": 2,
        "baseIslandDenElse": 2,
        "hotspotSeedDenom": 6,
        "clusterMax": 1,
        "microcontinentChance": 0
      },
      "volcanoes": {
        "enabled": true,
        "baseDensity": 0.006,
        "minSpacing": 5,
        "boundaryThreshold": 0.32,
        "boundaryWeight": 1.4,
        "convergentMultiplier": 2.2,
        "transformMultiplier": 0.7,
        "divergentMultiplier": 0.2,
        "hotspotWeight": 0.15,
        "shieldPenalty": 0.3,
        "randomJitter": 0.08,
        "minVolcanoes": 6,
        "maxVolcanoes": 18
      },
      "knobs": {
        "orogeny": "normal",
        "volcanism": "normal"
      },
      "mountainRanges": {
        "tectonicActivity": 1,
        "rangeSystemSpacingTiles": 20,
        "rangeSystemLengthTiles": 22,
        "provinceRadiusTiles": 4,
        "ridgeWidthTiles": 1,
        "foothillExtentTiles": 3,
        "interiorHighlandExpression": 0.55,
        "terrainTextureFractalMix": 0.45,
        "erosionMaturity": 0.45,
        "tectonicSignalSensitivity": 1
      }
    },
    "morphology-shelf": {
      "shelf": {
        "activeClosenessThreshold": 0.45,
        "breakGradient": 8,
        "breakGradientScale": 1
      },
      "knobs": {
        "shelfWidth": "normal"
      }
    },
    "hydrology-climate-baseline": {
      "seasonalCycle": {
        "modeCount": 2,
        "axialTiltDeg": 12
      },
      "solarForcing": {
        "equatorInsolation": 1,
        "poleInsolation": 0.25,
        "latitudeExponent": 1.2
      },
      "thermalState": {
        "baseTemperatureC": 11.5,
        "insolationScaleC": 57,
        "lapseRateCPerM": -0.0065,
        "landCoolingC": 2,
        "minC": -40,
        "maxC": 50
      },
      "atmosphericCirculation": {
        "maxSpeed": 110,
        "zonalStrength": 90,
        "meridionalStrength": 30,
        "geostrophicStrength": 70,
        "pressureNoiseScale": 18,
        "pressureNoiseAmp": 41.25,
        "waveStrength": 33.75,
        "landHeatStrength": 20,
        "mountainDeflectStrength": 18,
        "smoothIters": 4
      },
      "oceanCurrents": {
        "maxSpeed": 80,
        "windStrength": 0.55,
        "ekmanStrength": 0.35,
        "gyreStrength": 26,
        "coastStrength": 32,
        "smoothIters": 3,
        "projectionIters": 8
      },
      "oceanGeometry": {
        "maxCoastDistance": 64,
        "maxCoastVectorDistance": 10
      },
      "oceanThermalState": {
        "equatorTempC": 28,
        "poleTempC": -2,
        "advectIters": 28,
        "diffusion": 0.18,
        "secondaryWeightMin": 0.25,
        "seaIceThresholdC": -1
      },
      "evaporation": {
        "oceanStrength": 0.85,
        "landStrength": 0.17,
        "minTempC": -10,
        "maxTempC": 30
      },
      "moistureTransport": {
        "iterations": 22,
        "advection": 0.7,
        "retention": 0.93,
        "secondaryWeightMin": 0.2
      },
      "precipitation": {
        "rainfallScale": 153,
        "humidityExponent": 1,
        "noiseAmplitude": 5,
        "noiseScale": 0.12,
        "waterGradient": {
          "radius": 5,
          "perRingBonus": 3,
          "lowlandBonus": 2,
          "lowlandElevationMax": 150
        },
        "upliftStrength": 22,
        "convergenceStrength": 16
      },
      "knobs": {
        "dryness": "dry",
        "temperature": "temperate",
        "seasonality": "normal",
        "oceanCoupling": "earthlike"
      }
    },
    "hydrology-hydrography": {
      "runoff": {
        "runoffScale": 1,
        "infiltrationFraction": 0.15,
        "humidityDampening": 0.25,
        "minRunoff": 0
      },
      "riverNetwork": {
        "minorPercentile": 0.91,
        "majorPercentile": 0.98,
        "minMinorDischarge": 0,
        "minMajorDischarge": 0
      },
      "lakes": {
        "maxUpstreamSteps": 1,
        "sinkDischargePercentileMin": 0.97,
        "maxLakeLandFraction": 0.0015
      },
      "knobs": {
        "riverDensity": "normal",
        "lakeiness": "normal"
      },
      "drainageRouting": {
        "allowExternalEdgeOutlets": false
      }
    },
    "hydrology-climate-refine": {
      "precipitationRefinement": {
        "riverCorridor": {
          "adjacencyRadius": 1,
          "lowlandAdjacencyBonus": 12,
          "highlandAdjacencyBonus": 9,
          "lowlandElevationMax": 250
        },
        "lowBasin": {
          "radius": 2,
          "delta": 5,
          "elevationMax": 200,
          "openThresholdM": 20
        }
      },
      "solarForcing": {
        "equatorInsolation": 1,
        "poleInsolation": 0.25,
        "latitudeExponent": 1.2
      },
      "thermalState": {
        "baseTemperatureC": 11.5,
        "insolationScaleC": 57,
        "lapseRateCPerM": -0.0065,
        "landCoolingC": 2,
        "minC": -40,
        "maxC": 50
      },
      "albedoFeedback": {
        "iterations": 0,
        "snowCoolingC": 4,
        "seaIceCoolingC": 6,
        "minC": -60,
        "maxC": 60,
        "landSnowStartC": 0,
        "landSnowFullC": -12,
        "seaIceStartC": -1,
        "seaIceFullC": -10,
        "precipitationInfluence": 0.25
      },
      "cryosphereState": {
        "landSnowStartC": -60,
        "landSnowFullC": -80,
        "seaIceStartC": -60,
        "seaIceFullC": -80,
        "freezeIndexStartC": -60,
        "freezeIndexFullC": -80,
        "precipitationInfluence": 0,
        "permafrostStartFreezeIndex": 0.4,
        "permafrostFullFreezeIndex": 0.8,
        "meltStartC": 0,
        "meltFullC": 10,
        "groundIceSnowInfluence": 0.75,
        "baseAlbedo": 30,
        "snowAlbedoBoost": 0,
        "seaIceAlbedoBoost": 0
      },
      "landWaterBudget": {
        "tMinC": 0,
        "tMaxC": 35,
        "petBase": 40,
        "petTemperatureWeight": 140,
        "humidityDampening": 0.45
      },
      "diagnostics": {
        "barrierSteps": 4,
        "barrierElevationM": 500,
        "continentalityMaxDist": 12,
        "convergenceNormalization": 64
      },
      "knobs": {
        "dryness": "dry",
        "temperature": "temperate",
        "cryosphere": "on"
      }
    },
    "ecology-pedology": {
      "knobs": {},
      "soilClassification": {
        "profile": "orogenyBoosted",
        "climateWeight": 1.2,
        "reliefWeight": 0.8,
        "sedimentWeight": 1.1,
        "bedrockWeight": 0.6,
        "fertilityCeiling": 0.95
      },
      "resourceBasinPlanning": {
        "profile": "mixed",
        "resources": []
      },
      "resourceBasinScoring": {
        "minConfidence": 0.3,
        "maxPerResource": 12
      }
    },
    "ecology-biomes": {
      "knobs": {},
      "biomeClassification": {
        "temperature": {
          "equator": 35,
          "pole": 8,
          "lapseRate": 7.8,
          "seaLevel": 0,
          "bias": 2.2,
          "polarCutoff": -8,
          "tundraCutoff": -2,
          "midLatitude": 11,
          "tropicalThreshold": 25
        },
        "moisture": {
          "thresholds": [
            180,
            240,
            300,
            340
          ]
        },
        "aridity": {
          "temperatureMin": 2,
          "temperatureMax": 42,
          "petBase": 30,
          "petTemperatureWeight": 122,
          "humidityDampening": 0.28,
          "rainfallWeight": 0.95,
          "bias": 24,
          "normalization": 76,
          "moistureShiftThresholds": [
            0.38,
            0.62
          ],
          "vegetationPenalty": 0.31
        },
        "vegetation": {
          "base": 0.09,
          "moistureWeight": 0.46,
          "moistureNormalizationPadding": 40
        },
        "edgeRefine": {
          "radius": 1,
          "iterations": 2
        }
      }
    },
    "ecology-features": {
      "knobs": {},
      "substrateScoring": {
        "vegetationGrowth": {
          "moistureNormalization": 380,
          "temperatureMinC": -20,
          "temperatureMaxC": 40
        },
        "featureHabitats": {
          "nearRiverRadius": 2,
          "isolatedRiverRadius": 1,
          "coastalAdjacencyRadius": 1,
          "lowlandMaxElevationAboveSeaM": 160,
          "intertidalMaxElevationAboveSeaM": 40,
          "floodplainDischargeMin": 0
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
          "tempWarmEndC": 38
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
          "tempWarmStartC": 14,
          "tempWarmEndC": 28,
          "shallowDepthM": 0,
          "deepDepthM": 120,
          "maxDistanceToCoast": 3
        },
        "coldReef": {
          "tempColdMaxC": 10,
          "tempWarmMaxC": 20,
          "minDepthM": 8,
          "peakDepthM": 24,
          "maxDepthM": 48,
          "minDistanceToCoast": 1,
          "maxDistanceToCoast": 8
        },
        "atoll": {
          "tempWarmStartC": 18,
          "tempWarmEndC": 30,
          "shallowDepthM": 0,
          "deepDepthM": 100,
          "minDistanceToCoast": 4,
          "maxDistanceToCoast": 8
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
        "minConfidence01": 0.55
      },
      "reefPlanning": {
        "profile": "habitat",
        "minConfidence01": 0.62,
        "stride": 3
      },
      "wetlandPlanning": {
        "minConfidence01": 0.32
      },
      "vegetationPlanning": {
        "forestMinConfidence01": 0.22,
        "rainforestMinConfidence01": 0.38,
        "taigaMinConfidence01": 0.12,
        "savannaWoodlandMinConfidence01": 0.1,
        "sagebrushSteppeMinConfidence01": 0.04
      },
      "plotEffectScoring": {
        "snow": {
          "elevationStrategy": "percentile",
          "elevationMin": 400,
          "elevationMax": 3200,
          "elevationPercentileMin": 0.85,
          "elevationPercentileMax": 0.99,
          "moistureMin": 20,
          "moistureMax": 120,
          "maxTemperature": 2,
          "maxAridity": 0.8,
          "freezeWeight": 1,
          "elevationWeight": 1.2,
          "moistureWeight": 0.4,
          "scoreNormalization": 2.6,
          "scoreBias": 0
        },
        "sand": {
          "minAridity": 0.58,
          "minTemperature": 19,
          "maxFreeze": 0.2,
          "maxVegetation": 0.15,
          "maxMoisture": 70,
          "allowedBiomes": [
            "desert",
            "temperateDry"
          ]
        },
        "burned": {
          "minAridity": 0.62,
          "minTemperature": 24,
          "maxFreeze": 0.15,
          "maxVegetation": 0.22,
          "maxMoisture": 90,
          "allowedBiomes": [
            "desert",
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
          "coveragePct": 35,
          "lightThreshold": 0.5,
          "mediumThreshold": 0.7,
          "heavyThreshold": 0.85,
          "hazardEnabled": false,
          "hazardThreshold": 0.85
        },
        "sand": {
          "enabled": true,
          "coveragePct": 15,
          "hazardEnabled": false
        },
        "burned": {
          "enabled": true,
          "coveragePct": 16
        },
        "jungle": {
          "enabled": false,
          "coveragePct": 12
        }
      },
      "floodplainPlanning": {
        "minConfidence01": 0.5
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
        "navigableRiverDensity": "sparse"
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
        "density": 1,
        "sparsity": 0,
        "rarityFidelity": 1,
        "siteSpacingTiles": 3,
        "perTypeSpacingFloorScale": 1,
        "equityMaxDensityRatio": 1.8,
        "familyDensity": {
          "aquatic": 1,
          "cultivated": 1,
          "terrestrial": 1,
          "geological": 1
        },
        "affinityRules": []
      },
      "starts": {
        "minContiguousLandTiles": 24,
        "expansionRadiusTiles": 4,
        "minExpansionLandTiles": 14,
        "islandClusterRadiusTiles": 5,
        "minIslandClusterLandTiles": 18,
        "maxIslandStartCoastDistance": 1,
        "marginalLandRatio": 0.5,
        "marginalExpansionRatio": 0.65,
        "spacingFloorTiles": 6,
        "desiredSpacingTiles": 12,
        "fertilityWeight": 2.2,
        "resourceSupportWeight": 0.5,
        "resourceSupportRadiusTiles": 4,
        "freshwaterWeight": 1.1,
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
    }
  }
} as unknown as StandardMapConfigEnvelope;

export default createMap({
  ...mapConfig,
  recipe: standardRecipe,
  sourceConfigId: "swooper-desert-mountains",
  configHash: "ae4285e43adefe2b90f6ce07e81567042f68de51664fc30adc2445c747e1b47d",
  envelopeHash: "c33b10b8d3b18280d059a95d4d9572899b0daf00ba8b5e80ae018dcb913e8573",
  config: mapConfig.config,
});
