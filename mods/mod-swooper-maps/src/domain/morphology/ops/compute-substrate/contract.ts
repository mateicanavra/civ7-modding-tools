import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import strategies from "./strategies/contract.js";

/**
 * Computes substrate buffers (erodibility and sediment depth) from tectonic potentials.
 */
const ComputeSubstrateContract = defineOp({
  kind: "compute",
  id: "morphology/compute-substrate",
  input: Type.Object(
    {
      width: Type.Integer({ minimum: 1, description: "Map width in tiles." }),
      height: Type.Integer({ minimum: 1, description: "Map height in tiles." }),
      upliftPotential: TypedArraySchemas.u8({
        description: "Uplift potential per tile (0..255).",
      }),
      riftPotential: TypedArraySchemas.u8({
        description: "Rift potential per tile (0..255).",
      }),
      boundaryCloseness: TypedArraySchemas.u8({
        description: "Boundary proximity per tile (0..255).",
      }),
      boundaryType: TypedArraySchemas.u8({
        description: "Boundary type per tile (BOUNDARY_TYPE values).",
      }),
      crustType: TypedArraySchemas.u8({
        description: "Crust type per tile (0=oceanic, 1=continental).",
      }),
      crustAge: TypedArraySchemas.u8({
        description: "Crust age per tile (0=new, 255=ancient).",
      }),
    },
    { additionalProperties: false }
  ),
  output: Type.Object({
    erodibilityK: TypedArraySchemas.f32({
      description: "Erodibility / resistance proxy per tile (higher = easier incision).",
    }),
    sedimentDepth: TypedArraySchemas.f32({
      description: "Loose sediment thickness proxy per tile (higher = deeper deposits).",
    }),
  }),
  strategies,
});

export default ComputeSubstrateContract;
