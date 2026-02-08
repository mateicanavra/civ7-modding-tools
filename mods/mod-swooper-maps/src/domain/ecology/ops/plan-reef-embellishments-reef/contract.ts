import { Type, defineOp, TypedArraySchemas } from "@swooper/mapgen-core/authoring";

import { FeaturesConfigSchema, FeaturesDensityConfigSchema } from "../../config.js";
const ReefEmbellishmentPlacementSchema = Type.Object({
  x: Type.Integer({ minimum: 0 }),
  y: Type.Integer({ minimum: 0 }),
  feature: Type.Literal("FEATURE_REEF"),
});

const PlanReefEmbellishmentsReefContract = defineOp({
  kind: "plan",
  id: "ecology/features/reef-embellishments/reef",
  input: Type.Object({
    width: Type.Integer({ minimum: 1 }),
    height: Type.Integer({ minimum: 1 }),
    seed: Type.Number({ description: "Deterministic seed for reef embellishments." }),
    landMask: TypedArraySchemas.u8({ description: "Land mask per tile (1=land, 0=water)." }),
    featureKeyField: TypedArraySchemas.i16({
      description: "Existing feature key indices per tile (-1 for empty).",
    }),
    paradiseMask: TypedArraySchemas.u8({ description: "Paradise hotspot mask per tile." }),
    passiveShelfMask: TypedArraySchemas.u8({ description: "Passive shelf mask per tile." }),
  }),
  output: Type.Object({
    placements: Type.Array(ReefEmbellishmentPlacementSchema),
  }),
  strategies: {
    default: Type.Object({
      story: Type.Object({
        features: FeaturesConfigSchema,
      }),
      featuresDensity: FeaturesDensityConfigSchema,
    }),
  },
});

export default PlanReefEmbellishmentsReefContract;
