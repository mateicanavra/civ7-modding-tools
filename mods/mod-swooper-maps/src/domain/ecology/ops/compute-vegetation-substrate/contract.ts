import { Type, TypedArraySchemas, defineOp } from "@swooper/mapgen-core/authoring";

const VegetationSubstrateConfigSchema = Type.Object(
  {
    moistureNormalization: Type.Number({
      description:
        "Effective moisture value mapped to water01=1.0. Default aligns with humid threshold + padding in biome classification.",
      default: 230,
      minimum: 1,
    }),
    temperatureMinC: Type.Number({
      description: "Surface temperature (C) mapped to energy01=0.0.",
      default: -20,
    }),
    temperatureMaxC: Type.Number({
      description: "Surface temperature (C) mapped to energy01=1.0.",
      default: 40,
    }),
  },
  {
    additionalProperties: false,
    description:
      "Normalization constants for vegetation substrate fields. Keep these stable and minimal; upstream physics should drive realism.",
  }
);

/**
 * Computes normalized vegetation planning fields (0..1) used by per-feature score ops.
 *
 * Ops are compute-only: no picking, no routing, no ordering assumptions.
 */
const ComputeVegetationSubstrateContract = defineOp({
  kind: "compute",
  id: "ecology/vegetation/compute-substrate",
  input: Type.Object(
    {
      width: Type.Integer({ minimum: 1, description: "Map width in tiles." }),
      height: Type.Integer({ minimum: 1, description: "Map height in tiles." }),
      landMask: TypedArraySchemas.u8({ description: "Land mask per tile (1=land, 0=water)." }),
      effectiveMoisture: TypedArraySchemas.f32({ description: "Effective moisture per tile." }),
      surfaceTemperature: TypedArraySchemas.f32({ description: "Surface temperature per tile (C)." }),
      aridityIndex: TypedArraySchemas.f32({ description: "Aridity index per tile (0..1)." }),
      freezeIndex: TypedArraySchemas.f32({ description: "Freeze index per tile (0..1)." }),
      vegetationDensity: TypedArraySchemas.f32({ description: "Vegetation density per tile (0..1)." }),
      fertility: TypedArraySchemas.f32({ description: "Fertility overlay per tile (0..1)." }),
    },
    { additionalProperties: false }
  ),
  output: Type.Object({
    energy01: TypedArraySchemas.f32({
      description: "Normalized growth energy proxy from surfaceTemperature (0..1).",
    }),
    water01: TypedArraySchemas.f32({
      description: "Normalized water availability proxy from effectiveMoisture (0..1).",
    }),
    waterStress01: TypedArraySchemas.f32({ description: "Water stress proxy from aridityIndex (0..1)." }),
    coldStress01: TypedArraySchemas.f32({ description: "Cold stress proxy from freezeIndex (0..1)." }),
    biomass01: TypedArraySchemas.f32({ description: "Biomass proxy from vegetationDensity (0..1)." }),
    fertility01: TypedArraySchemas.f32({ description: "Normalized fertility proxy (0..1)." }),
  }),
  strategies: {
    default: VegetationSubstrateConfigSchema,
  },
});

export default ComputeVegetationSubstrateContract;

