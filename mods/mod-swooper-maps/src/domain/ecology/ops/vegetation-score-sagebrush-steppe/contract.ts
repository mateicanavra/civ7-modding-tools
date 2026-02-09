import { Type, TypedArraySchemas, defineOp } from "@swooper/mapgen-core/authoring";

const ScoreVegetationSagebrushSteppeContract = defineOp({
  kind: "compute",
  id: "ecology/vegetation/score/sagebrush-steppe",
  input: Type.Object(
    {
      width: Type.Integer({ minimum: 1, description: "Map width in tiles." }),
      height: Type.Integer({ minimum: 1, description: "Map height in tiles." }),
      landMask: TypedArraySchemas.u8({ description: "Land mask per tile (1=land, 0=water)." }),
      energy01: TypedArraySchemas.f32({ description: "Growth energy proxy (0..1)." }),
      water01: TypedArraySchemas.f32({ description: "Water availability proxy (0..1)." }),
      waterStress01: TypedArraySchemas.f32({ description: "Water stress proxy (0..1)." }),
      coldStress01: TypedArraySchemas.f32({ description: "Cold stress proxy (0..1)." }),
      biomass01: TypedArraySchemas.f32({ description: "Biomass proxy (0..1)." }),
      fertility01: TypedArraySchemas.f32({ description: "Fertility proxy (0..1)." }),
    },
    { additionalProperties: false }
  ),
  output: Type.Object({
    score01: TypedArraySchemas.f32({
      description: "Sagebrush steppe suitability score per tile (0..1).",
    }),
  }),
  strategies: {
    default: Type.Object({}, { additionalProperties: false }),
  },
});

export default ScoreVegetationSagebrushSteppeContract;

