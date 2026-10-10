import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import bioclimaticSubstrateDefinition from "./strategies/bioclimatic-substrate/config.js";

/** Normalizes climate and soil evidence into shared energy, water, stress, biomass, and fertility fields used by vegetation scorers. Every implementation shares this admitted input and output boundary. */
const ComputeVegetationSubstrateContract = defineOp({
  kind: "compute",
  id: "ecology/vegetation/compute-substrate",
  input: Type.Object(
    {
      width: Type.Integer({ minimum: 1, description: "Map width in tiles." }),
      height: Type.Integer({ minimum: 1, description: "Map height in tiles." }),
      landMask: TypedArraySchemas.u8({ description: "Land mask per tile (1=land, 0=water)." }),
      effectiveMoisture: TypedArraySchemas.f32({ description: "Effective moisture per tile." }),
      surfaceTemperature: TypedArraySchemas.f32({
        description: "Surface temperature per tile (C).",
      }),
      aridityIndex: TypedArraySchemas.f32({ description: "Aridity index per tile (0..1)." }),
      plantEffectiveMoisture: TypedArraySchemas.f32({ description: "Plant growth moisture, including admitted local water opportunity." }),
      plantWaterStress: TypedArraySchemas.f32({ description: "Plant water limitation (0..1), not climatic dryness habitat." }),
      freezeIndex: TypedArraySchemas.f32({ description: "Freeze index per tile (0..1)." }),
      vegetationDensity: TypedArraySchemas.f32({
        description: "Vegetation density per tile (0..1).",
      }),
      fertility: TypedArraySchemas.f32({ description: "Fertility overlay per tile (0..1)." }),
    },
    { additionalProperties: false }
  ),
  output: Type.Object({
    energy01: TypedArraySchemas.f32({
      description: "Normalized growth energy proxy from surfaceTemperature (0..1).",
    }),
    atmosphericWater01: TypedArraySchemas.f32({
      description: "Normalized atmospheric moisture for climatic habitat bands (0..1).",
    }),
    climaticAridity01: TypedArraySchemas.f32({ description: "Climatic dryness habitat context from atmospheric aridity (0..1)." }),
    plantWater01: TypedArraySchemas.f32({
      description: "Normalized plant growth water opportunity from plantEffectiveMoisture (0..1).",
    }),
    plantWaterStress01: TypedArraySchemas.f32({ description: "Plant water limitation from plantWaterStress (0..1)." }),
    coldStress01: TypedArraySchemas.f32({
      description: "Cold stress proxy from freezeIndex (0..1).",
    }),
    biomass01: TypedArraySchemas.f32({
      description: "Biomass proxy from vegetationDensity (0..1).",
    }),
    fertility01: TypedArraySchemas.f32({ description: "Normalized fertility proxy (0..1)." }),
  }),
  strategies: [bioclimaticSubstrateDefinition],
});

export default ComputeVegetationSubstrateContract;
