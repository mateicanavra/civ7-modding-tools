import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Publishes copied baseline atmospheric rainfall and humidity without local water bonuses;
 * map projection and Ecology consume this surface rather than the baseline. Admission preserves map
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
          "Baseline per-tile atmospheric wetness proxy preserved through refinement, encoded on an inclusive 0-255 scale.",
      }),
    },
    {
      additionalProperties: false,
      description:
        "Hydrology's immutable final climate surface with copied baseline rainfall and humidity for every map tile.",
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
