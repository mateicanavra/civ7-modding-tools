import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Semantic identity for deriving the natural-wonder target from Civ7 map metadata.
 * The metadata input and normalized target output remain owned by the shared operation contract.
 */
export default defineStrategy({
  id: "map-metadata",
  config: Type.Object(
    {},
    {
      description:
        "Natural-wonder demand derives entirely from admitted Civ7 map-size metadata and exposes no authored parameters.",
    }
  ),
});
