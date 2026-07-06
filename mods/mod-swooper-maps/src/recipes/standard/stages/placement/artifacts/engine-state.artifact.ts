import {
  defineArtifact,
  Type,
  TypedArraySchemas,
  validateArtifactSchema,
} from "@swooper/mapgen-core/authoring/contracts";

/** Terminal engine-state evidence (`artifact:placementEngineState`). One artifact per file by repo convention. */
const PlacementEngineStateV1Schema = Type.Object(
  {
    width: Type.Integer({ minimum: 1 }),
    height: Type.Integer({ minimum: 1 }),
    slotByTile: TypedArraySchemas.u8({
      description: "Requested landmass slot by tile at placement time (0=none,1=west,2=east).",
    }),
    engineLandMask: TypedArraySchemas.u8({
      description: "Engine land mask snapshot at end of placement (1=land,0=water).",
    }),
    slotCounts: Type.Object(
      {
        none: Type.Integer({ minimum: 0 }),
        west: Type.Integer({ minimum: 0 }),
        east: Type.Integer({ minimum: 0 }),
      },
      { additionalProperties: false }
    ),
    startsAssigned: Type.Integer({ minimum: 0 }),
    wondersPlanned: Type.Integer({ minimum: 0 }),
    wondersPlaced: Type.Integer({ minimum: 0 }),
    wondersError: Type.Optional(Type.String()),
    resourcesAttempted: Type.Boolean(),
    resourcesPlaced: Type.Integer({ minimum: 0 }),
    resourcesError: Type.Optional(Type.String()),
    discoveriesPlanned: Type.Integer({ minimum: 0 }),
    discoveriesPlaced: Type.Integer({ minimum: 0 }),
    discoveriesError: Type.Optional(Type.String()),
    waterDriftCount: Type.Integer({
      minimum: 0,
      description:
        "Mismatch count between physics landMask and engine landMask at placement completion.",
    }),
  },
  { additionalProperties: false }
);

export const Schema = PlacementEngineStateV1Schema;

export const artifact = defineArtifact({
  name: "engineState",
  id: "artifact:placementEngineState",
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
  if (!isRecord(value)) return [issue("engineState artifact must be an object.")];
  const issues: ValidationIssue[] = [];
  const width = Number(value.width);
  const height = Number(value.height);
  const size = width * height;
  if (!Number.isSafeInteger(size) || size <= 0) {
    return [
      issue(`engineState has invalid dimensions ${String(value.width)}x${String(value.height)}.`),
    ];
  }
  for (const key of ["slotByTile", "engineLandMask"] as const) {
    const buffer = value[key] as { length?: number } | undefined;
    if (typeof buffer?.length !== "number" || buffer.length !== size) {
      issues.push(
        issue(`engineState.${key} length ${String(buffer?.length)} != map size ${size}.`)
      );
    }
  }
  const slotCounts = isRecord(value.slotCounts) ? value.slotCounts : null;
  if (
    !slotCounts ||
    !isCount(slotCounts.none) ||
    !isCount(slotCounts.west) ||
    !isCount(slotCounts.east)
  ) {
    issues.push(issue("engineState.slotCounts must carry none/west/east counts."));
  } else if (slotCounts.none + slotCounts.west + slotCounts.east !== size) {
    issues.push(
      issue(
        `slotCounts ${slotCounts.none}+${slotCounts.west}+${slotCounts.east} != map size ${size}.`
      )
    );
  }
  if (
    isCount(value.wondersPlanned) &&
    isCount(value.wondersPlaced) &&
    value.wondersPlaced > value.wondersPlanned
  ) {
    issues.push(
      issue(`wondersPlaced ${value.wondersPlaced} exceeds wondersPlanned ${value.wondersPlanned}.`)
    );
  }
  if (
    isCount(value.discoveriesPlanned) &&
    isCount(value.discoveriesPlaced) &&
    value.discoveriesPlaced > value.discoveriesPlanned
  ) {
    issues.push(
      issue(
        `discoveriesPlaced ${value.discoveriesPlaced} exceeds discoveriesPlanned ${value.discoveriesPlanned}.`
      )
    );
  }
  return issues;
}

export function validate(value: unknown): readonly { message: string }[] {
  return Object.freeze([...validateArtifactSchema(Schema, value), ...validatePayload(value)]);
}
