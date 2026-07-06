import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import { FeaturePlacementSchema } from "../../model/schemas/index.js";

const PlanIceContract = defineOp({
  kind: "plan",
  id: "ecology/features/plan-ice",
  input: Type.Object({
    width: Type.Integer({ minimum: 1 }),
    height: Type.Integer({ minimum: 1 }),
    seed: Type.Integer(),
    score01: TypedArraySchemas.f32({ description: "Ice suitability score per tile (0..1)." }),
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
  strategies: {
    default: Type.Object({
      minConfidence01: Type.Number({
        minimum: 0,
        maximum: 1,
        default: 0.5,
        description:
          "Family-local admission threshold: freeze scores below this remain coldness signal, not ice intent.",
      }),
    }),
    continentality: Type.Object({
      minConfidence01: Type.Number({
        minimum: 0,
        maximum: 1,
        default: 0.5,
        description: "Family-local admission threshold for the continentality-aware ice planner.",
      }),
    }),
  },
});

export default PlanIceContract;
