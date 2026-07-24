import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import terrainWindIndicesDefinition from "./strategies/terrain-wind-indices/config.js";

/** Derives advisory rain-shadow, continentality, and convergence indices from climate evidence. */
const ComputeClimateDiagnosticsContract = defineOp({
  kind: "compute",
  id: "hydrology/compute-climate-diagnostics",
  input: Type.Object(
    {
      width: Type.Integer({ minimum: 1, description: "Tile grid width in columns." }),
      height: Type.Integer({ minimum: 1, description: "Tile grid height in rows." }),
      latitudeByRow: TypedArraySchemas.f32({
        cardinality: ["height"],
        description: "Latitude in degrees for each admitted map row.",
      }),
      elevation: TypedArraySchemas.i16({ description: "Elevation in meters for each tile." }),
      landMask: TypedArraySchemas.u8({ description: "Land membership for each tile." }),
      windU: TypedArraySchemas.i8({ description: "Zonal wind component for each tile." }),
      windV: TypedArraySchemas.i8({ description: "Meridional wind component for each tile." }),
      rainfall: TypedArraySchemas.u8({ description: "Final rainfall intensity for each tile." }),
    },
    {
      additionalProperties: false,
      description: "Admitted climate fields used to derive optional explanatory indices.",
    }
  ),
  output: Type.Object(
    {
      rainShadowIndex: TypedArraySchemas.f32({
        description: "Advisory orographic rain-shadow strength for each tile.",
      }),
      continentalityIndex: TypedArraySchemas.f32({
        description: "Advisory distance-from-water influence for each tile.",
      }),
      convergenceIndex: TypedArraySchemas.f32({
        description: "Advisory positive wind-convergence strength for each tile.",
      }),
    },
    {
      additionalProperties: false,
      description: "Ephemeral climate observables consumed by optional evidence facets.",
    }
  ),
  strategies: [terrainWindIndicesDefinition],
});

export default ComputeClimateDiagnosticsContract;
