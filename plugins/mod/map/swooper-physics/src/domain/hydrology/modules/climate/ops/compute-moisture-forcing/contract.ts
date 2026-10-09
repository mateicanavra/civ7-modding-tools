import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

import sourceLimitedDefinition from "./strategies/source-limited/config.js";

/** Couples external marine supply, conservative transport, and source-limited rainout. */
const ComputeMoistureForcingContract = defineOp({
  kind: "compute",
  id: "hydrology/compute-moisture-forcing",
  input: Type.Object(
    {
      width: Type.Integer({ minimum: 1, description: "Tile grid width (columns)." }),
      height: Type.Integer({ minimum: 1, description: "Tile grid height (rows)." }),
      landMask: TypedArraySchemas.u8({
        description: "Initial land identity (1=land, 0=water), which gates terrain extraction.",
      }),
      externalWaterMask: TypedArraySchemas.u8({
        description:
          "Initial external-water identity (1=unbounded marine supply, 0=no local supply); finite inland water is excluded.",
      }),
      elevation: TypedArraySchemas.i16({
        description:
          "Initial ground elevation in quantized model-relief units, not metres; land ascent subtracts seaLevel.",
      }),
      seaLevel: Type.Number({ description: "Initial sea-surface datum in model-relief units." }),
      windU: TypedArraySchemas.i8({ description: "Encoded wind U component (-127..127)." }),
      windV: TypedArraySchemas.i8({ description: "Encoded wind V component (-127..127)." }),
      sstC: TypedArraySchemas.f32({
        description: "Prescribed sea-surface temperature at the final upstream coupling vintage (C).",
      }),
      seaIceMask: TypedArraySchemas.u8({
        description: "Prescribed sea-ice identity (1=ice, 0=no ice) at the same coupling vintage.",
      }),
    },
    {
      additionalProperties: false,
      description:
        "One weather member's initial surface and prescribed marine/wind evidence; production atmospheric stock starts at zero.",
    }
  ),
  output: Type.Object(
    {
      precipitation: TypedArraySchemas.f32({
        description:
          "Integrated deposited model water per unit tile area over one representative interval, in rainfall-index-equivalent units, without a byte codec or saturation cap.",
      }),
      surfaceWetness: TypedArraySchemas.f32({
        description:
          "Empirical member surface wetness clamp01(precipitation/200), derived from published float precipitation, not independent air humidity.",
      }),
    },
    {
      additionalProperties: false,
      description:
        "Float model forcing and its surface-wetness proxy; final atmospheric stock remains private and is not forced into precipitation.",
    }
  ),
  strategies: [sourceLimitedDefinition],
});

export default ComputeMoistureForcingContract;
