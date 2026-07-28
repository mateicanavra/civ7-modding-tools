import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import tectonicDifferentiationDefinition from "./strategies/tectonic-differentiation/config.js";

/**
 * Contract for evolving the initial crust through accumulated tectonic activity and history.
 * Orogeny owns this differentiation boundary; projection only materializes the resulting crust later.
 */
const ComputeCrustEvolutionContract = defineOp({
  kind: "compute",
  id: "foundation/compute-crust-evolution",
  input: Type.Object(
    {
      mesh: Type.Object(
        {
          cellCount: Type.Integer({ minimum: 1 }),
          neighborsOffsets: TypedArraySchemas.i32({
            cardinality: { factors: ["mesh.cellCount"], addend: 1 },
          }),
          neighbors: TypedArraySchemas.i32({ cardinality: "constructor-only" }),
        },
        { additionalProperties: false }
      ),
      initialCrust: Type.Object(
        {
          thickness: TypedArraySchemas.f32({ cardinality: ["mesh.cellCount"] }),
          strength: TypedArraySchemas.f32({ cardinality: ["mesh.cellCount"] }),
        },
        { additionalProperties: false }
      ),
      tectonics: Type.Object(
        {
          boundaryType: TypedArraySchemas.u8({ cardinality: ["mesh.cellCount"] }),
          cumulativeUplift: TypedArraySchemas.u8({ cardinality: ["mesh.cellCount"] }),
          riftPotential: TypedArraySchemas.u8({ cardinality: ["mesh.cellCount"] }),
          shearStress: TypedArraySchemas.u8({ cardinality: ["mesh.cellCount"] }),
        },
        { additionalProperties: false }
      ),
      tectonicHistory: Type.Object(
        {
          eras: Type.Array(
            Type.Object(
              {
                upliftPotential: TypedArraySchemas.u8({ cardinality: ["mesh.cellCount"] }),
                riftPotential: TypedArraySchemas.u8({ cardinality: ["mesh.cellCount"] }),
                shearStress: TypedArraySchemas.u8({ cardinality: ["mesh.cellCount"] }),
                volcanism: TypedArraySchemas.u8({ cardinality: ["mesh.cellCount"] }),
                fracture: TypedArraySchemas.u8({ cardinality: ["mesh.cellCount"] }),
              },
              { additionalProperties: false }
            ),
            { minItems: 5, maxItems: 8 }
          ),
          upliftTotal: TypedArraySchemas.u8({ cardinality: ["mesh.cellCount"] }),
          fractureTotal: TypedArraySchemas.u8({ cardinality: ["mesh.cellCount"] }),
        },
        { additionalProperties: false }
      ),
    },
    {
      additionalProperties: false,
      description: "Input payload for foundation/compute-crust-evolution.",
    }
  ),
  output: Type.Object(
    {
      crust: Type.Object(
        {
          maturity: TypedArraySchemas.f32({ cardinality: "constructor-only" }),
          thickness: TypedArraySchemas.f32({ cardinality: "constructor-only" }),
          thermalAge: TypedArraySchemas.u8({ cardinality: "constructor-only" }),
          damage: TypedArraySchemas.u8({ cardinality: "constructor-only" }),
          type: TypedArraySchemas.u8({ cardinality: "constructor-only" }),
          age: TypedArraySchemas.u8({ cardinality: "constructor-only" }),
          buoyancy: TypedArraySchemas.f32({ cardinality: "constructor-only" }),
          baseElevation: TypedArraySchemas.f32({ cardinality: "constructor-only" }),
          strength: TypedArraySchemas.f32({ cardinality: "constructor-only" }),
        },
        { additionalProperties: false }
      ),
    },
    {
      additionalProperties: false,
      description: "Output payload for foundation/compute-crust-evolution.",
    }
  ),
  strategies: [tectonicDifferentiationDefinition],
});

export default ComputeCrustEvolutionContract;
