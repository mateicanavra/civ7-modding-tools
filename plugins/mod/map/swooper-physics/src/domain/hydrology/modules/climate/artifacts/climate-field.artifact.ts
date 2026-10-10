import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Publishes copies of unchanged baseline atmospheric rainfall and humidity after climate refinement;
 * map projection and Ecology consume this final vintage. Admission preserves map
 * cardinality and Civ7's inclusive `0..200` rainfall domain.
 */
export const artifact = defineArtifact({
  name: "climateField",
  id: "artifact:hydrology.climateField",
  schema: Type.Object(
    {
      rainfall: TypedArraySchemas.u8({
        cardinality: "map-grid",
        description:
          "Final per-tile precipitation intensity consumed by projection and Ecology, encoded in Civ7's inclusive 0-200 rainfall domain.",
      }),
      humidity: TypedArraySchemas.u8({
        cardinality: "map-grid",
        description:
          "Unchanged baseline per-tile atmospheric moisture consumed by projection and Ecology, encoded on an inclusive 0-255 scale.",
      }),
    },
    {
      additionalProperties: false,
      description:
        "Hydrology's immutable final climate surface with unchanged baseline atmospheric rainfall and humidity for every map tile.",
    }
  ),
  refine: (value, { issues }) => {
    const invalidIndex = value.rainfall.findIndex((sample) => sample > 200);
    if (invalidIndex >= 0) {
      issues.add(
        `Expected climate.rainfall[${invalidIndex}] to be within 0..200 (received ${value.rainfall[invalidIndex]}).`
      );
    }
  },
});
