import type { ArtifactValidationContext } from "@swooper/mapgen-core/authoring/contracts";
import {
  appendArtifactTypedArrayIssues,
  artifactCellCount,
  defineArtifact,
  Type,
  TypedArraySchemas,
  validateArtifactSchema,
} from "@swooper/mapgen-core/authoring/contracts";

const LandmassRegionSlotByTileArtifactSchema = Type.Object(
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

/** Runtime contract for the gameplay region slot assigned to every map tile. */
export const Schema = LandmassRegionSlotByTileArtifactSchema;

/** Registers gameplay region slots derived from Morphology landmasses before placement. */
export const artifact = defineArtifact({
  name: "landmassRegionSlotByTile",
  id: "artifact:map.landmassRegionSlotByTile",
  schema: Schema,
});

type ValidationIssue = { message: string };

function issue(message: string): ValidationIssue {
  return { message };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** Validate hook for the projection metadata artifact (topology locks). */

function validatePayload(value: unknown, context?: ArtifactValidationContext): ValidationIssue[] {
  if (!isRecord(value)) return [issue("landmassRegionSlotByTile artifact must be an object.")];
  const issues: ValidationIssue[] = [];
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
export function validate(
  value: unknown,
  context?: ArtifactValidationContext
): readonly { message: string }[] {
  return Object.freeze([
    ...validateArtifactSchema(Schema, value),
    ...validatePayload(value, context),
  ]);
}
