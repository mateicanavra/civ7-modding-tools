import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Combines biophysical climate thresholds with deterministic Gaussian edge smoothing while preserving the water sentinel.
 * It changes only authored controls; the shared operation remains the sole input and output authority.
 */
export default defineStrategy({
  id: "biophysical-gaussian",
  config: Type.Object(
    {
      /** Temperature model knobs (degrees C, lapse rate, thresholds). */
      temperature: Type.Object(
        {
          equator: Type.Number({
            description: "Baseline equatorial temperature at sea level (degrees C).",
            default: 28,
            minimum: -100,
            maximum: 100,
          }),
          pole: Type.Number({
            description: "Baseline polar temperature at sea level (degrees C).",
            default: -8,
            minimum: -100,
            maximum: 100,
          }),
          lapseRate: Type.Number({
            description: "Temperature drop per kilometer of elevation (degrees C / km).",
            default: 6.5,
            minimum: 0,
            maximum: 30,
          }),
          seaLevel: Type.Number({
            description: "Elevation reference point for temperature (meters).",
            default: 0,
            minimum: -12000,
            maximum: 12000,
          }),
          bias: Type.Number({
            description: "Global temperature offset after latitude/elevation (degrees C).",
            default: 0,
            minimum: -100,
            maximum: 100,
          }),
          polarCutoff: Type.Number({
            description: "Temperature threshold for polar zone classification (degrees C).",
            default: -5,
            minimum: -100,
            maximum: 100,
          }),
          tundraCutoff: Type.Number({
            description: "Temperature threshold for cold/tundra zone classification (degrees C).",
            default: 2,
            minimum: -100,
            maximum: 100,
          }),
          midLatitude: Type.Number({
            description: "Upper bound for temperate zone classification (degrees C).",
            default: 12,
            minimum: -100,
            maximum: 100,
          }),
          tropicalThreshold: Type.Number({
            description: "Temperature threshold for tropical zone classification (degrees C).",
            default: 24,
            minimum: -100,
            maximum: 100,
          }),
        },
        {
          description: "Temperature model parameters (degrees C, lapse rate, thresholds).",
        }
      ),
      /** Moisture model knobs (thresholds only; no local effective-moisture derivation). */
      moisture: Type.Object(
        {
          thresholds: Type.Tuple(
            [
              Type.Number({
                description: "Arid threshold (effective moisture units).",
                default: 45,
                minimum: 0,
                maximum: 1000,
              }),
              Type.Number({
                description: "Semi-arid threshold (effective moisture units).",
                default: 90,
                minimum: 0,
                maximum: 1000,
              }),
              Type.Number({
                description: "Subhumid threshold (effective moisture units).",
                default: 140,
                minimum: 0,
                maximum: 1000,
              }),
              Type.Number({
                description: "Humid threshold (effective moisture units).",
                default: 190,
                minimum: 0,
                maximum: 1000,
              }),
            ],
            {
              default: [45, 90, 140, 190],
              description:
                "Moisture thresholds in effective moisture units (Hydrology effectiveMoisture advisory index).",
            }
          ),
        },
        {
          description:
            "Effective moisture thresholds (Hydrology effectiveMoisture advisory index).",
        }
      ),
      /** Aridity knobs (used to shift moisture zones + vegetation dryness stress). */
      aridity: Type.Object(
        {
          temperatureMin: Type.Number({
            description: "Minimum temperature for aridity normalization (C).",
            default: 0,
            minimum: -100,
            maximum: 100,
          }),
          temperatureMax: Type.Number({
            description: "Maximum temperature for aridity normalization (C).",
            default: 35,
            minimum: -100,
            maximum: 100,
          }),
          petBase: Type.Number({
            description: "Base PET-like moisture demand (rainfall units).",
            default: 20,
            minimum: 0,
            maximum: 1000,
          }),
          petTemperatureWeight: Type.Number({
            description: "PET temperature weight (rainfall units).",
            default: 80,
            minimum: 0,
            maximum: 1000,
          }),
          humidityDampening: Type.Number({
            description: "Humidity dampening factor (0..1).",
            default: 0.5,
            minimum: 0,
            maximum: 1,
          }),
          rainfallWeight: Type.Number({
            description: "Rainfall weight when subtracting supply from PET (scalar).",
            default: 1,
            minimum: 0,
            maximum: 10,
          }),
          bias: Type.Number({
            description: "Bias applied to aridity raw units (rainfall units).",
            default: 0,
            minimum: -1000,
            maximum: 1000,
          }),
          normalization: Type.Number({
            description: "Normalization scale for aridity index (rainfall units).",
            default: 120,
            minimum: 1,
            maximum: 10000,
          }),
          moistureShiftThresholds: Type.Tuple(
            [
              Type.Number({
                description: "Aridity threshold for first moisture-zone shift (0..1).",
                default: 0.45,
                minimum: 0,
                maximum: 1,
              }),
              Type.Number({
                description: "Aridity threshold for second moisture-zone shift (0..1).",
                default: 0.7,
                minimum: 0,
                maximum: 1,
              }),
            ],
            {
              default: [0.45, 0.7],
              description: "Aridity thresholds that shift moisture zones toward drier classes.",
            }
          ),
          vegetationPenalty: Type.Number({
            description: "Vegetation dryness-stress weight applied from aridity (0..1).",
            default: 0.15,
            minimum: 0,
            maximum: 1,
          }),
        },
        {
          description: "Aridity/PET proxy controls for dry-climate modeling.",
        }
      ),
      /** Vegetation density model knobs (0..1 weights, soil modifiers). */
      vegetation: Type.Object(
        {
          base: Type.Number({
            description:
              "Baseline vegetation density (0..1). Acts as the floor even in marginal climates.",
            default: 0.2,
            minimum: 0,
            maximum: 1,
          }),
          moistureWeight: Type.Number({
            description:
              "Weight applied to effective moisture when computing vegetation density (scalar).",
            default: 0.55,
            minimum: 0,
            maximum: 10,
          }),
          moistureNormalizationPadding: Type.Number({
            description:
              "Padding added to humid threshold when normalizing moisture (effective moisture units).",
            default: 40,
            minimum: 0,
            maximum: 1000,
          }),
        },
        {
          description: "Vegetation density model knobs (base, moisture weight, normalization).",
        }
      ),
      /** Deterministic biome edge refinement applied after classification. */
      edgeRefine: Type.Object(
        {
          /**
           * Neighborhood radius (tiles) used for deterministic biome edge smoothing.
           * @default 1
           */
          radius: Type.Integer({
            description: "Neighborhood radius (tiles) used for deterministic biome edge smoothing.",
            default: 1,
            minimum: 1,
            maximum: 5,
          }),
          /**
           * Number of smoothing iterations.
           * @default 1
           */
          iterations: Type.Integer({
            description: "Number of smoothing iterations.",
            default: 1,
            minimum: 1,
            maximum: 4,
          }),
        },
        {
          description:
            "Deterministic smoothing pass applied to biomeIndex after classification (integrated edge refinement).",
        }
      ),
    },
    {
      description:
        "Biome classification parameters for temperature, moisture, aridity, vegetation, and edge refinement.",
    }
  ),
});
