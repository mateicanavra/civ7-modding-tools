import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

const MapElevationEngineTerrainSnapshotArtifactSchema = Type.Object(
  {
    stage: Type.String({
      description: "Step identifier that produced this snapshot.",
    }),
    width: Type.Integer({ minimum: 1, description: "Map width in tiles." }),
    height: Type.Integer({ minimum: 1, description: "Map height in tiles." }),
    landMask: TypedArraySchemas.u8({
      description: "Engine-derived land mask after elevation materialization (1=land, 0=water).",
    }),
    terrain: TypedArraySchemas.u8({
      description: "Engine-derived terrain type snapshot after elevation materialization.",
    }),
    elevation: TypedArraySchemas.i16({
      description: "Engine-derived elevation snapshot after elevation materialization.",
    }),
  },
  {
    additionalProperties: false,
    description:
      "Engine terrain snapshot captured at the map-elevation boundary for projection diagnostics.",
  }
);

export const Schema = MapElevationEngineTerrainSnapshotArtifactSchema;

/**
 * Elevation readback belongs to map-elevation because Civ7 builds cliff and
 * shoreline relief from the already-projected terrain surface at this exact
 * lifecycle point. Keeping the artifact local prevents a root map catalog from
 * becoming a dumping ground for stage-owned diagnostics.
 */
export const artifact = defineArtifact({
  name: "elevationEngineTerrainSnapshot",
  id: "artifact:map.elevationEngineTerrainSnapshot",
  schema: Schema,
});
