import { defineArtifact, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

/** Nearest mesh cellIndex per tileIndex (canonical mesh to tile projection mapping). */
export const Schema = TypedArraySchemas.i32({
  shape: null,
  description: "Nearest mesh cellIndex per tileIndex (canonical mesh to tile projection mapping).",
});

export const artifact = defineArtifact({
  name: "foundationTileToCellIndex",
  id: "artifact:map.foundationTileToCellIndex",
  schema: Schema,
});
