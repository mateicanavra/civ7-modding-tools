import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

/** Registers Foundation's plate-motion artifact. */
export const artifact = defineArtifact({
  name: "foundationPlateMotion",
  id: "artifact:foundation.plateMotion",
  schema: Type.Object(
    {
      version: Type.Integer({ minimum: 1 }),
      cellCount: Type.Integer({ minimum: 1 }),
      plateCount: Type.Integer({ minimum: 1 }),
      plateCenterX: TypedArraySchemas.f32({ cardinality: ["plateCount"] }),
      plateCenterY: TypedArraySchemas.f32({ cardinality: ["plateCount"] }),
      plateVelocityX: TypedArraySchemas.f32({ cardinality: ["plateCount"] }),
      plateVelocityY: TypedArraySchemas.f32({ cardinality: ["plateCount"] }),
      plateOmega: TypedArraySchemas.f32({ cardinality: ["plateCount"] }),
      plateFitRms: TypedArraySchemas.f32({ cardinality: ["plateCount"] }),
      plateFitP90: TypedArraySchemas.f32({ cardinality: ["plateCount"] }),
      plateQuality: TypedArraySchemas.u8({ cardinality: ["plateCount"] }),
      cellFitError: TypedArraySchemas.u8({ cardinality: ["cellCount"] }),
    },
    {
      additionalProperties: false,
      description: "Per-plate rigid motion and plate- and cell-level fit evidence.",
    }
  ),
});
