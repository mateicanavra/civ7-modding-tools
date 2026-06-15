import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import { FeaturePlacementSchema } from "../../shared/placement-schema.js";

const PlanWetlandsContract = defineOp({
  kind: "plan",
  id: "ecology/features/plan-wetlands",
  input: Type.Object({
    width: Type.Integer({ minimum: 1 }),
    height: Type.Integer({ minimum: 1 }),
    seed: Type.Integer({ minimum: 0 }),

    scoreMarsh01: TypedArraySchemas.f32({
      description: "Marsh suitability score per tile (0..1).",
    }),
    scoreTundraBog01: TypedArraySchemas.f32({
      description: "Tundra bog suitability score per tile (0..1).",
    }),
    scoreMangrove01: TypedArraySchemas.f32({
      description: "Mangrove suitability score per tile (0..1).",
    }),
    scoreOasis01: TypedArraySchemas.f32({
      description: "Oasis suitability score per tile (0..1).",
    }),
    scoreWateringHole01: TypedArraySchemas.f32({
      description: "Watering hole suitability score per tile (0..1).",
    }),

    flatLandMask: TypedArraySchemas.u8({
      description:
        "1 = land tile that will remain flat after terrain projection; 0 = water, hill, mountain, volcano, or lake.",
    }),
    biomeIndex: TypedArraySchemas.u8({
      description:
        "Internal biome classification index used to keep wetland intents on engine-compatible biome bindings.",
    }),

    featureIndex: TypedArraySchemas.u16({
      description: "0 = unoccupied, otherwise 1 + FEATURE_KEY_INDEX",
    }),
    reserved: TypedArraySchemas.u8({
      description: "0 = tile can be claimed, 1 = permanently blocked",
    }),
  }),
  output: Type.Object({
    placements: Type.Array(FeaturePlacementSchema),
  }),
  strategies: {
    default: Type.Object({
      minConfidence01: Type.Number({
        minimum: 0,
        maximum: 1,
        default: 0.24,
        description:
          "Family-local admission threshold: wetland scores below this remain substrate signal, not placement intent.",
      }),
    }),
  },
});

export default PlanWetlandsContract;
