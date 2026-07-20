import {
  defineArtifact,
  Type,
  validateArtifactSchema,
} from "@swooper/mapgen-core/authoring/contracts";

/** Surface preparation evidence (`artifact:placement.surfacePreparation`). One artifact per file by repo convention. */
const PlacementSurfacePreparationSchema = Type.Object(
  {
    width: Type.Integer({ minimum: 1 }),
    height: Type.Integer({ minimum: 1 }),
    slotCounts: Type.Object(
      {
        none: Type.Integer({ minimum: 0 }),
        west: Type.Integer({ minimum: 0 }),
        east: Type.Integer({ minimum: 0 }),
      },
      { additionalProperties: false }
    ),
    acceptedLakeTileCount: Type.Integer({
      minimum: 0,
      description: "Lake tiles accepted by map-hydrology projection before placement maintenance.",
    }),
    finalLakeWaterDriftCount: Type.Integer({
      minimum: 0,
      description:
        "Accepted lake tiles that no longer read as water after final placement surface maintenance.",
    }),
    finalLakeClassificationDriftCount: Type.Integer({
      minimum: 0,
      description:
        "Accepted lake tiles that no longer read as Civ7 lake tiles after final placement surface maintenance.",
    }),
  },
  {
    additionalProperties: false,
    description:
      "Transactional placement preparation result. This exists so resource/start/discovery products depend on a named prepared engine surface instead of a broad placement monolith, while retaining final evidence that engine maintenance did not dry projected lakes.",
  }
);

/** Runtime schema for the prepared engine surface and lake-preservation evidence. */
export const Schema = PlacementSurfacePreparationSchema;

/**
 * Registers evidence for the prepared engine-surface boundary that orders the
 * downstream resource, start, and discovery chain after terrain maintenance
 * and lake checks. Natural-wonder placement occurs before this boundary.
 */
export const artifact = defineArtifact({
  name: "placementSurfacePreparation",
  id: "artifact:placement.surfacePreparation",
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
 * Validate hook for the surface preparation evidence artifact
 * (placement-realignment S6): slot counts must total the grid size and the
 * lake drift counters must stay within the accepted lake corpus.
 */

function validatePayload(value: unknown): ValidationIssue[] {
  if (!isRecord(value)) return [issue("placementSurfacePreparation artifact must be an object.")];
  const issues: ValidationIssue[] = [];
  const width = Number(value.width);
  const height = Number(value.height);
  const size = width * height;
  if (!Number.isSafeInteger(size) || size <= 0) {
    return [
      issue(
        `placementSurfacePreparation has invalid dimensions ${String(value.width)}x${String(value.height)}.`
      ),
    ];
  }
  const slotCounts = isRecord(value.slotCounts) ? value.slotCounts : null;
  if (
    !slotCounts ||
    !isCount(slotCounts.none) ||
    !isCount(slotCounts.west) ||
    !isCount(slotCounts.east)
  ) {
    issues.push(issue("placementSurfacePreparation.slotCounts must carry none/west/east counts."));
  } else if (slotCounts.none + slotCounts.west + slotCounts.east !== size) {
    issues.push(
      issue(
        `slotCounts ${slotCounts.none}+${slotCounts.west}+${slotCounts.east} != map size ${size}.`
      )
    );
  }
  const accepted = value.acceptedLakeTileCount;
  for (const key of ["finalLakeWaterDriftCount", "finalLakeClassificationDriftCount"] as const) {
    const drift = value[key];
    if (!isCount(drift)) {
      issues.push(issue(`placementSurfacePreparation.${key} ${String(drift)} must be a count.`));
    } else if (isCount(accepted) && drift > accepted) {
      issues.push(issue(`${key} ${drift} exceeds acceptedLakeTileCount ${String(accepted)}.`));
    }
  }
  return issues;
}

/**
 * Requires slot counts to total the grid size and lake drift counts not to
 * exceed the accepted lake corpus.
 */
export function validate(value: unknown): readonly { message: string }[] {
  return Object.freeze([...validateArtifactSchema(Schema, value), ...validatePayload(value)]);
}
