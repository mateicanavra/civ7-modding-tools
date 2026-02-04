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
    version: 1,
    profiles: {
      resolutionProfile: 'balanced',
      lithosphereProfile: 'maximal-basaltic-lid-v1',
      mantleProfile: 'maximal-potential-v1'
    },
    knobs: {
      plateCount: 28,
      plateActivity: 0.5
    }
  },

  // ============================================================================
  // Morphology Coasts Stage
  // Landmass formation + coastline shaping
  // ============================================================================
  'morphology-coasts': {
    knobs: {
      seaLevel: 'earthlike',
      coastRuggedness: 'normal'
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
  // Morphology Routing Stage
  // Drainage routing truth
  // ============================================================================
  'morphology-routing': {
    advanced: {
      routing: {
        routing: {
          strategy: 'default',
          config: {}
        }
      }
    }
  },

  // Morphology Erosion Stage
  // Erosion and geomorphology
  // ============================================================================
  'morphology-erosion': {
    knobs: {
      erosion: 'normal'
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
  // Morphology Features Stage
  // Islands, volcanism, landmass decomposition
  // ============================================================================
  'morphology-features': {
    knobs: {
      volcanism: 'normal'
    }
  },

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
