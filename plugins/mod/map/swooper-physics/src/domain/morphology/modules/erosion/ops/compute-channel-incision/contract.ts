import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import { SeaLevelDatumSchema } from "../../../../model/atoms/index.js";
import implicitStreamPower from "./strategies/implicit-stream-power/config.js";

/** Evolves precise exposed channels against supplied certified hydraulic evidence only. */
const ComputeChannelIncisionContract = defineOp({
  kind: "compute",
  id: "morphology/compute-channel-incision",
  input: Type.Object(
    {
      width: Type.Integer({ minimum: 1 }),
      height: Type.Integer({ minimum: 1 }),
      elevation: Type.Array(Type.Number({ minimum: -32768, maximum: 32767 })),
      originalLandMask: TypedArraySchemas.u8({ description: "Original land identity; initially submerged cells never incise." }),
      externalWaterMask: TypedArraySchemas.u8({ description: "Prescribed external water receiving at the sea datum, not its bed." }),
      exposedLandMask: TypedArraySchemas.u8({ description: "Certified current finite exposed ground." }),
      wetMask: TypedArraySchemas.u8({ description: "Certified current finite wetness; wet floors never incise." }),
      receiver: TypedArraySchemas.i32({ description: "Supplied certified adjacent channel receiver, -1 terminal, -2 unattached component member." }),
      dryDischarge: Type.Array(Type.Number({ minimum: 0 })),
      waterSurface: Type.Array(Type.Number({ description: "Certified finite wet head, external head, or unchanged dry ground." })),
      seaLevel: SeaLevelDatumSchema,
      erodibilityK: TypedArraySchemas.f32({ description: "Nonnegative material erodibility; substrate is not mutated." }),
    },
    { additionalProperties: false }
  ),
  output: Type.Object(
    {
      elevation: Type.Array(Type.Number({ minimum: -32768, maximum: 32767 })),
      incisionDepth: Type.Array(Type.Number({ minimum: 0, description: "Detached surface height in ground units; not deposited or exported sediment." })),
    },
    { additionalProperties: false }
  ),
  strategies: [implicitStreamPower],
});

export default ComputeChannelIncisionContract;
