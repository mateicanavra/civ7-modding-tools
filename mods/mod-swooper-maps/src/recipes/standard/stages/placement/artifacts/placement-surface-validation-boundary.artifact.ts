import {
  type ArtifactValidationIssue,
  appendArtifactTypedArrayIssues,
  defineArtifact,
  type Static,
  Type,
  TypedArraySchemas,
} from "@swooper/mapgen-core/authoring/contracts";

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

/**
 * Runtime contract for the three engine-fact snapshots bracketing terrain validation and final
 * maintenance, allowing placement-surface drift to be localized to one boundary.
 */
const Schema = Type.Object(
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

/**
 * Registers engine facts before validation, after validation, and after final
 * maintenance so terrain/water/lake/area drift can be localized.
 */
export const artifact = defineArtifact({
  name: "placementSurfaceValidationBoundary",
  id: "artifact:map.placementSurfaceValidationBoundary",
  schema: Schema,
  refine: validateLocal,
});

/** Binds every boundary snapshot's typed engine surfaces to the payload dimensions. */
function validateLocal(input: unknown): ArtifactValidationIssue[] {
  const value = input as Static<typeof Schema>;
  const issues: ArtifactValidationIssue[] = [];
  const product = value.width * value.height;
  const size = Number.isSafeInteger(product) ? product : undefined;
  if (size === undefined) {
    issues.push({
      message: `placementSurfaceValidationBoundary dimensions ${value.width}x${value.height} exceed safe artifact cardinality.`,
    });
  }
  for (const key of ["beforeValidate", "afterValidate", "afterMaintenance"] as const) {
    const snapshot = value[key];
    appendArtifactTypedArrayIssues(issues, `${key}.terrain`, snapshot.terrain, Int32Array, size);
    appendArtifactTypedArrayIssues(
      issues,
      `${key}.waterMask`,
      snapshot.waterMask,
      Uint8Array,
      size
    );
    appendArtifactTypedArrayIssues(issues, `${key}.lakeMask`, snapshot.lakeMask, Uint8Array, size);
    appendArtifactTypedArrayIssues(issues, `${key}.areaId`, snapshot.areaId, Int32Array, size);
  }
  return issues;
}
