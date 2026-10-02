import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import {
  BasinWetBodySchema,
  BasinHydraulicComponentSchema,
  BasinInternalTransferSchema,
  BasinPortSchema,
  BasinTerminalSchema,
} from "../../model/atoms/basin-network.schema.js";
import bodyAwareDefinition from "./strategies/body-aware/config.js";

/** Derives metadata from the contracted physical graph; never changes receivers or budgets. */
const ClassifyBasinRiverNetworkContract = defineOp({
  kind: "compute",
  id: "hydrology/classify-basin-river-network",
  input: Type.Object(
    {
      width: Type.Integer({ minimum: 1 }),
      height: Type.Integer({ minimum: 1 }),
      externalWaterMask: TypedArraySchemas.u8(),
      elevation: TypedArraySchemas.i16(),
      lakeMask: TypedArraySchemas.u8(),
      waterSurface: Type.Array(Type.Number()),
      bodyId: TypedArraySchemas.i32(),
      componentId: TypedArraySchemas.i32(),
      terminalId: TypedArraySchemas.i32(),
      terminalType: TypedArraySchemas.u8(),
      bodies: Type.Array(BasinWetBodySchema),
      components: Type.Array(BasinHydraulicComponentSchema),
      transfers: Type.Array(BasinInternalTransferSchema),
      ports: Type.Array(BasinPortSchema),
      terminals: Type.Array(BasinTerminalSchema),
      discharge: Type.Array(Type.Number({ minimum: 0 })),
      riverClass: TypedArraySchemas.u8(),
      flowDir: TypedArraySchemas.i32(),
    },
    { additionalProperties: false }
  ),
  output: Type.Object(
    {
      upstreamArea: TypedArraySchemas.i32({
        description:
          "Each hydraulic member reports the same component contributing area; do not sum replicated observations.",
      }),
      streamOrderProxy: TypedArraySchemas.u8({
        description:
          "Merge incoming hierarchy once per component, independent of internal signed exchanges.",
      }),
      mouthType: TypedArraySchemas.u8({
        description:
          "1 ocean, 2 first accepted lake, 3 closed, 5 boundary export, 6 subtile, 7 dry; 0 on wet/marine cells.",
      }),
      mouthBodyId: TypedArraySchemas.i32({
        description:
          "First downstream strict wet-body identity; 0 for other destinations and wet cells.",
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
