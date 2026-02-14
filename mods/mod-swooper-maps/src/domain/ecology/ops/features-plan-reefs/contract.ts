import { Type, TypedArraySchemas, defineOp } from "@swooper/mapgen-core/authoring";
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
    scoreAtoll01: TypedArraySchemas.f32({ description: "Atoll suitability score per tile (0..1)." }),
    scoreLotus01: TypedArraySchemas.f32({ description: "Lotus suitability score per tile (0..1)." }),
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
    "shipping-lanes": Type.Object({}),
  },
});

export default PlanReefsContract;
