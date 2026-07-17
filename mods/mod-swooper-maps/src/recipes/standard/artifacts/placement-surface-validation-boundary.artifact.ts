import {
  defineArtifact,
  Type,
  TypedArraySchemas,
  validateArtifactSchema,
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

/**
 * Runtime contract for the three engine-fact snapshots bracketing terrain validation and final
 * maintenance, allowing placement-surface drift to be localized to one boundary.
 */
export const Schema = PlacementSurfaceValidationBoundaryArtifactSchema;

/**
 * Registers engine facts before validation, after validation, and after final
 * maintenance so terrain/water/lake/area drift can be localized.
 */
export const artifact = defineArtifact({
  name: "placementSurfaceValidationBoundary",
  id: "artifact:map.placementSurfaceValidationBoundary",
  schema: Schema,
});

type ValidationIssue = { message: string };

function issue(message: string): ValidationIssue {
  return { message };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * Validate hook for the surface preparation evidence artifact
 * (placement-realignment S6): slot counts must partition the grid and the
 * lake drift counters must stay within the accepted lake corpus.
 */

function validatePayload(value: unknown): ValidationIssue[] {
  if (!isRecord(value)) {
    return [issue("placementSurfaceValidationBoundary artifact must be an object.")];
  }
  const issues: ValidationIssue[] = [];
  const width = Number(value.width);
  const height = Number(value.height);
  const size = width * height;
  if (!Number.isSafeInteger(size) || size <= 0) {
    return [
      issue(
        `placementSurfaceValidationBoundary has invalid dimensions ${String(value.width)}x${String(value.height)}.`
      ),
    ];
  }
  for (const key of ["beforeValidate", "afterValidate", "afterMaintenance"] as const) {
    const snapshot = isRecord(value[key]) ? (value[key] as Record<string, unknown>) : null;
    if (!snapshot) {
      issues.push(issue(`placementSurfaceValidationBoundary.${key} must be an object.`));
      continue;
    }
    for (const field of ["terrain", "waterMask", "lakeMask", "areaId"] as const) {
      const buffer = snapshot[field] as { length?: number } | undefined;
      if (typeof buffer?.length !== "number" || buffer.length !== size) {
        issues.push(issue(`${key}.${field} length ${String(buffer?.length)} != map size ${size}.`));
      }
    }
  }
  return issues;
}

/** Requires all three boundary snapshots and map-sized typed surfaces in each. */
export function validate(value: unknown): readonly { message: string }[] {
  return Object.freeze([...validateArtifactSchema(Schema, value), ...validatePayload(value)]);
}
