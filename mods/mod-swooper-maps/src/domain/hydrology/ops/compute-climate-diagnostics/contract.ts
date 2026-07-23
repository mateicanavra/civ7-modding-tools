import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import strategies from "./strategies/contract.js";

/** Derives rain-shadow, continentality, and convergence diagnostics from admitted climate fields. */
const ComputeClimateDiagnosticsContract = defineOp({
  kind: "compute",
  id: "hydrology/compute-climate-diagnostics",
  /**
   * Computes diagnostic indices from climate signals (rain shadow, continentality, convergence).
   *
   * These outputs are explicitly advisory. They exist to support debugging, tuning, and downstream heuristics.
   * They must not be treated as Hydrology internal truth.
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
      /** Elevation (meters) per tile. */
      elevation: TypedArraySchemas.i16({ description: "Elevation (meters) per tile." }),
      /** Land mask per tile (1=land, 0=water). */
      landMask: TypedArraySchemas.u8({ description: "Land mask per tile (1=land, 0=water)." }),
      /** Wind U component per tile (-127..127). */
      windU: TypedArraySchemas.i8({ description: "Wind U component per tile (-127..127)." }),
      /** Wind V component per tile (-127..127). */
      windV: TypedArraySchemas.i8({ description: "Wind V component per tile (-127..127)." }),
      /** Rainfall (0..200) per tile. */
      rainfall: TypedArraySchemas.u8({ description: "Rainfall (0..200) per tile." }),
      /** Humidity (0..255) per tile. */
      humidity: TypedArraySchemas.u8({ description: "Humidity (0..255) per tile." }),
    },
    {
      additionalProperties: false,
      description: "Inputs for diagnostic climate indices (deterministic, data-only).",
    }
  ),
  /**
   * Diagnostic outputs.
   */
  output: Type.Object(
    {
      /** Rain shadow proxy (0..1) per tile (advisory). */
      rainShadowIndex: TypedArraySchemas.f32({
        description: "Rain shadow proxy (0..1) per tile (advisory).",
      }),
      /** Continentality proxy (0..1) per tile (advisory). */
      continentalityIndex: TypedArraySchemas.f32({
        description: "Continentality proxy (0..1) per tile (advisory).",
      }),
      /** Convergence proxy (0..1) per tile (advisory). */
      convergenceIndex: TypedArraySchemas.f32({
        description: "Convergence proxy (0..1) per tile (advisory).",
      }),
    },
    {
      additionalProperties: false,
      description: "Diagnostic climate indices outputs (advisory).",
    }
  ),
  strategies,
});

export default ComputeClimateDiagnosticsContract;
