import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import riparianBasinWetnessDefinition from "./strategies/riparian-basin-wetness/config.js";

/** Refines an admitted precipitation vintage with river-corridor and enclosed-basin wetness. */
const RefinePrecipitationContract = defineOp({
  kind: "compute",
  id: "hydrology/refine-precipitation",
  input: Type.Object(
    {
      width: Type.Integer({ minimum: 1, description: "Tile grid width in columns." }),
      height: Type.Integer({ minimum: 1, description: "Tile grid height in rows." }),
      elevation: TypedArraySchemas.i16({
        description: "Terrain elevation in meters for each map tile.",
      }),
      landMask: TypedArraySchemas.u8({
        description: "Land membership for each map tile, encoded as 1 for land and 0 for water.",
      }),
      rainfall: TypedArraySchemas.u8({
        description: "Baseline precipitation intensity for each tile on Civ7's 0..200 scale.",
      }),
      humidity: TypedArraySchemas.u8({
        description: "Baseline atmospheric moisture for each tile on the 0..255 evidence scale.",
      }),
      riverClass: TypedArraySchemas.u8({
        description:
          "Hydrology river class for each tile, where zero is dry and positive classes identify river corridors.",
      }),
    },
    {
      additionalProperties: false,
      description:
        "Existing precipitation, terrain, and river evidence observed by local wetness refinement.",
    }
  ),
  output: Type.Object(
    {
      rainfall: TypedArraySchemas.u8({
        description: "Refined precipitation intensity for each tile on Civ7's 0..200 scale.",
      }),
      humidity: TypedArraySchemas.u8({
        description:
          "Humidity reprojected from refined rainfall on land while water retains input humidity, on the 0..255 evidence scale.",
      }),
    },
    {
      additionalProperties: false,
      description:
        "A new refined rainfall and humidity vintage derived without mutating baseline climate evidence.",
    }
  ),
  strategies: [riparianBasinWetnessDefinition],
});

export default RefinePrecipitationContract;
