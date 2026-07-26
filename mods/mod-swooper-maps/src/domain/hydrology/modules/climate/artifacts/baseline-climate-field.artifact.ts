import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

/** Registers the baseline climate artifact consumed by routing and climate refinement. */
export const artifact = defineArtifact({
  name: "baselineClimateField",
  id: "artifact:hydrology.baselineClimateField",
  schema: Type.Object(
    {
      rainfall: TypedArraySchemas.u8({
        cardinality: "map-grid",
        description:
          "Annual-mean precipitation intensity before river-corridor and cryosphere refinement, encoded in Civ7's inclusive 0-200 rainfall domain.",
      }),
      humidity: TypedArraySchemas.u8({
        cardinality: "map-grid",
        description:
          "Annual-mean atmospheric moisture available to river routing and climate refinement, encoded on an inclusive 0-255 scale.",
      }),
    },
    {
      additionalProperties: false,
      description:
        "Hydrology's immutable pre-hydrography climate surface with one baseline rainfall and humidity sample for every map tile.",
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
