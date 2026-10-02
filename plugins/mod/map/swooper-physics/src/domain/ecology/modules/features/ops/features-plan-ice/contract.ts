import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import { IceFeaturePlacementSchema } from "../../model/atoms/index.js";
import scoreThresholdDefinition from "./strategies/score-threshold/config.js";

/** Converts marine-eligible suitability into sparse ice intent without claiming an occupied tile. Every implementation shares this admitted input and output boundary. */
const PlanIceContract = defineOp({
  kind: "plan",
  id: "ecology/features/plan-ice",
  input: Type.Object(
    {
      width: Type.Integer({ minimum: 1 }),
      height: Type.Integer({ minimum: 1 }),
      seed: Type.Integer(),
      externalWaterMask: TypedArraySchemas.u8({
        description: "Physical external-water recipient membership (1 = eligible, 0 = ineligible).",
      }),
      score01: TypedArraySchemas.f32({ description: "Ice suitability score per tile (0..1)." }),
      featureOccupancyMask: TypedArraySchemas.u8({
        description: "0 = unoccupied, nonzero = already claimed by an ecology feature intent.",
      }),
    },
    { additionalProperties: false }
  ),
  output: Type.Object({
    placements: Type.Array(IceFeaturePlacementSchema),
  }),
  strategies: [scoreThresholdDefinition],
});

export default PlanIceContract;
