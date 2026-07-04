import { FEATURE_PLACEMENT_KEYS, type PlotEffectKey } from "@mapgen/domain/ecology";
import {
  defineArtifact,
  type Static,
  Type,
  TypedArraySchemas,
} from "@swooper/mapgen-core/authoring/contracts";

export const BiomeClassificationArtifactSchema = Type.Object({
  width: Type.Integer({ minimum: 1 }),
  height: Type.Integer({ minimum: 1 }),
  biomeIndex: TypedArraySchemas.u8({ description: "Biome symbol index per tile." }),
  vegetationDensity: TypedArraySchemas.f32({ description: "Vegetation density per tile (0..1)." }),
  effectiveMoisture: TypedArraySchemas.f32({ description: "Effective moisture per tile." }),
  surfaceTemperature: TypedArraySchemas.f32({ description: "Surface temperature per tile (C)." }),
  aridityIndex: TypedArraySchemas.f32({ description: "Aridity index per tile (0..1)." }),
  freezeIndex: TypedArraySchemas.f32({ description: "Freeze index per tile (0..1)." }),
  groundIce01: TypedArraySchemas.f32({ description: "Ground ice per tile (0..1)." }),
  permafrost01: TypedArraySchemas.f32({ description: "Permafrost per tile (0..1)." }),
  meltPotential01: TypedArraySchemas.f32({ description: "Melt potential per tile (0..1)." }),
  treeLine01: TypedArraySchemas.f32({ description: "Tree line suitability per tile (0..1)." }),
});

export type BiomeClassificationArtifact = Static<typeof BiomeClassificationArtifactSchema>;

export const Schema = BiomeClassificationArtifactSchema;

export const artifact = defineArtifact({
  name: "biomeClassification",
  id: "artifact:ecology.biomeClassification",
  schema: Schema,
});
