import { Type, defineOp, TypedArraySchemas } from "@swooper/mapgen-core/authoring";

import { FeaturesConfigSchema, FeaturesDensityConfigSchema } from "../../config.js";

const PlacementSchema = Type.Object({
  x: Type.Integer({ minimum: 0 }),
  y: Type.Integer({ minimum: 0 }),
  feature: Type.Literal("FEATURE_TAIGA"),
});

const PlanVegetationEmbellishmentsTaigaDensityContract = defineOp({
  kind: "plan",
  id: "ecology/features/vegetation-embellishments/taiga-density",
  input: Type.Object({
    width: Type.Integer({ minimum: 1 }),
    height: Type.Integer({ minimum: 1 }),
    seed: Type.Number({ description: "Deterministic seed for vegetation embellishments." }),
    landMask: TypedArraySchemas.u8({ description: "Land mask per tile (1=land, 0=water)." }),
    terrainType: TypedArraySchemas.u8({ description: "Terrain type id per tile." }),
    featureKeyField: TypedArraySchemas.i16({
      description: "Existing feature key indices per tile (-1 for empty).",
    }),
    biomeIndex: TypedArraySchemas.u8({ description: "Biome symbol indices per tile." }),
    rainfall: TypedArraySchemas.u8({ description: "Rainfall per tile (0..255)." }),
    vegetationDensity: TypedArraySchemas.f32({ description: "Vegetation density per tile (0..1)." }),
    elevation: TypedArraySchemas.i16({ description: "Elevation per tile (meters)." }),
    latitude: TypedArraySchemas.f32({ description: "Latitude per tile (degrees)." }),
    volcanicMask: TypedArraySchemas.u8({ description: "Volcanic hotspot mask per tile." }),
    navigableRiverTerrain: Type.Integer({ description: "Terrain id for navigable rivers." }),
  }),
  output: Type.Object({
    placements: Type.Array(PlacementSchema),
  }),
  strategies: {
    default: Type.Object({
      story: Type.Object({ features: FeaturesConfigSchema }),
      featuresDensity: FeaturesDensityConfigSchema,
    }),
  },
});

export default PlanVegetationEmbellishmentsTaigaDensityContract;

