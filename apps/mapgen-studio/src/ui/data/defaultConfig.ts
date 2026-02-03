// ============================================================================
// DEFAULT PIPELINE CONFIGURATION
// ============================================================================
// This is the default configuration for the map generation pipeline.
//
// Backend Engineers: This structure should match your pipeline schema.
// Each stage contains knobs (high-level presets) and advanced step configs.
// ============================================================================

import type { PipelineConfig } from '../types';

export const defaultConfig: PipelineConfig = {
  // ============================================================================
  // Foundation Stage
  // Creates the base mesh, crust, and tectonic structure
  // ============================================================================
  foundation: {
    knobs: {
      plateCount: 'normal',
      plateActivity: 'normal'
    },
    advanced: {
      mesh: {
        computeMesh: {
          strategy: 'default',
          config: {
            plateCount: 28,
            cellsPerPlate: 14,
            relaxationSteps: 4,
            referenceArea: 6996,
            plateScalePower: 0.65
          }
        }
      },
      crust: {
        computeCrust: {
          strategy: 'default',
          config: {
            continentalRatio: 0.29
          }
        }
      },
      tectonics: {
        computeTectonicSegments: {
          strategy: 'default',
          config: {
            intensityScale: 180,
            regimeMinIntensity: 4
          }
        },
        computeTectonicHistory: {
          strategy: 'default',
          config: {
            eraWeights: [0.35, 0.35, 0.3],
            driftStepsByEra: [2, 1, 0],
            beltInfluenceDistance: 8,
            beltDecay: 0.55,
            activityThreshold: 1
          }
        }
      },
      projection: {
        computePlates: {
          strategy: 'default',
          config: {
            boundaryInfluenceDistance: 12,
            boundaryDecay: 0.5,
            movementScale: 65,
            rotationScale: 80
          }
        }
      }
    }
  },

  // ============================================================================
  // Morphology Pre Stage
  // Initial landmass formation and sea level
  // ============================================================================
  'morphology-pre': {
    knobs: {
      seaLevel: 'earthlike'
    },
    advanced: {
      'landmass-plates': {
        substrate: {
          strategy: 'default',
          config: {
            continentalBaseErodibility: 0.63,
            oceanicBaseErodibility: 0.53,
            continentalBaseSediment: 0.19,
            oceanicBaseSediment: 0.29
          }
        },
        seaLevel: {
          strategy: 'default',
          config: {
            targetWaterPercent: 63,
            targetScalar: 1,
            variance: 1.5
          }
        }
      }
    }
  },

  // ============================================================================
  // Morphology Mid Stage
  // Erosion and geomorphology
  // ============================================================================
  'morphology-mid': {
    knobs: {
      erosion: 'normal',
      coastRuggedness: 'normal'
    },
    advanced: {
      geomorphology: {
        geomorphology: {
          strategy: 'default',
          config: {
            geomorphology: {
              fluvial: { rate: 0.26, m: 0.5, n: 1 },
              diffusion: { rate: 0.23, talus: 0.5 },
              deposition: { rate: 0.11 },
              eras: 3
            },
            worldAge: 'mature'
          }
        }
      }
    }
  },

  // ============================================================================
  // Hydrology & Climate Baseline Stage
  // Climate simulation and water systems
  // ============================================================================
  'hydrology-climate-baseline': {
    knobs: {
      dryness: 'mix',
      temperature: 'hot',
      seasonality: 'high',
      oceanCoupling: 'earthlike'
    },
    'climate-baseline': {
      seasonality: {
        axialTiltDeg: 29.44,
        modeCount: 4
      },
      computeAtmosphericCirculation: {
        strategy: 'earthlike',
        config: {
          maxSpeed: 110,
          zonalStrength: 90,
          meridionalStrength: 30,
          geostrophicStrength: 70,
          pressureNoiseScale: 18,
          pressureNoiseAmp: 55,
          waveStrength: 45,
          landHeatStrength: 20,
          mountainDeflectStrength: 18,
          smoothIters: 4
        }
      },
      computeOceanGeometry: {
        strategy: 'default',
        config: {
          maxCoastDistance: 64,
          maxCoastVectorDistance: 10
        }
      },
      computeOceanSurfaceCurrents: {
        strategy: 'earthlike',
        config: {
          maxSpeed: 80,
          windStrength: 0.55,
          ekmanStrength: 0.35,
          gyreStrength: 26,
          coastStrength: 32,
          smoothIters: 3,
          projectionIters: 8
        }
      },
      computeOceanThermalState: {
        strategy: 'default',
        config: {
          equatorTempC: 28,
          poleTempC: -2,
          advectIters: 28,
          diffusion: 0.18,
          secondaryWeightMin: 0.25,
          seaIceThresholdC: -1
        }
      },
      transportMoisture: {
        strategy: 'vector',
        config: {
          iterations: 42,
          advection: 0.7,
          retention: 0.93,
          secondaryWeightMin: 0.2
        }
      },
      computePrecipitation: {
        strategy: 'vector',
        config: {
          rainfallScale: 180,
          humidityExponent: 1,
          noiseAmplitude: 6,
          noiseScale: 0.12,
          waterGradient: {
            radius: 5,
            perRingBonus: 4,
            lowlandBonus: 2,
            lowlandElevationMax: 150
          },
          upliftStrength: 22,
          convergenceStrength: 16
        }
      }
    }
  },

  // ============================================================================
  // Ecology Stage
  // Biome classification
  // ============================================================================
  ecology: {
    knobs: {},
    biomes: {
      classify: {
        strategy: 'default',
        config: {
          temperature: {
            equator: 34,
            pole: -22,
            lapseRate: 7.5
          }
        }
      }
    }
  }
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
