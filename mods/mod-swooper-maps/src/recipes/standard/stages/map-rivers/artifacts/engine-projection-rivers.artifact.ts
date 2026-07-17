import {
  defineArtifact,
  Type,
  TypedArraySchemas,
  validateArtifactSchema,
} from "@swooper/mapgen-core/authoring/contracts";

const MapRiversEngineProjectionArtifactSchema = Type.Object(
  {
    width: Type.Integer({ minimum: 1 }),
    height: Type.Integer({ minimum: 1 }),
    lakeMask: TypedArraySchemas.u8({
      description:
        "Engine water mask observed during river projection (1=water after river modeling).",
    }),
    riverMask: TypedArraySchemas.u8({
      description:
        "Engine navigable-river terrain mask after map-rivers projection (1=navigable river terrain).",
    }),
    engineRiverType: TypedArraySchemas.i32({
      description:
        "Civ7 river type metadata readback per tile using the runtime's no-river sentinel.",
    }),
    engineIsRiverMask: TypedArraySchemas.u8({
      description: "Civ7 river metadata readback (1=any river type).",
    }),
    engineNavigableRiverMask: TypedArraySchemas.u8({
      description:
        "Civ7 navigable-river readback from river metadata/API; raw terrain row readback is terrainNavigableRiverMask.",
    }),
    engineMinorRiverMask: TypedArraySchemas.u8({
      description:
        "Civ7 minor-river metadata readback. This is readback-only until a stable minor-river authoring API exists.",
    }),
    terrainNavigableRiverMask: TypedArraySchemas.u8({
      description: "Raw TERRAIN_NAVIGABLE_RIVER terrain readback per tile.",
    }),
    rejectedNavigableRiverMask: TypedArraySchemas.u8({
      description:
        "MapGen-selected navigable-river tiles absent from raw TERRAIN_NAVIGABLE_RIVER terrain readback.",
    }),
    sinkMismatchCount: Type.Integer({
      minimum: 0,
      description:
        "Count of hydrography sink tiles that remained non-water in the engine snapshot after river projection.",
    }),
    riverMismatchCount: Type.Integer({
      minimum: 0,
      description:
        "Count of tiles where projected navigable-river terrain and raw engine terrain readback diverged.",
    }),
    selectedRiverRejectedCount: Type.Integer({
      minimum: 0,
      description:
        "Count of MapGen-selected navigable-river terrain tiles absent from raw engine terrain readback after validation.",
    }),
    extraEngineRiverCount: Type.Integer({
      minimum: 0,
      description:
        "Count of raw engine navigable-river terrain tiles that were not selected by MapGen's river projection policy.",
    }),
    engineRiverTileCount: Type.Integer({
      minimum: 0,
      description: "Count of tiles with any Civ7 river metadata after projection.",
    }),
    engineNavigableRiverTileCount: Type.Integer({
      minimum: 0,
      description: "Count of tiles with Civ7 navigable-river readback after projection.",
    }),
    engineMinorRiverTileCount: Type.Integer({
      minimum: 0,
      description: "Count of tiles with Civ7 minor-river metadata after projection.",
    }),
    terrainNavigableRiverTileCount: Type.Integer({
      minimum: 0,
      description: "Count of tiles whose terrain row is TERRAIN_NAVIGABLE_RIVER.",
    }),
    minorRiverStampingSupported: Type.Boolean({
      description:
        "Whether this adapter/runtime exposes the native Civ river-type readback path needed to observe minor-river metadata after river materialization.",
    }),
    minorRiverUnsupportedReason: Type.String({
      minLength: 1,
      description:
        "Human-readable minor-river metadata boundary note; exact Hydrology parity still requires comparing planned minor intent to engine readback.",
    }),
  },
  {
    additionalProperties: false,
    description:
      "Observed map-rivers engine projection state, used to diagnose MapGen navigable-river terrain vs engine readback.",
  }
);

/** Runtime schema for Civ7 river readback, mismatch evidence, and capability disposition. */
export const Schema = MapRiversEngineProjectionArtifactSchema;

/**
 * River readback is separate from lake readback because Civ7 models rivers
 * after elevation, while lakes are static water terrain before elevation.
 */
export const artifact = defineArtifact({
  name: "engineProjectionRivers",
  id: "artifact:map.rivers.engineProjectionRivers",
  schema: Schema,
});

/**
 * Validates the closed river readback report, including typed masks, counts,
 * mismatch evidence, and the explicit minor-river capability disposition.
 */
export function validate(value: unknown): readonly { message: string }[] {
  return validateArtifactSchema(Schema, value);
}
