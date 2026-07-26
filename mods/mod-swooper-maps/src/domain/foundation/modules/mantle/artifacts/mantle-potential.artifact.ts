import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

/** Registers Foundation's mantle-potential artifact. */
export const artifact = defineArtifact({
  name: "foundationMantlePotential",
  id: "artifact:foundation.mantlePotential",
  schema: Type.Object(
    {
      version: Type.Integer({ minimum: 1 }),
      cellCount: Type.Integer({ minimum: 1 }),
      potential: TypedArraySchemas.f32({ cardinality: ["cellCount"] }),
      sourceCount: Type.Integer({ minimum: 0 }),
      sourceType: TypedArraySchemas.i8({ cardinality: ["sourceCount"] }),
      sourceCell: TypedArraySchemas.u32({ cardinality: ["sourceCount"] }),
      sourceAmplitude: TypedArraySchemas.f32({ cardinality: ["sourceCount"] }),
      sourceRadius: TypedArraySchemas.f32({ cardinality: ["sourceCount"] }),
    },
    {
      additionalProperties: false,
      description: "Mantle potential and its deterministic thermal-source population.",
    }
  ),
});
