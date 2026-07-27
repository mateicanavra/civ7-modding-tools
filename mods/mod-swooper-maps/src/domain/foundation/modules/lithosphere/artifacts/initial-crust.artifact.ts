import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

const CRUST_ARRAY_KEYS = [
  "maturity",
  "thickness",
  "thermalAge",
  "damage",
  "type",
  "age",
  "buoyancy",
  "baseElevation",
  "strength",
] as const;

/** Registers the initial Foundation crust vintage that seeds tectonic evolution. */
export const artifact = defineArtifact({
  name: "initialCrust",
  id: "artifact:foundation.initialCrust",
  schema: Type.Object(
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
    {
      additionalProperties: false,
      description: "Initial mesh-space crust fields before tectonic evolution.",
    }
  ),
  refine: (value, { issues }) => {
    const expectedLength = value.maturity.length;
    if (expectedLength === 0) issues.add("crust arrays must be nonempty");
    for (const key of CRUST_ARRAY_KEYS) {
      if (value[key].length !== expectedLength) {
        issues.add(`Expected ${key} length ${expectedLength} (received ${value[key].length}).`);
      }
    }
  },
});
