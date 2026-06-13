import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring";
import { FeaturePlacementSchema } from "../../shared/placement-schema.js";

const PlanReefsContract = defineOp({
  kind: "plan",
  id: "ecology/features/plan-reefs",
  input: Type.Object({
    width: Type.Integer({ minimum: 1 }),
    height: Type.Integer({ minimum: 1 }),
    seed: Type.Integer({ minimum: 0 }),
    scoreReef01: TypedArraySchemas.f32({ description: "Reef suitability score per tile (0..1)." }),
    scoreColdReef01: TypedArraySchemas.f32({
      description: "Cold reef suitability score per tile (0..1).",
    }),
    scoreAtoll01: TypedArraySchemas.f32({
      description: "Atoll suitability score per tile (0..1).",
    }),
    scoreLotus01: TypedArraySchemas.f32({
      description: "Lotus suitability score per tile (0..1).",
    }),
    lakeMask: TypedArraySchemas.u8({
      description:
        "Hydrology lake mask per tile (1=lake, 0=non-lake); gates lake-only Lotus placement.",
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
        default: 0.55,
        description:
          "Family-local admission threshold: reef-family scores below this remain ocean habitat signal, not placement intent.",
      }),
      stride: Type.Integer({
        minimum: 1,
        maximum: 12,
        default: 1,
        description:
          "Deterministic spacing stride for sparse reef-family intent; 1 keeps every admitted habitat tile.",
      }),
    }),
    "shipping-lanes": Type.Object({
      minConfidence01: Type.Number({
        minimum: 0,
        maximum: 1,
        default: 0.55,
        description:
          "Family-local admission threshold before the shipping-lane stripe policy is applied.",
      }),
      stride: Type.Integer({
        minimum: 1,
        maximum: 12,
        default: 5,
        description: "Deterministic lane spacing stride for oceanic reef-family intent.",
      }),
    }),
  },
});

export default PlanReefsContract;
