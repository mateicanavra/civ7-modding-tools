import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import baselineDefinition from "./strategies/baseline/config.js";
import vectorDefinition from "./strategies/vector/config.js";

/** Precipitation-generation contract with vector transport as the product default. */
const ComputePrecipitationContract = defineOp({
  kind: "compute",
  id: "hydrology/compute-precipitation",
  /**
   * Inputs for precipitation computation.
   */
  input: Type.Object(
    {
      /** Tile grid width. */
      width: Type.Integer({ minimum: 1, description: "Tile grid width (columns)." }),
      /** Tile grid height. */
      height: Type.Integer({ minimum: 1, description: "Tile grid height (rows)." }),
      /** Latitude per row (degrees). */
      latitudeByRow: TypedArraySchemas.f32({
        cardinality: ["height"],
        description: "Latitude per row (degrees).",
      }),
      /** Elevation (meters) per tile. */
      elevation: TypedArraySchemas.i16({ description: "Elevation (meters) per tile." }),
      /** Land mask per tile (1=land, 0=water). */
      landMask: TypedArraySchemas.u8({ description: "Land mask per tile (1=land, 0=water)." }),
      /** Wind U component per tile (-127..127). */
      windU: TypedArraySchemas.i8({ description: "Wind U component per tile (-127..127)." }),
      /** Wind V component per tile (-127..127). */
      windV: TypedArraySchemas.i8({ description: "Wind V component per tile (-127..127)." }),
      /** Humidity proxy (0..1) per tile. */
      humidityF32: TypedArraySchemas.f32({ description: "Humidity proxy (0..1) per tile." }),
      /** Deterministic Perlin seed (derived in the step; pure data). */
      perlinSeed: Type.Integer({
        minimum: 0,
        maximum: 2_147_483_647,
        description: "Deterministic Perlin seed (derived in the step; pure data).",
      }),
    },
    {
      additionalProperties: false,
      description:
        "Inputs for precipitation/humidity mapping from humidity transport + local modifiers.",
    }
  ),
  /**
   * Precipitation outputs (rainfall + humidity).
   */
  output: Type.Object(
    {
      /** Rainfall (0..200) per tile. */
      rainfall: TypedArraySchemas.u8({ description: "Rainfall (0..200) per tile." }),
      /** Humidity (0..255) per tile. */
      humidity: TypedArraySchemas.u8({ description: "Humidity (0..255) per tile." }),
    },
    {
      additionalProperties: false,
      description: "Precipitation outputs (rainfall and humidity fields).",
    }
  ),
  defaultStrategy: "vector",
  strategies: [vectorDefinition, baselineDefinition],
});

export default ComputePrecipitationContract;
