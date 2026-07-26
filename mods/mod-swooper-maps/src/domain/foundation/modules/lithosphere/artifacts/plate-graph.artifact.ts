import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import { PlateSchema } from "../model/atoms/plate.schema.js";

/**
 * Publishes mesh-cell plate membership with the index-aligned plate identities consumed by
 * downstream tectonic history and projection.
 */
export const artifact = defineArtifact({
  name: "foundationPlateGraph",
  id: "artifact:foundation.plateGraph",
  schema: Type.Object(
    {
      cellToPlate: TypedArraySchemas.i16({ cardinality: "constructor-only" }),
      plates: Type.Immutable(Type.Array(PlateSchema)),
    },
    {
      additionalProperties: false,
      description: "Mesh-cell plate membership and index-aligned plate identities.",
    }
  ),
  refine: (value, { issues }) => {
    if (value.plates.length <= 0) issues.add("plates must be a nonempty array");
  },
});
