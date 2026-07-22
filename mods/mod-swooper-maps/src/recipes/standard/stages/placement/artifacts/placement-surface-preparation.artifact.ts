import {
  type ArtifactValidationIssue,
  defineArtifact,
  defineArtifactValidator,
  type Static,
  Type,
} from "@swooper/mapgen-core/authoring/contracts";

/** Runtime schema for the prepared engine surface and lake-preservation evidence. */
export const Schema = Type.Object(
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

function issue(message: string): ArtifactValidationIssue {
  return { message };
}

/**
 * Validate hook for the surface preparation evidence artifact
 * (placement-realignment S6): slot counts must total the grid size and the
 * lake drift counters must stay within the accepted lake corpus.
 */

function validateLocal(input: unknown): ArtifactValidationIssue[] {
  const value = input as Static<typeof Schema>;
  const issues: ArtifactValidationIssue[] = [];
  const size = value.width * value.height;
  if (!Number.isSafeInteger(size) || size <= 0) {
    return [
      issue(
        `placementSurfacePreparation has invalid dimensions ${String(value.width)}x${String(value.height)}.`
      ),
    ];
  }
  const { slotCounts } = value;
  if (slotCounts.none + slotCounts.west + slotCounts.east !== size) {
    issues.push(
      issue(
        `slotCounts ${slotCounts.none}+${slotCounts.west}+${slotCounts.east} != map size ${size}.`
      )
    );
  }
  const accepted = value.acceptedLakeTileCount;
  for (const key of ["finalLakeWaterDriftCount", "finalLakeClassificationDriftCount"] as const) {
    const drift = value[key];
    if (drift > accepted) {
      issues.push(issue(`${key} ${drift} exceeds acceptedLakeTileCount ${String(accepted)}.`));
    }
  }
  return issues;
}

/**
 * Requires slot counts to total the grid size and lake drift counts not to
 * exceed the accepted lake corpus.
 */
export const validate = defineArtifactValidator(artifact, validateLocal);
