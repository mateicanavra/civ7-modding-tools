import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import potentialGradientDefinition from "./strategies/potential-gradient/config.js";

/**
 * Contract for deriving mantle velocity, stress, divergence, and upwelling signals from potential.
 * Those signals couple the mantle subdomain to lithosphere initialization and tectonic motion.
 */
const ComputeMantleForcingContract = defineOp({
  kind: "compute",
  id: "foundation/compute-mantle-forcing",
  input: Type.Object(
    {
      mesh: Type.Object(
        {
          cellCount: Type.Integer({ minimum: 1 }),
          wrapWidth: Type.Number(),
          siteX: TypedArraySchemas.f32({ cardinality: ["mesh.cellCount"] }),
          siteY: TypedArraySchemas.f32({ cardinality: ["mesh.cellCount"] }),
          neighborsOffsets: TypedArraySchemas.i32({
            cardinality: { factors: ["mesh.cellCount"], addend: 1 },
          }),
          neighbors: TypedArraySchemas.i32({ cardinality: "constructor-only" }),
        },
        { additionalProperties: false }
      ),
      mantlePotential: Type.Object(
        {
          cellCount: Type.Integer({ minimum: 1 }),
          potential: TypedArraySchemas.f32({ cardinality: ["mesh.cellCount"] }),
        },
        { additionalProperties: false }
      ),
    },
    { additionalProperties: false }
  ),
  output: Type.Object(
    {
      mantleForcing: Type.Object(
        {
          version: Type.Integer({ minimum: 1 }),
          cellCount: Type.Integer({ minimum: 1 }),
          stress: TypedArraySchemas.f32({ cardinality: "constructor-only" }),
          forcingU: TypedArraySchemas.f32({ cardinality: "constructor-only" }),
          forcingV: TypedArraySchemas.f32({ cardinality: "constructor-only" }),
          forcingMag: TypedArraySchemas.f32({ cardinality: "constructor-only" }),
          upwellingClass: TypedArraySchemas.i8({ cardinality: "constructor-only" }),
          divergence: TypedArraySchemas.f32({ cardinality: "constructor-only" }),
        },
        { additionalProperties: false }
      ),
    },
    {
      additionalProperties: false,
      description:
        "Mesh-wide velocity, stress, divergence, and upwelling signals derived from mantle potential and shared by plate-motion, hotspot, and tracer reconstruction.",
    }
  ),
  strategies: [potentialGradientDefinition],
});

export default ComputeMantleForcingContract;
