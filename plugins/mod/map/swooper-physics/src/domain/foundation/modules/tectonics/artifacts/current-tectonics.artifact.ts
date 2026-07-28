import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

const CURRENT_TECTONICS_ARRAY_KEYS = [
  "boundaryType",
  "upliftPotential",
  "riftPotential",
  "shearStress",
  "volcanism",
  "fracture",
  "cumulativeUplift",
] as const;

/**
 * Publishes present-day boundary and stress fields composed from the newest reconstructed era while
 * retaining cumulative uplift for crust evolution and projection. Admission requires one nonempty,
 * index-aligned field set.
 */
export const artifact = defineArtifact({
  name: "currentTectonics",
  id: "artifact:foundation.tectonics",
  schema: Type.Object(
    {
      boundaryType: TypedArraySchemas.u8({ cardinality: "constructor-only" }),
      upliftPotential: TypedArraySchemas.u8({ cardinality: "constructor-only" }),
      riftPotential: TypedArraySchemas.u8({ cardinality: "constructor-only" }),
      shearStress: TypedArraySchemas.u8({ cardinality: "constructor-only" }),
      volcanism: TypedArraySchemas.u8({ cardinality: "constructor-only" }),
      fracture: TypedArraySchemas.u8({ cardinality: "constructor-only" }),
      cumulativeUplift: TypedArraySchemas.u8({ cardinality: "constructor-only" }),
    },
    {
      additionalProperties: false,
      description: "Present-day tectonic fields and cumulative uplift by mesh cell.",
    }
  ),
  refine: (value, { issues }) => {
    const expectedLength = value.boundaryType.length;
    if (expectedLength <= 0) issues.add("current tectonics arrays must be nonempty");
    for (const key of CURRENT_TECTONICS_ARRAY_KEYS) {
      if (value[key].length !== expectedLength) {
        issues.add(`Expected ${key} length ${expectedLength} (received ${value[key].length}).`);
      }
    }
  },
});
