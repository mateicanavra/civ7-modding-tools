import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

/** Foundation tectonic provenance tiles artifact payload (tile-space provenance scalars). */
export const Schema = Type.Object(
  {
    /** Schema major version. */
    version: Type.Integer({ minimum: 1, description: "Schema major version." }),
    /** Era index of first appearance per tile (0..eraCount-1). */
    originEra: TypedArraySchemas.u8({
      description: "Era index of first appearance per tile (0..eraCount-1).",
    }),
    /** Origin plate id per tile (plate id; -1 for unknown). */
    originPlateId: TypedArraySchemas.i16({
      description: "Origin plate id per tile (plate id; -1 for unknown).",
    }),
    /** Drift distance bucket per tile (0..255). */
    driftDistance: TypedArraySchemas.u8({
      description: "Drift distance bucket per tile (0..255).",
    }),
    /** Era index of most recent boundary event per tile (255 = none). */
    lastBoundaryEra: TypedArraySchemas.u8({
      description: "Era index of most recent boundary event per tile (255 = none).",
    }),
    /** Boundary regime associated with lastBoundaryEra (BOUNDARY_TYPE; 255 = none). */
    lastBoundaryType: TypedArraySchemas.u8({
      description: "Boundary regime associated with lastBoundaryEra (BOUNDARY_TYPE; 255 = none).",
    }),
  },
  {
    description:
      "Foundation tectonic provenance tiles artifact payload (tile-space provenance scalars).",
  }
);

export const artifact = defineArtifact({
  name: "foundationTectonicProvenanceTiles",
  id: "artifact:map.foundationTectonicProvenanceTiles",
  schema: Schema,
});
