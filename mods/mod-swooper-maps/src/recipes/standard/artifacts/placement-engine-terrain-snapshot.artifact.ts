import { defineArtifact, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import { validateArtifactSchema } from "@swooper/mapgen-core/authoring/contracts";

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

type ValidationIssue = { message: string };

function issue(message: string): ValidationIssue {
  return { message };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isCount(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) >= 0;
}

/**
 * Validate hook for the terminal placement summary (placement-realignment
 * S6): every published count is measured, so anything non-finite or negative
 * is a publish-site bug, not gate noise.
 */

function validatePayload(value: unknown): ValidationIssue[] {
  if (!isRecord(value)) {
    return [issue("placementEngineTerrainSnapshot artifact must be an object.")];
  }
  const issues: ValidationIssue[] = [];
  const width = Number(value.width);
  const height = Number(value.height);
  const size = width * height;
  if (!Number.isSafeInteger(size) || size <= 0) {
    return [
      issue(
        `placementEngineTerrainSnapshot has invalid dimensions ${String(value.width)}x${String(value.height)}.`
      ),
    ];
  }
  for (const key of ["landMask", "terrain", "elevation"] as const) {
    const buffer = value[key] as { length?: number } | undefined;
    if (typeof buffer?.length !== "number" || buffer.length !== size) {
      issues.push(
        issue(
          `placementEngineTerrainSnapshot.${key} length ${String(buffer?.length)} != map size ${size}.`
        )
      );
    }
  }
  return issues;
}

export function validate(value: unknown): readonly { message: string }[] {
  return Object.freeze([...validateArtifactSchema(Schema, value), ...validatePayload(value)]);
}
