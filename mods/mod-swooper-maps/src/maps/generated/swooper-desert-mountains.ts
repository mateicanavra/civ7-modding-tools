/**
 * Generated from ../configs/swooper-desert-mountains.config.json.
 * Do not edit by hand; re-run `nx run mod-swooper-maps:gen:maps`.
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
      "mesh": {
        "computeMesh": {
          "strategy": "jittered-delaunay",
          "config": {
            "plateCount": 24,
            "cellsPerPlate": 4,
            "relaxationSteps": 2
          }
        }
      },
      "mantle-potential": {
        "computeMantlePotential": {
          "strategy": "poisson-source-field",
          "config": {
            "plumeCount": 6,
            "downwellingCount": 6,
            "plumeRadius": 0.18,
            "downwellingRadius": 0.18,
            "plumeAmplitude": 1,
            "downwellingAmplitude": -1,
            "smoothingIterations": 2,
            "smoothingAlpha": 0.35,
            "minSeparationScale": 0.85
          }
        }
      },
      "mantle-forcing": {
        "computeMantleForcing": {
          "strategy": "potential-gradient",
          "config": {
            "velocityScale": 1,
            "rotationScale": 0.2,
            "stressNorm": 1,
            "curvatureWeight": 0.35,
            "upwellingThreshold": 0.35,
            "downwellingThreshold": 0.35
          }
        }
      }
    },
    "foundation-lithosphere": {
      "crust": {
        "computeCrust": {
          "strategy": "basaltic-lid",
          "config": {
            "basalticThickness01": 0.25,
            "yieldStrength01": 0.55,
            "mantleCoupling01": 0.6,
            "riftWeakening01": 0.35
          }
        }
      },
      "plate-graph": {
        "computePlateGraph": {
          "strategy": "resistance-weighted-voronoi",
          "config": {
            "plateCount": 24,
            "polarCaps": {
              "capFraction": 0.1,
              "microplateBandFraction": 0.2,
              "microplatesPerPole": 0,
              "microplatesMinPlateCount": 14,
              "microplateMinAreaCells": 8
            }
          }
        }
      }
    },
    "foundation-tectonics": {
      "knobs": {
        "plateActivity": 0.5
      },
      "tectonics": {
        "computePlateMotion": {
          "strategy": "rigid-body-fit",
          "config": {
            "omegaFactor": 1,
            "plateRadiusMin": 1,
            "residualNormScale": 1,
            "p90NormScale": 1,
            "histogramBins": 32,
            "smoothingSteps": 0
          }
        },
        "computeTectonicSegments": {
          "strategy": "relative-motion-regimes",
          "config": {
            "intensityScale": 900,
            "regimeMinIntensity": 4
          }
        },
        "computeEraPlateMembership": {
          "strategy": "backward-drift",
          "config": {
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
          }
        },
        "computeEraTectonicFields": {
          "strategy": "event-distance-decay",
          "config": {
            "beltInfluenceDistance": 8,
            "beltDecay": 0.55,
            "orogenyActivityGain": 1
          }
        },
        "computeTectonicHistoryRollups": {
          "strategy": "cumulative-era-rollup",
          "config": {
            "activityThreshold": 1
          }
        },
        "computeSegmentEvents": {
          "strategy": "boundary-derived",
          "config": {}
        },
        "computeHotspotEvents": {
          "strategy": "upwelling-hotspots",
          "config": {}
        },
        "computeTectonicsCurrent": {
          "strategy": "newest-era-composite",
          "config": {}
        },
        "computeTracerAdvection": {
          "strategy": "boundary-drift",
          "config": {}
        },
        "computeTectonicProvenance": {
          "strategy": "advected-lineage",
          "config": {}
        }
      }
    },
    "morphology-coasts": {
      "knobs": {
        "seaLevel": "earthlike"
      },
      "landmass-plates": {
        "beltDrivers": {
          "strategy": "history-derived",
          "config": {}
        },
        "substrate": {
          "strategy": "crust-boundary-material",
          "config": {
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
          }
        },
        "baseTopography": {
          "strategy": "tectonic-relief",
          "config": {
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
          }
        },
        "sculptContinentalMargin": {
          "strategy": "crust-break-profile",
          "config": {
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
        "seaLevel": {
          "strategy": "hypsometric-target",
          "config": {
            "targetWaterPercent": 48,
            "targetScalar": 1,
            "variance": 0,
            "boundaryShareTarget": 0.22,
            "continentalFraction": 0.3
          }
        },
        "landmask": {
          "strategy": "tectonic-potential",
          "config": {
            "continentPotentialGrain": 8,
            "continentPotentialBlurSteps": 3,
            "keepLandComponentFraction": 0.985,
            "cratonStepsPerEra": 2,
            "cratonNucleationScale": 0.9,
            "cratonDiffusion": 0.25,
            "cratonAdvection": 0.15,
            "cratonHalfSaturation": 0.35,
            "cratonPotentialWeight": 0.12
          }
        }
      },
      "coastline-evidence": {
        "adjacency": {
          "strategy": "wrapped-hex-adjacency",
          "config": {}
        },
        "distanceToCoast": {
          "strategy": "multi-source-hex-bfs",
          "config": {}
        }
      }
    },
    "morphology-routing": {
      "routing": {
        "routing": {
          "strategy": "steepest-descent",
          "config": {}
        }
      }
    },
    "morphology-erosion": {
      "knobs": {
        "erosion": "normal"
      },
      "geomorphology": {
        "geomorphology": {
          "strategy": "stream-power-diffusion",
          "config": {
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
          }
        }
      }
    },
    "morphology-features": {
      "knobs": {
        "orogeny": "normal",
        "volcanism": "normal",
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
      "islands": {
        "islands": {
          "strategy": "plate-aware-volcanic",
          "config": {
            "islands": {
              "fractalThresholdPercent": 96,
              "minDistFromLandRadius": 4,
              "baseIslandDenNearActive": 2,
              "baseIslandDenElse": 2,
              "hotspotSeedDenom": 6,
              "clusterMax": 1,
              "microcontinentChance": 0
            }
          }
        }
      },
      "mountains": {
        "ridges": {
          "strategy": "orogenic-range-growth",
          "config": {
            "tectonicIntensity": 1,
            "driverSignalByteMin": 30,
            "driverExponent": 1,
            "mountainMaxFraction": 0.07,
            "mountainMinFraction": 0,
            "hillMaxFraction": 0.18,
            "mountainSpineFraction": 0.015,
            "mountainRangeSpacingTiles": 0,
            "mountainRangeLengthTiles": 0,
            "mountainRegionRadiusTiles": 0,
            "mountainSpineDilationSteps": 1,
            "mountainShoulderThresholdScale": 0.6,
            "mountainSpineMinDistance": 0,
            "oldBeltMountainScale": 0.4,
            "oldBeltHillScale": 1.1,
            "foothillMaxDistance": 2,
            "foothillMinFraction": 0,
            "foothillMaxFraction": 0,
            "mountainThreshold": 0.58,
            "hillThreshold": 0.32,
            "upliftWeight": 0.35,
            "fractalWeight": 0.15,
            "orogenyCollisionStressWeight": 0.6,
            "orogenyCollisionUpliftWeight": 0.4,
            "orogenyTransformStressWeight": 0.4,
            "orogenyDivergentRiftWeight": 0.55,
            "orogenyDivergentStressWeight": 0.15,
            "fractureBoundaryWeight": 0.7,
            "fractureStressWeight": 0.2,
            "fractureRiftWeight": 0.1,
            "mountainCollisionStressWeight": 0.5,
            "mountainCollisionUpliftWeight": 0.5,
            "mountainSubductionUpliftWeight": 0.25,
            "mountainInteriorUpliftScale": 0.25,
            "mountainFractalScale": 0.3,
            "mountainConvergenceFractalBase": 0.6,
            "mountainConvergenceFractalSpan": 0.4,
            "riftDepth": 0.2,
            "boundaryWeight": 1,
            "boundaryGate": 0.1,
            "boundaryExponent": 1.6,
            "rangeEnvelopeScale": 1,
            "interiorPenaltyWeight": 0,
            "convergenceBonus": 1,
            "transformPenalty": 0.6,
            "riftPenalty": 1,
            "hillBoundaryWeight": 0.35,
            "hillRiftBonus": 0.25,
            "hillFoothillBase": 0.5,
            "hillFoothillFractalGain": 0.5,
            "hillConvergentFoothill": 0.35,
            "hillInteriorFalloff": 0.1,
            "hillUpliftWeight": 0.2,
            "hillFractalScale": 0.8,
            "hillUpliftScale": 0.3,
            "hillRiftBonusScale": 0.5,
            "hillRiftDepthScale": 0.5,
            "roughLandMaxFraction": 0,
            "roughLandFractalFloor": 0.75,
            "roughLandFractalGain": 0.5,
            "roughLandInteriorScale": 1
          }
        },
        "foothills": {
          "strategy": "mountain-proximity",
          "config": {
            "tectonicIntensity": 1,
            "driverSignalByteMin": 30,
            "driverExponent": 1,
            "mountainMaxFraction": 0.07,
            "mountainMinFraction": 0,
            "hillMaxFraction": 0.18,
            "mountainSpineFraction": 0.015,
            "mountainRangeSpacingTiles": 0,
            "mountainRangeLengthTiles": 0,
            "mountainRegionRadiusTiles": 0,
            "mountainSpineDilationSteps": 1,
            "mountainShoulderThresholdScale": 0.6,
            "mountainSpineMinDistance": 0,
            "oldBeltMountainScale": 0.4,
            "oldBeltHillScale": 1.1,
            "foothillMaxDistance": 2,
            "foothillMinFraction": 0,
            "foothillMaxFraction": 0,
            "mountainThreshold": 0.58,
            "hillThreshold": 0.32,
            "upliftWeight": 0.35,
            "fractalWeight": 0.15,
            "orogenyCollisionStressWeight": 0.6,
            "orogenyCollisionUpliftWeight": 0.4,
            "orogenyTransformStressWeight": 0.4,
            "orogenyDivergentRiftWeight": 0.55,
            "orogenyDivergentStressWeight": 0.15,
            "fractureBoundaryWeight": 0.7,
            "fractureStressWeight": 0.2,
            "fractureRiftWeight": 0.1,
            "mountainCollisionStressWeight": 0.5,
            "mountainCollisionUpliftWeight": 0.5,
            "mountainSubductionUpliftWeight": 0.25,
            "mountainInteriorUpliftScale": 0.25,
            "mountainFractalScale": 0.3,
            "mountainConvergenceFractalBase": 0.6,
            "mountainConvergenceFractalSpan": 0.4,
            "riftDepth": 0.2,
            "boundaryWeight": 1,
            "boundaryGate": 0.1,
            "boundaryExponent": 1.6,
            "rangeEnvelopeScale": 1,
            "interiorPenaltyWeight": 0,
            "convergenceBonus": 1,
            "transformPenalty": 0.6,
            "riftPenalty": 1,
            "hillBoundaryWeight": 0.35,
            "hillRiftBonus": 0.25,
            "hillFoothillBase": 0.5,
            "hillFoothillFractalGain": 0.5,
            "hillConvergentFoothill": 0.35,
            "hillInteriorFalloff": 0.1,
            "hillUpliftWeight": 0.2,
            "hillFractalScale": 0.8,
            "hillUpliftScale": 0.3,
            "hillRiftBonusScale": 0.5,
            "hillRiftDepthScale": 0.5,
            "roughLandMaxFraction": 0,
            "roughLandFractalFloor": 0.75,
            "roughLandFractalGain": 0.5,
            "roughLandInteriorScale": 1
          }
        },
        "roughLands": {
          "strategy": "relief-substrate-clusters",
          "config": {
            "tectonicIntensity": 1,
            "driverSignalByteMin": 30,
            "driverExponent": 1,
            "mountainMaxFraction": 0.07,
            "mountainMinFraction": 0,
            "hillMaxFraction": 0.18,
            "mountainSpineFraction": 0.015,
            "mountainRangeSpacingTiles": 0,
            "mountainRangeLengthTiles": 0,
            "mountainRegionRadiusTiles": 0,
            "mountainSpineDilationSteps": 1,
            "mountainShoulderThresholdScale": 0.6,
            "mountainSpineMinDistance": 0,
            "oldBeltMountainScale": 0.4,
            "oldBeltHillScale": 1.1,
            "foothillMaxDistance": 2,
            "foothillMinFraction": 0,
            "foothillMaxFraction": 0,
            "mountainThreshold": 0.58,
            "hillThreshold": 0.32,
            "upliftWeight": 0.35,
            "fractalWeight": 0.15,
            "orogenyCollisionStressWeight": 0.6,
            "orogenyCollisionUpliftWeight": 0.4,
            "orogenyTransformStressWeight": 0.4,
            "orogenyDivergentRiftWeight": 0.55,
            "orogenyDivergentStressWeight": 0.15,
            "fractureBoundaryWeight": 0.7,
            "fractureStressWeight": 0.2,
            "fractureRiftWeight": 0.1,
            "mountainCollisionStressWeight": 0.5,
            "mountainCollisionUpliftWeight": 0.5,
            "mountainSubductionUpliftWeight": 0.25,
            "mountainInteriorUpliftScale": 0.25,
            "mountainFractalScale": 0.3,
            "mountainConvergenceFractalBase": 0.6,
            "mountainConvergenceFractalSpan": 0.4,
            "riftDepth": 0.2,
            "boundaryWeight": 1,
            "boundaryGate": 0.1,
            "boundaryExponent": 1.6,
            "rangeEnvelopeScale": 1,
            "interiorPenaltyWeight": 0,
            "convergenceBonus": 1,
            "transformPenalty": 0.6,
            "riftPenalty": 1,
            "hillBoundaryWeight": 0.35,
            "hillRiftBonus": 0.25,
            "hillFoothillBase": 0.5,
            "hillFoothillFractalGain": 0.5,
            "hillConvergentFoothill": 0.35,
            "hillInteriorFalloff": 0.1,
            "hillUpliftWeight": 0.2,
            "hillFractalScale": 0.8,
            "hillUpliftScale": 0.3,
            "hillRiftBonusScale": 0.5,
            "hillRiftDepthScale": 0.5,
            "roughLandMaxFraction": 0,
            "roughLandFractalFloor": 0.75,
            "roughLandFractalGain": 0.5,
            "roughLandInteriorScale": 1
          }
        }
      },
      "volcanoes": {
        "volcanoes": {
          "strategy": "plate-hotspot-ranking",
          "config": {
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
          }
        }
      },
      "landmasses": {
        "landmasses": {
          "strategy": "wrapped-hex-components",
          "config": {}
        }
      }
    },
    "morphology-shelf": {
      "knobs": {
        "shelfWidth": "normal"
      },
      "compute-shelf": {
        "shelfMask": {
          "strategy": "physical-break-connectivity",
          "config": {
            "activeClosenessThreshold": 0.45,
            "breakGradient": 8,
            "breakGradientScale": 1
          }
        },
        "coastalAdjacency": {
          "strategy": "wrapped-hex-adjacency",
          "config": {}
        },
        "distanceToCoast": {
          "strategy": "multi-source-hex-bfs",
          "config": {}
        }
      }
    },
    "hydrology-climate-baseline": {
      "knobs": {
        "dryness": "dry",
        "temperature": "temperate",
        "seasonality": "normal",
        "oceanCoupling": "earthlike"
      },
      "climate-baseline": {
        "seasonality": {
          "modeCount": 2,
          "axialTiltDeg": 12
        },
        "computeRadiativeForcing": {
          "strategy": "latitude-insolation",
          "config": {
            "equatorInsolation": 1,
            "poleInsolation": 0.25,
            "latitudeExponent": 1.2
          }
        },
        "computeThermalState": {
          "strategy": "insolation-lapse-rate",
          "config": {
            "baseTemperatureC": 11.5,
            "insolationScaleC": 57,
            "lapseRateCPerM": -0.0065,
            "landCoolingC": 2,
            "minC": -40,
            "maxC": 50
          }
        },
        "computeAtmosphericCirculation": {
          "strategy": "geostrophic-proxy",
          "config": {
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
          }
        },
        "computeOceanSurfaceCurrents": {
          "strategy": "wind-gyre-projection",
          "config": {
            "maxSpeed": 80,
            "windStrength": 0.55,
            "ekmanStrength": 0.35,
            "gyreStrength": 26,
            "coastStrength": 32,
            "smoothIters": 3,
            "projectionIters": 8
          }
        },
        "computeOceanGeometry": {
          "strategy": "connected-basins",
          "config": {
            "maxCoastDistance": 64,
            "maxCoastVectorDistance": 10
          }
        },
        "computeOceanThermalState": {
          "strategy": "latitude-current-advection",
          "config": {
            "equatorTempC": 28,
            "poleTempC": -2,
            "advectIters": 28,
            "diffusion": 0.18,
            "secondaryWeightMin": 0.25,
            "seaIceThresholdC": -1
          }
        },
        "computeEvaporationSources": {
          "strategy": "thermal-surface",
          "config": {
            "oceanStrength": 0.85,
            "landStrength": 0.17,
            "minTempC": -10,
            "maxTempC": 30
          }
        },
        "transportMoisture": {
          "strategy": "vector-advection",
          "config": {
            "iterations": 22,
            "advection": 0.7,
            "retention": 0.93,
            "secondaryWeightMin": 0.2
          }
        },
        "computePrecipitation": {
          "strategy": "vector",
          "config": {
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
          }
        }
      }
    },
    "hydrology-hydrography": {
      "knobs": {
        "riverDensity": "normal",
        "lakeiness": "normal"
      },
      "rivers": {
        "drainageRouting": {
          "strategy": "priority-flood",
          "config": {
            "allowExternalEdgeOutlets": false
          }
        },
        "accumulateDischarge": {
          "strategy": "topological-runoff",
          "config": {
            "runoffScale": 1,
            "infiltrationFraction": 0.15,
            "humidityDampening": 0.25,
            "minRunoff": 0
          }
        },
        "projectRiverNetwork": {
          "strategy": "discharge-percentiles",
          "config": {
            "minorPercentile": 0.91,
            "majorPercentile": 0.98,
            "minMinorDischarge": 0,
            "minMajorDischarge": 0
          }
        }
      },
      "lakes": {
        "planLakes": {
          "strategy": "sink-discharge-budget",
          "config": {
            "maxUpstreamSteps": 1,
            "sinkDischargePercentileMin": 0.94,
            "maxLakeLandFraction": 0.003
          }
        },
        "classifyRiverNetwork": {
          "strategy": "hydrographic-classification",
          "config": {
            "highOrderConfluenceUpstreamAreaMin": 64
          }
        }
      }
    },
    "hydrology-climate-refine": {
      "knobs": {
        "dryness": "dry",
        "temperature": "temperate",
        "cryosphere": "on"
      },
      "climate-refine": {
        "computePrecipitation": {
          "strategy": "refine",
          "config": {
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
          }
        },
        "computeRadiativeForcing": {
          "strategy": "latitude-insolation",
          "config": {
            "equatorInsolation": 1,
            "poleInsolation": 0.25,
            "latitudeExponent": 1.2
          }
        },
        "computeThermalState": {
          "strategy": "insolation-lapse-rate",
          "config": {
            "baseTemperatureC": 11.5,
            "insolationScaleC": 57,
            "lapseRateCPerM": -0.0065,
            "landCoolingC": 2,
            "minC": -40,
            "maxC": 50
          }
        },
        "applyAlbedoFeedback": {
          "strategy": "bounded-snow-ice",
          "config": {
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
          }
        },
        "computeCryosphereState": {
          "strategy": "temperature-thresholds",
          "config": {
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
          }
        },
        "computeLandWaterBudget": {
          "strategy": "pet-aridity",
          "config": {
            "tMinC": 0,
            "tMaxC": 35,
            "petBase": 40,
            "petTemperatureWeight": 140,
            "humidityDampening": 0.45
          }
        },
        "computeClimateDiagnostics": {
          "strategy": "terrain-wind-indices",
          "config": {
            "barrierSteps": 4,
            "barrierElevationM": 500,
            "continentalityMaxDist": 12,
            "convergenceNormalization": 64
          }
        }
      }
    },
    "ecology-pedology": {
      "pedology": {
        "classify": {
          "strategy": "orogeny-boosted",
          "config": {
            "climateWeight": 1.2,
            "reliefWeight": 0.8,
            "sedimentWeight": 1.1,
            "bedrockWeight": 0.6,
            "fertilityCeiling": 0.95
          }
        }
      }
    },
    "ecology-biomes": {
      "biomes": {
        "classify": {
          "strategy": "biophysical-gaussian",
          "config": {
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
        }
      }
    },
    "ecology-features": {
      "score-layers": {
        "vegetationSubstrate": {
          "strategy": "bioclimatic-substrate",
          "config": {
            "moistureNormalization": 380,
            "temperatureMinC": -20,
            "temperatureMaxC": 40
          }
        },
        "featureSubstrate": {
          "strategy": "hydromorphic",
          "config": {
            "nearRiverRadius": 2,
            "isolatedRiverRadius": 1,
            "coastalAdjacencyRadius": 1,
            "lowlandMaxElevationAboveSeaM": 160,
            "intertidalMaxElevationAboveSeaM": 40,
            "floodplainDischargeMin": 0
          }
        },
        "scoreForest": {
          "strategy": "temperate-humid",
          "config": {}
        },
        "scoreRainforest": {
          "strategy": "warm-humid",
          "config": {}
        },
        "scoreTaiga": {
          "strategy": "cold-forest",
          "config": {}
        },
        "scoreSavannaWoodland": {
          "strategy": "warm-seasonal",
          "config": {}
        },
        "scoreSagebrushSteppe": {
          "strategy": "semiarid-open",
          "config": {}
        },
        "scoreWetMarsh": {
          "strategy": "temperate-hydromorphic",
          "config": {
            "waterMin01": 0.55,
            "fertilityMin01": 0.2,
            "aridityMax01": 0.6,
            "tempMinC": -2,
            "tempPeakC": 10,
            "tempMaxC": 24
          }
        },
        "scoreWetTundraBog": {
          "strategy": "cold-hydromorphic",
          "config": {
            "waterMin01": 0.55,
            "fertilityMin01": 0.1,
            "freezeMin01": 0.55,
            "tempColdMaxC": 4,
            "tempWarmMaxC": 14
          }
        },
        "scoreWetMangrove": {
          "strategy": "warm-intertidal",
          "config": {
            "waterMin01": 0.45,
            "fertilityMin01": 0.15,
            "aridityMax01": 0.7,
            "tempWarmStartC": 18,
            "tempWarmEndC": 30
          }
        },
        "scoreWetOasis": {
          "strategy": "warm-arid-waterpoint",
          "config": {
            "dryMin01": 0.6,
            "dryMax01": 0.95,
            "waterMin01": 0.35,
            "tempWarmStartC": 20,
            "tempWarmEndC": 38
          }
        },
        "scoreWetWateringHole": {
          "strategy": "arid-waterpoint",
          "config": {
            "dryMin01": 0.45,
            "dryMax01": 0.85,
            "waterMin01": 0.25,
            "fertilityMin01": 0.1,
            "tempWarmStartC": 12,
            "tempWarmEndC": 32
          }
        },
        "scoreReef": {
          "strategy": "warm-coastal-shelf",
          "config": {
            "tempWarmStartC": 14,
            "tempWarmEndC": 28,
            "shallowDepthM": 0,
            "deepDepthM": 120,
            "maxDistanceToCoast": 3
          }
        },
        "scoreColdReef": {
          "strategy": "cold-shelf",
          "config": {
            "tempColdMaxC": 10,
            "tempWarmMaxC": 20,
            "minDepthM": 8,
            "peakDepthM": 24,
            "maxDepthM": 48,
            "minDistanceToCoast": 1,
            "maxDistanceToCoast": 8
          }
        },
        "scoreReefAtoll": {
          "strategy": "warm-ocean-bank",
          "config": {
            "tempWarmStartC": 18,
            "tempWarmEndC": 30,
            "shallowDepthM": 0,
            "deepDepthM": 100,
            "minDistanceToCoast": 4,
            "maxDistanceToCoast": 8
          }
        },
        "scoreReefLotus": {
          "strategy": "warm-shallow-lake",
          "config": {
            "tempWarmStartC": 16,
            "tempWarmEndC": 32,
            "shallowDepthM": 0,
            "deepDepthM": 40,
            "maxDistanceToCoast": 2
          }
        },
        "scoreIce": {
          "strategy": "thermal-elevation",
          "config": {
            "seaTempColdC": -10,
            "seaTempWarmC": -2,
            "alpineElevationMinM": 2200,
            "alpineElevationMaxM": 3400,
            "alpineFreezeMin01": 0.55
          }
        },
        "scoreFloodplains": {
          "strategy": "alluvial-relief",
          "config": {}
        }
      },
      "plan-floodplains": {
        "planFloodplains": {
          "strategy": "highest-confidence",
          "config": {
            "minConfidence01": 0.5
          }
        }
      },
      "plan-ice": {
        "planIce": {
          "strategy": "score-threshold",
          "config": {
            "minConfidence01": 0.55
          }
        }
      },
      "plan-reefs": {
        "planReefs": {
          "strategy": "habitat",
          "config": {
            "minConfidence01": 0.62,
            "stride": 3
          }
        }
      },
      "plan-wetlands": {
        "planWetlands": {
          "strategy": "habitat-confidence",
          "config": {
            "minConfidence01": 0.32
          }
        }
      },
      "plan-vegetation": {
        "planVegetation": {
          "strategy": "habitat-confidence",
          "config": {
            "forestMinConfidence01": 0.22,
            "rainforestMinConfidence01": 0.38,
            "taigaMinConfidence01": 0.12,
            "savannaWoodlandMinConfidence01": 0.1,
            "sagebrushSteppeMinConfidence01": 0.04
          }
        }
      },
      "plan-plot-effects": {
        "scoreSnow": {
          "strategy": "cold-elevation",
          "config": {
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
          }
        },
        "scoreSand": {
          "strategy": "arid-thermal",
          "config": {
            "minAridity": 0.58,
            "minTemperature": 19,
            "maxFreeze": 0.2,
            "maxVegetation": 0.15,
            "maxMoisture": 70,
            "allowedBiomes": [
              "desert",
              "temperateDry"
            ]
          }
        },
        "scoreBurned": {
          "strategy": "arid-thermal",
          "config": {
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
          }
        },
        "scoreJungle": {
          "strategy": "hot-wet-dense",
          "config": {
            "minTemperature": 22,
            "minMoisture": 110,
            "minVegetation": 0.45,
            "allowedBiomes": [
              "tropicalRainforest"
            ]
          }
        },
        "plotEffects": {
          "strategy": "ranked-coverage",
          "config": {
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
          }
        }
      }
    },
    "map-morphology": {},
    "map-hydrology": {},
    "map-elevation": {},
    "map-rivers": {
      "knobs": {
        "navigableRiverDensity": "sparse"
      },
      "plot-rivers": {
        "endpointDischargePercentileMin": 0.97,
        "targetMajorTileFraction": 0.18
      }
    },
    "map-ecology": {
      "features-apply": {
        "apply": {
          "strategy": "strict-single-occupancy",
          "config": {}
        }
      }
    },
    "placement": {
      "plot-landmass-regions": {
        "regions": {
          "strategy": "balanced-hemisphere",
          "config": {}
        }
      },
      "plan-natural-wonders": {
        "naturalWonders": {
          "strategy": "suitability-diversity",
          "config": {
            "minSpacingTiles": 6
          }
        }
      },
      "plan-resource-demands": {
        "habitat": {
          "strategy": "quantile-physical-lanes",
          "config": {}
        },
        "demands": {
          "strategy": "policy-constrained",
          "config": {}
        }
      },
      "select-resource-sites": {
        "selectSites": {
          "strategy": "blue-noise-rotation",
          "config": {
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
          }
        }
      },
      "assign-starts": {
        "starts": {
          "strategy": "viability-fairness",
          "config": {
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
          }
        }
      },
      "adjust-resources": {
        "support": {
          "strategy": "support-equity",
          "config": {
            "enabled": true,
            "supportFloor": 2,
            "supportRadiusTiles": 4,
            "equityTolerance": 2,
            "strength": 1
          }
        }
      }
    },
    "foundation-orogeny": {
      "crust-evolution": {
        "computeCrustEvolution": {
          "strategy": "tectonic-differentiation",
          "config": {
            "continentalSurvivalMaturity": 0.6,
            "continentalFreeboard": 0.35,
            "hyperextensionBreakupBase": 0.1,
            "thinningThicknessLoss": 0.55,
            "oceanicAbyssalDepth": 0.75
          }
        }
      }
    },
    "foundation-projection": {
      "projection": {
        "computePlates": {
          "strategy": "foundation-model-projection",
          "config": {
            "boundaryInfluenceDistance": 5,
            "boundaryDecay": 0.55,
            "movementScale": 100,
            "rotationScale": 100
          }
        }
      },
      "plate-topology": {
        "computePlateTopology": {
          "strategy": "wrapped-hex-adjacency",
          "config": {}
        }
      }
    }
  }
} as unknown as StandardMapConfigEnvelope;

export default createMap({
  ...mapConfig,
  recipe: standardRecipe,
  sourceConfigId: "swooper-desert-mountains",
  configHash: "18c5d1ecb633ff54ddea5f135a106506f970fa52bf33d42e00c7bf137c8c1b50",
  envelopeHash: "9476fc5c844a4340a997d7ab21f7cfb137604546e637a7965bb209a2fae46550",
  config: mapConfig.config,
});
