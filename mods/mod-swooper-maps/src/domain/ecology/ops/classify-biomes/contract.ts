import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

/** Biome classification parameters for temperature, moisture, aridity, vegetation, and edge refinement. */

export const TemperatureSchema = Type.Object(
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
      minimum: -12_000,
      maximum: 12_000,
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
);

export const MoistureSchema = Type.Object(
  {
    thresholds: Type.Tuple(
      [
        Type.Number({
          description: "Arid threshold (effective moisture units).",
          default: 45,
          minimum: 0,
          maximum: 1_000,
        }),
        Type.Number({
          description: "Semi-arid threshold (effective moisture units).",
          default: 90,
          minimum: 0,
          maximum: 1_000,
        }),
        Type.Number({
          description: "Subhumid threshold (effective moisture units).",
          default: 140,
          minimum: 0,
          maximum: 1_000,
        }),
        Type.Number({
          description: "Humid threshold (effective moisture units).",
          default: 190,
          minimum: 0,
          maximum: 1_000,
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
    description: "Effective moisture thresholds (Hydrology effectiveMoisture advisory index).",
  }
);

export const AriditySchema = Type.Object(
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
      maximum: 1_000,
    }),
    petTemperatureWeight: Type.Number({
      description: "PET temperature weight (rainfall units).",
      default: 80,
      minimum: 0,
      maximum: 1_000,
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
      minimum: -1_000,
      maximum: 1_000,
    }),
    normalization: Type.Number({
      description: "Normalization scale for aridity index (rainfall units).",
      default: 120,
      minimum: 1,
      maximum: 10_000,
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
);

export const VegetationSchema = Type.Object(
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
      maximum: 1_000,
    }),
  },
  {
    description: "Vegetation density model knobs (base, moisture weight, normalization).",
  }
);

const EdgeRefineSchema = Type.Object(
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
);

const BiomeClassificationContract = defineOp({
  kind: "compute",
  id: "ecology/biomes/classify",
  input: Type.Object({
    width: Type.Integer({ minimum: 1 }),
    height: Type.Integer({ minimum: 1 }),
    effectiveMoisture: TypedArraySchemas.f32({
      description:
        "Effective moisture advisory index per tile (from Hydrology climate indices; do not re-derive from rainfall/humidity locally).",
    }),
    surfaceTemperatureC: TypedArraySchemas.f32({
      description:
        "Surface temperature proxy (C) per tile (from Hydrology climate indices; do not recompute from latitude).",
    }),
    aridityIndex: TypedArraySchemas.f32({
      description:
        "Aridity index (0..1) per tile (from Hydrology climate indices; do not recompute from rainfall alone).",
    }),
    freezeIndex: TypedArraySchemas.f32({
      description: "Freeze persistence index (0..1) per tile (from Hydrology climate indices).",
    }),
    landMask: TypedArraySchemas.u8({ description: "Land mask per tile (1=land, 0=water)." }),
    soilType: TypedArraySchemas.u8({
      description: "Soil type palette index per tile (from Ecology soils artifact).",
    }),
    fertility: TypedArraySchemas.f32({
      description: "Fertility per tile (0..1) (from Ecology soils artifact).",
    }),
  }),
  output: Type.Object({
    biomeIndex: TypedArraySchemas.u8({ description: "Biome symbol indices per tile." }),
    vegetationDensity: TypedArraySchemas.f32({
      description: "Vegetation density per tile (0..1).",
    }),
    effectiveMoisture: TypedArraySchemas.f32({
      description: "Effective moisture per tile (forwarded from Hydrology climate indices).",
    }),
    surfaceTemperature: TypedArraySchemas.f32({
      description: "Surface temperature per tile (C).",
    }),
    aridityIndex: TypedArraySchemas.f32({ description: "Aridity index per tile (0..1)." }),
    freezeIndex: TypedArraySchemas.f32({ description: "Freeze index per tile (0..1)." }),
  }),
  strategies: {
    default: Type.Object(
      {
        /** Temperature model knobs (degrees C, lapse rate, thresholds). */
        temperature: TemperatureSchema,
        /** Moisture model knobs (thresholds only; no local effective-moisture derivation). */
        moisture: MoistureSchema,
        /** Aridity knobs (used to shift moisture zones + vegetation dryness stress). */
        aridity: AriditySchema,
        /** Vegetation density model knobs (0..1 weights, soil modifiers). */
        vegetation: VegetationSchema,
        /** Deterministic biome edge refinement applied after classification. */
        edgeRefine: EdgeRefineSchema,
      },
      {
        description:
          "Biome classification parameters for temperature, moisture, aridity, vegetation, and edge refinement.",
      }
    ),
  },
});

export default BiomeClassificationContract;
