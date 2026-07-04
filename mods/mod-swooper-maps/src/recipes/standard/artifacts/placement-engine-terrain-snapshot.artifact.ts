import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

const EngineTerrainSnapshotArtifactSchema = Type.Object(
  {
    stage: Type.String({
      description: "Step identifier that produced this snapshot (e.g. map-hydrology/lakes).",
    }),
    width: Type.Integer({ minimum: 1, description: "Map width in tiles." }),
    height: Type.Integer({ minimum: 1, description: "Map height in tiles." }),
    landMask: TypedArraySchemas.u8({
      description: "Engine-derived land mask snapshot (1=land, 0=water), tile order.",
    }),
    terrain: TypedArraySchemas.u8({
      description: "Engine-derived terrain type snapshot (tile order).",
    }),
    elevation: TypedArraySchemas.i16({
      description: "Engine-derived elevation snapshot (tile order).",
    }),
  },
  {
    additionalProperties: false,
    description:
      "Machine-readable engine terrain snapshot captured at a projection boundary for parity diagnostics.",
  }
);

export const Schema = EngineTerrainSnapshotArtifactSchema;

export const artifact = defineArtifact({
  name: "placementEngineTerrainSnapshot",
  id: "artifact:map.placementEngineTerrainSnapshot",
  schema: Schema,
});
