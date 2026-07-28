import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Registers tile-space origin, drift, and most-recent-boundary provenance
 * projected from Foundation's reconstructed tectonic history.
 */
export const artifact = defineArtifact({
  name: "tectonicProvenanceTiles",
  id: "artifact:foundation.tectonicProvenanceTiles",
  schema: Type.Object(
    {
      version: Type.Integer({ minimum: 1 }),
      originEra: TypedArraySchemas.u8({ cardinality: "map-grid" }),
      originPlateId: TypedArraySchemas.i16({ cardinality: "map-grid" }),
      driftDistance: TypedArraySchemas.u8({ cardinality: "map-grid" }),
      lastBoundaryEra: TypedArraySchemas.u8({ cardinality: "map-grid" }),
      lastBoundaryType: TypedArraySchemas.u8({ cardinality: "map-grid" }),
    },
    {
      additionalProperties: false,
      description: "Origin and most-recent-boundary lineage projected into map-tile space.",
    }
  ),
});
