import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import { FeaturePlacementSchema } from "../../model/schemas/index.js";
import strategies from "./strategies/contract.js";

/** Chooses the strongest forest-family habitat per unoccupied land tile under family-specific confidence floors. Every implementation shares this admitted input and output boundary. */
const PlanVegetationContract = defineOp({
  kind: "plan",
  id: "ecology/features/plan-vegetation",
  input: Type.Object({
    width: Type.Integer({ minimum: 1 }),
    height: Type.Integer({ minimum: 1 }),
    seed: Type.Integer({ minimum: 0 }),

    scoreForest01: TypedArraySchemas.f32({
      description: "Forest suitability score per tile (0..1).",
    }),
    scoreRainforest01: TypedArraySchemas.f32({
      description: "Rainforest suitability score per tile (0..1).",
    }),
    scoreTaiga01: TypedArraySchemas.f32({
      description: "Taiga suitability score per tile (0..1).",
    }),
    scoreSavannaWoodland01: TypedArraySchemas.f32({
      description: "Savanna woodland suitability score per tile (0..1).",
    }),
    scoreSagebrushSteppe01: TypedArraySchemas.f32({
      description: "Sagebrush steppe suitability score per tile (0..1).",
    }),

    landMask: TypedArraySchemas.u8({ description: "1 = land, 0 = water." }),
    flatLandMask: TypedArraySchemas.u8({
      description:
        "1 = land tile that will remain flat after terrain projection; 0 = water, hill, mountain, volcano, or lake.",
    }),
    biomeIndex: TypedArraySchemas.u8({
      description:
        "Internal biome classification index used for broad vegetation habitat admission.",
    }),
    surfaceTemperature: TypedArraySchemas.f32({
      description: "Surface temperature per tile (C) used for broad feature habitat admission.",
    }),
    effectiveMoisture: TypedArraySchemas.f32({
      description: "Effective moisture per tile used for broad feature habitat admission.",
    }),
    aridityIndex: TypedArraySchemas.f32({
      description: "Aridity index per tile (0..1) used for broad feature habitat admission.",
    }),
    vegetationDensity: TypedArraySchemas.f32({
      description: "Vegetation density per tile (0..1) used for broad feature habitat admission.",
    }),

    featureOccupancyMask: TypedArraySchemas.u8({
      description: "0 = unoccupied, nonzero = already claimed by an ecology feature intent.",
    }),
    reserved: TypedArraySchemas.u8({
      description: "0 = tile can be claimed, 1 = permanently blocked",
    }),
  }),
  output: Type.Object({
    placements: Type.Array(FeaturePlacementSchema),
  }),
  strategies,
});

export default PlanVegetationContract;
