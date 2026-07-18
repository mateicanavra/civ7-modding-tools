import {
  appendArtifactTypedArrayIssues,
  defineArtifact,
  Type,
  TypedArraySchemas,
  validateArtifactSchema,
} from "@swooper/mapgen-core/authoring/contracts";

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

/** Runtime contract for the terminal placement terrain readback used in parity checks. */
export const Schema = EngineTerrainSnapshotArtifactSchema;

/** Registers the final placement-boundary engine terrain readback for parity diagnostics. */
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

function validatePayload(value: unknown): ValidationIssue[] {
  if (!isRecord(value)) {
    return [issue("placementEngineTerrainSnapshot artifact must be an object.")];
  }
  const issues: ValidationIssue[] = [];
  const width = Number(value.width);
  const height = Number(value.height);
  const product = width * height;
  const size = Number.isSafeInteger(product) && product > 0 ? product : undefined;
  if (size === undefined) {
    issues.push(
      issue(
        `placementEngineTerrainSnapshot has invalid dimensions ${String(value.width)}x${String(value.height)}.`
      )
    );
  }
  appendArtifactTypedArrayIssues(
    issues,
    "placementEngineTerrainSnapshot.landMask",
    value.landMask,
    Uint8Array,
    size
  );
  appendArtifactTypedArrayIssues(
    issues,
    "placementEngineTerrainSnapshot.terrain",
    value.terrain,
    Uint8Array,
    size
  );
  appendArtifactTypedArrayIssues(
    issues,
    "placementEngineTerrainSnapshot.elevation",
    value.elevation,
    Int16Array,
    size
  );
  return issues;
}

/** Validates positive dimensions and map-sized land, terrain, and elevation surfaces. */
export function validate(value: unknown): readonly { message: string }[] {
  return Object.freeze([...validateArtifactSchema(Schema, value), ...validatePayload(value)]);
}
