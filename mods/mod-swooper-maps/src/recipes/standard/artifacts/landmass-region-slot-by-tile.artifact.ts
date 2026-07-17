import {
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

function validatePayload(value: unknown): ValidationIssue[] {
  if (!isRecord(value)) return [issue("landmassRegionSlotByTile artifact must be an object.")];
  const slotByTile = value.slotByTile;
  if (!(slotByTile instanceof Uint8Array) || slotByTile.length === 0) {
    return [issue("landmassRegionSlotByTile.slotByTile must be a non-empty Uint8Array.")];
  }
  for (let i = 0; i < slotByTile.length; i++) {
    const slot = slotByTile[i] ?? 0;
    if (slot > 2) {
      return [issue(`slotByTile[${i}] = ${slot} outside the slot domain {0,1,2}.`)];
    }
  }
  return [];
}

/** Requires a nonempty Uint8 tile map whose values stay in `{0, 1, 2}`. */
export function validate(value: unknown): readonly { message: string }[] {
  return Object.freeze([...validateArtifactSchema(Schema, value), ...validatePayload(value)]);
}
