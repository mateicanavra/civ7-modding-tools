import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import { OpenBasinBodySchema } from "../../model/atoms/index.js";
import bodyAwareDefinition from "./strategies/body-aware/config.js";

/** Derives metadata from the contracted physical graph; never changes receivers or budgets. */
const ClassifyBasinRiverNetworkContract = defineOp({
  kind: "compute",
  id: "hydrology/classify-basin-river-network",
  input: Type.Object(
    {
      width: Type.Integer({ minimum: 1 }),
      height: Type.Integer({ minimum: 1 }),
      landMask: TypedArraySchemas.u8(),
      elevation: TypedArraySchemas.i16(),
      lakeMask: TypedArraySchemas.u8(),
      waterSurface: TypedArraySchemas.i16(),
      bodyId: TypedArraySchemas.i32(),
      bodies: Type.Array(OpenBasinBodySchema),
      discharge: Type.Array(Type.Number({ minimum: 0 })),
      riverClass: TypedArraySchemas.u8(),
      flowDir: TypedArraySchemas.i32(),
    },
    { additionalProperties: false }
  ),
  output: Type.Object(
    {
      basinId: TypedArraySchemas.i32({
        description:
          "Final marine-exit source index plus one, propagated through the contracted graph; -1 on original marine cells.",
      }),
      upstreamArea: TypedArraySchemas.i32({
        description:
          "Each wet member reports the same whole-body contributing area; do not sum these replicated body observations.",
      }),
      streamOrderProxy: TypedArraySchemas.u8({
        description: "Merge incoming hierarchy once per body, independent of its wet BFS tree.",
      }),
      mouthType: TypedArraySchemas.u8({
        description: "1 marine, 2 first downstream accepted lake, 0 on wet or marine cells.",
      }),
      mouthBodyId: TypedArraySchemas.i32({
        description:
          "First downstream lake root identity, 0 for marine destinations and wet cells.",
      }),
      slopeClass: TypedArraySchemas.u8({
        description:
          "Dry-edge ground slope; use physical water surface at wet endpoints. 0 on water.",
      }),
      flowPermanenceProxy: TypedArraySchemas.u8(),
    },
    { additionalProperties: false }
  ),
  strategies: [bodyAwareDefinition],
});
export default ClassifyBasinRiverNetworkContract;
