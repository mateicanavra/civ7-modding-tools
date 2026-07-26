import {
  type ArtifactValidationContext,
  type ArtifactValidationIssue,
  appendArtifactTypedArrayIssues,
  artifactCellCount,
  defineArtifact,
  defineArtifactValidator,
  type Static,
  Type,
  TypedArraySchemas,
} from "@swooper/mapgen-core/authoring/contracts";

/** Runtime contract for the gameplay region slot assigned to every map tile. */
export const Schema = Type.Object(
  {
    slotByTile: TypedArraySchemas.u8({
      description: "Per-tile landmass region slot (0=none, 1=west, 2=east), in tileIndex order.",
    }),
  },
  {
    additionalProperties: false,
    description:
      "Gameplay-owned region slot projection derived from Morphology landmasses (Phase 2: slots, not engine ids).",
  }
);

/** Registers gameplay region slots derived from Morphology landmasses before placement. */
export const artifact = defineArtifact({
  name: "landmassRegionSlotByTile",
  id: "artifact:map.landmassRegionSlotByTile",
  schema: Schema,
});

function issue(message: string): ArtifactValidationIssue {
  return { message };
}

/** Enforces map cardinality and the closed gameplay-region slot domain. */
function validateLocal(
  input: unknown,
  context?: ArtifactValidationContext
): ArtifactValidationIssue[] {
  const value = input as Static<typeof Schema>;
  const issues: ArtifactValidationIssue[] = [];
  const slotByTile = value.slotByTile;
  if (
    !appendArtifactTypedArrayIssues(
      issues,
      "landmassRegionSlotByTile.slotByTile",
      slotByTile,
      Uint8Array,
      artifactCellCount(context)
    )
  ) {
    return issues;
  }
  if (slotByTile.length === 0) {
    issues.push(issue("landmassRegionSlotByTile.slotByTile must be non-empty."));
    return issues;
  }
  for (let i = 0; i < slotByTile.length; i++) {
    const slot = slotByTile[i] ?? 0;
    if (slot > 2) {
      issues.push(issue(`slotByTile[${i}] = ${slot} outside the slot domain {0,1,2}.`));
      return issues;
    }
  }
  return issues;
}

/** Requires a nonempty Uint8 tile map whose values stay in `{0, 1, 2}`. */
export const validate = defineArtifactValidator(artifact, validateLocal);
