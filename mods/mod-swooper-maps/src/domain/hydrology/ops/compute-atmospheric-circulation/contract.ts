import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import strategies from "./strategies/contract.js";

/** Wind-field contract whose geostrophic proxy is the product default and latitude is the simpler fallback. */
const ComputeAtmosphericCirculationContract = defineOp({
  kind: "compute",
  id: "hydrology/compute-atmospheric-circulation",
  /**
   * Computes a prevailing wind field (U/V) from latitude plus deterministic structure/noise.
   *
   * Important invariants:
   * - RNG crosses the op boundary as *data only* (`rngSeed`). The op must construct its own local RNG.
   * - Outputs are deterministic given the same seed + inputs.
   *
   * Practical guidance:
   * - If winds feel too uniform: increase `windVariance` and/or `windJetStreaks`.
   * - If winds dominate too strongly: decrease `windJetStrength`.
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
      /** Deterministic RNG seed (derived in the step; pure data). */
      rngSeed: Type.Integer({
        minimum: 0,
        maximum: 2_147_483_647,
        description: "Deterministic RNG seed (derived in the step; pure data).",
      }),
      /** Optional land mask per tile (1=land, 0=water). */
      landMask: Type.Optional(
        TypedArraySchemas.u8({ description: "Land mask per tile (1=land, 0=water)." })
      ),
      /** Optional elevation (meters-ish) per tile (signed). */
      elevation: Type.Optional(
        TypedArraySchemas.i16({ description: "Elevation per tile (optional; signed meters-ish)." })
      ),
      /** Optional season phase (0..1), where 0 and 1 represent the same point in the cycle. */
      seasonPhase01: Type.Optional(
        Type.Number({
          minimum: 0,
          maximum: 1,
          description:
            "Optional season phase (0..1), where 0 and 1 represent the same point in the cycle.",
        })
      ),
    },
    {
      additionalProperties: false,
      description: "Inputs for wind-field computation (deterministic, data-only).",
    }
  ),
  /**
   * Wind field output (discrete i8 components).
   */
  output: Type.Object(
    {
      /** Wind U component per tile (-127..127). */
      windU: TypedArraySchemas.i8({ description: "Wind U component per tile (-127..127)." }),
      /** Wind V component per tile (-127..127). */
      windV: TypedArraySchemas.i8({ description: "Wind V component per tile (-127..127)." }),
    },
    {
      additionalProperties: false,
      description: "Wind field output per tile (U/V components).",
    }
  ),
  defaultStrategy: "geostrophic-proxy",
  strategies,
});

export default ComputeAtmosphericCirculationContract;
