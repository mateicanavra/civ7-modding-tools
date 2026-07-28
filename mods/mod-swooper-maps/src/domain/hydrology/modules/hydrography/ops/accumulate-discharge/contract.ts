import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import topologicalRunoffDefinition from "./strategies/topological-runoff/config.js";

/** Accumulates local runoff through admitted drainage routing into discharge, sink, and outlet evidence. */
const AccumulateDischargeContract = defineOp({
  kind: "compute",
  id: "hydrology/accumulate-discharge",
  /**
   * Computes a runoff proxy and accumulates it along Hydrology-derived routing to derive discharge.
   *
   * Routing ownership invariant:
   * - `flowDir` is owned within Hydrology (derived from Morphology topography), and should not be recomputed inside this op.
   */
  input: Type.Object(
    {
      /** Tile grid width. */
      width: Type.Integer({ minimum: 1, description: "Tile grid width (columns)." }),
      /** Tile grid height. */
      height: Type.Integer({ minimum: 1, description: "Tile grid height (rows)." }),
      /** Land mask per tile (1=land, 0=water). */
      landMask: TypedArraySchemas.u8({ description: "Land mask per tile (1=land, 0=water)." }),
      /** Hydrology-conditioned receiver index per tile. */
      flowDir: TypedArraySchemas.i32({
        description:
          "Hydrology-conditioned receiver index per tile (or -1 for typed terminal basins).",
      }),
      /** Rainfall (0..200) per tile. */
      rainfall: TypedArraySchemas.u8({ description: "Rainfall (0..200) per tile." }),
      /** Relative humidity (0..255) per tile. */
      humidity: TypedArraySchemas.u8({ description: "Relative humidity (0..255) per tile." }),
    },
    {
      additionalProperties: false,
      description:
        "Hydrology receiver graph and climate supply used to derive and accumulate runoff without recomputing drainage routing.",
    }
  ),
  /**
   * Discharge-related outputs.
   */
  output: Type.Object(
    {
      /** Local runoff source proxy per tile. */
      runoff: TypedArraySchemas.f32({ description: "Local runoff source proxy per tile." }),
      /** Accumulated discharge proxy per tile. */
      discharge: TypedArraySchemas.f32({ description: "Accumulated discharge proxy per tile." }),
      /** Mask (1/0): land tiles that are routing sinks. */
      sinkMask: TypedArraySchemas.u8({
        description: "Mask (1/0): land tiles that are routing sinks.",
      }),
      /** Mask (1/0): land tiles that drain directly into ocean/edges (land→water/out-of-bounds). */
      outletMask: TypedArraySchemas.u8({
        description:
          "Mask (1/0): land tiles that drain directly into ocean/edges (land→water/out-of-bounds).",
      }),
    },
    {
      additionalProperties: false,
      description:
        "Local runoff and accumulated discharge with terminal sink and outlet masks consumed by lake and river planning.",
    }
  ),
  strategies: [topologicalRunoffDefinition],
});

export default AccumulateDischargeContract;
