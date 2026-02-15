import { Type, TypedArraySchemas, defineOp } from "@swooper/mapgen-core/authoring";
import { FeaturePlacementSchema } from "../../shared/placement-schema.js";

const PlanIceContract = defineOp({
  kind: "plan",
  id: "ecology/features/plan-ice",
  input: Type.Object({
    width: Type.Integer({ minimum: 1 }),
    height: Type.Integer({ minimum: 1 }),
    seed: Type.Integer(),
    score01: TypedArraySchemas.f32({ description: "Ice suitability score per tile (0..1)." }),
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
    default: Type.Object({}),
    continentality: Type.Object({}),
  },
});

export default PlanIceContract;
