import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import strategies from "./strategies/contract.js";

/** Classifies admitted climate and soil fields into biome indices and vegetation density, then smooths only land-biome edges. Every implementation shares this admitted input and output boundary. */
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
  strategies,
});

export default BiomeClassificationContract;
