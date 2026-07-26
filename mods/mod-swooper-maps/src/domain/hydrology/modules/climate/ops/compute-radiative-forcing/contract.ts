import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import latitudeInsolationDefinition from "./strategies/latitude-insolation/config.js";

/** Projects admitted latitude and seasonal phase into a bounded per-tile insolation field. */
const ComputeRadiativeForcingContract = defineOp({
  kind: "compute",
  id: "hydrology/compute-radiative-forcing",
  /**
   * Computes radiative forcing proxies (insolation) from latitude.
   *
   * This op is intentionally simple: it provides a deterministic forcing layer that downstream thermal/wind/moisture
   * ops can consume without re-deriving latitude bands ad hoc.
   */
  input: Type.Object(
    {
      /** Tile grid width. */
      width: Type.Integer({ minimum: 1, description: "Tile grid width (columns)." }),
      /** Tile grid height. */
      height: Type.Integer({ minimum: 1, description: "Tile grid height (rows)." }),
      /** Latitude by row in degrees; length must equal `height`. */
      latitudeByRow: TypedArraySchemas.f32({
        cardinality: ["height"],
        description: "Latitude per row (degrees).",
      }),
    },
    {
      additionalProperties: false,
      description: "Inputs for radiative forcing computation (deterministic, data-only).",
    }
  ),
  /**
   * Insolation proxy output used as a forcing input for thermal state and circulation.
   */
  output: Type.Object(
    {
      /** Insolation proxy (0..1) per tile. */
      insolation: TypedArraySchemas.f32({ description: "Insolation proxy (0..1) per tile." }),
    },
    {
      additionalProperties: false,
      description: "Radiative forcing output (insolation proxy) per tile.",
    }
  ),
  strategies: [latitudeInsolationDefinition],
});

export default ComputeRadiativeForcingContract;
