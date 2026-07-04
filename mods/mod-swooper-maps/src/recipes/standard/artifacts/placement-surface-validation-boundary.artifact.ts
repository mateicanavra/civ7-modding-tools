import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

const EngineTerrainFactsSnapshotSchema = Type.Object(
  {
    stage: Type.String({
      description: "Step boundary that produced this terrain fact snapshot.",
    }),
    terrain: TypedArraySchemas.i32({
      description: "Engine terrain type readback at this boundary.",
    }),
    waterMask: TypedArraySchemas.u8({
      description: "Engine isWater readback at this boundary (1=water,0=not water).",
    }),
    lakeMask: TypedArraySchemas.u8({
      description: "Engine isLake readback at this boundary (1=lake,0=not lake).",
    }),
    areaId: TypedArraySchemas.i32({
      description: "Engine area id readback at this boundary.",
    }),
  },
  {
    additionalProperties: false,
    description: "Engine terrain/water/lake/area facts captured at a maintenance boundary.",
  }
);

const PlacementSurfaceValidationBoundaryArtifactSchema = Type.Object(
  {
    width: Type.Integer({ minimum: 1 }),
    height: Type.Integer({ minimum: 1 }),
    beforeValidate: EngineTerrainFactsSnapshotSchema,
    afterValidate: EngineTerrainFactsSnapshotSchema,
    afterMaintenance: EngineTerrainFactsSnapshotSchema,
  },
  {
    additionalProperties: false,
    description:
      "Diagnostic placement surface readback around validateAndFixTerrain, area recalculation, and water cache storage.",
  }
);

export const Schema = PlacementSurfaceValidationBoundaryArtifactSchema;

export const artifact = defineArtifact({
  name: "placementSurfaceValidationBoundary",
  id: "artifact:map.placementSurfaceValidationBoundary",
  schema: Schema,
});
