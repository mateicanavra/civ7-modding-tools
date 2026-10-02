import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import {
  BathymetryFieldSchema,
  ElevationFieldSchema,
  ExternalWaterMaskSchema,
  LandMaskSchema,
  SeaLevelDatumSchema,
} from "../../../../model/atoms/index.js";
import originalIdentity from "./strategies/original-identity/config.js";

/** Seals evolved channel ground once while retaining the initial identity and fixed water datum. */
const ComputeChannelTopographyContract = defineOp({
  kind: "compute",
  id: "morphology/compute-channel-topography",
  input: Type.Object(
    {
      width: Type.Integer({ minimum: 1 }),
      height: Type.Integer({ minimum: 1 }),
      elevation: Type.Array(Type.Number({ description: "Precise evolved ground before publication rounding and bounds." })),
      initialElevation: TypedArraySchemas.i16({ description: "Initial integer ground before channel evolution." }),
      originalLandMask: TypedArraySchemas.u8({ description: "Immutable original land identity, not current exposed land." }),
      externalWaterMask: TypedArraySchemas.u8({ description: "Immutable prescribed external water identity." }),
      seaLevel: SeaLevelDatumSchema,
      bathymetry: TypedArraySchemas.i16({ description: "Fixed initial signed water-depth field." }),
    },
    { additionalProperties: false }
  ),
  output: Type.Object(
    {
      topography: Type.Object(
        {
          elevation: ElevationFieldSchema,
          seaLevel: SeaLevelDatumSchema,
          landMask: LandMaskSchema,
          externalWaterMask: ExternalWaterMaskSchema,
          bathymetry: BathymetryFieldSchema,
        },
        { additionalProperties: false }
      ),
      roundingDelta: Type.Array(Type.Number({ description: "Math.round ground change before publication bounds or eligible original-land floor." })),
      clampDelta: Type.Array(Type.Number({ description: "Ground change after rounding from representable bounds and eligible original-land floor." })),
    },
    { additionalProperties: false }
  ),
  strategies: [originalIdentity],
});

export default ComputeChannelTopographyContract;
