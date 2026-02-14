import { Type, TypedArraySchemas, defineOp } from "@swooper/mapgen-core/authoring";

import { TemperatureSchema } from "./rules/temperature.schema.js";
import { MoistureSchema } from "./rules/moisture.schema.js";
import { AriditySchema } from "./rules/aridity.schema.js";
import { VegetationSchema } from "./rules/vegetation.schema.js";

/** Biome classification parameters for temperature, moisture, aridity, vegetation, and edge refinement. */

const EdgeRefineSchema = Type.Object(
  {
    /**
     * Neighborhood radius (tiles) used for deterministic biome edge smoothing.
     * @default 1
     */
    radius: Type.Optional(
      Type.Integer({
        description: "Neighborhood radius (tiles) used for deterministic biome edge smoothing.",
        default: 1,
        minimum: 1,
        maximum: 5,
      })
    ),
    /**
     * Number of smoothing iterations.
     * @default 1
     */
    iterations: Type.Optional(
      Type.Integer({
        description: "Number of smoothing iterations.",
        default: 1,
        minimum: 1,
        maximum: 4,
      })
    ),
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
    soilType: TypedArraySchemas.u8({ description: "Soil type palette index per tile (from Ecology soils artifact)." }),
    fertility: TypedArraySchemas.f32({ description: "Fertility per tile (0..1) (from Ecology soils artifact)." }),
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
        edgeRefine: Type.Optional(EdgeRefineSchema),
      },
      {
        description:
          "Biome classification parameters for temperature, moisture, aridity, vegetation, and edge refinement.",
      }
    ),
  },
});

export default BiomeClassificationContract;
