import {
  defineArtifact,
  Type,
  TypedArraySchemas,
  validateArtifactSchema,
} from "@swooper/mapgen-core/authoring/contracts";

const MorphologyLandmassArtifactSchema = Type.Object(
  {
    id: Type.Integer({ minimum: 0, description: "Stable index within this snapshot (0..n-1)." }),
    tileCount: Type.Integer({ minimum: 0, description: "Number of land tiles in this landmass." }),
    coastlineLength: Type.Integer({
      minimum: 0,
      description:
        "Count of land↔water adjacency edges along the coastline (canonical hex neighbor graph; wrapX=true).",
    }),
    bbox: Type.Object(
      {
        west: Type.Integer({
          minimum: 0,
          description: "West bound (inclusive) in tile x-coordinates.",
        }),
        east: Type.Integer({
          minimum: 0,
          description: "East bound (inclusive) in tile x-coordinates.",
        }),
        south: Type.Integer({
          minimum: 0,
          description: "South bound (inclusive) in tile y-coordinates.",
        }),
        north: Type.Integer({
          minimum: 0,
          description: "North bound (inclusive) in tile y-coordinates.",
        }),
      },
      {
        additionalProperties: false,
        description:
          "Axis-aligned bounds in tile coordinates. Note: west/east may wrap if a landmass crosses the map seam.",
      }
    ),
  },
  {
    additionalProperties: false,
    description: "One connected land component derived from the landMask (Phase 2 schema).",
  }
);

const MorphologyLandmassesArtifactSchema = Type.Object(
  {
    landmasses: Type.Immutable(Type.Array(MorphologyLandmassArtifactSchema)),
    landmassIdByTile: TypedArraySchemas.i32({
      description:
        "Per-tile landmass component id (-1 for water). Values map to the landmasses[] entries.",
    }),
  },
  {
    additionalProperties: false,
    description: "Landmass decomposition snapshot (Phase 2 schema; immutable at F2).",
  }
);

export const Schema = MorphologyLandmassesArtifactSchema;

export const artifact = defineArtifact({
  name: "landmasses",
  id: "artifact:morphology.landmasses",
  schema: Schema,
});

type ArtifactValidationIssue = Readonly<{ message: string }>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function validatePayload(value: unknown): ArtifactValidationIssue[] {
  const errors: ArtifactValidationIssue[] = [];
  if (!isRecord(value)) {
    errors.push({ message: "Missing landmasses snapshot." });
    return errors;
  }

  const candidate = value as { landmasses?: unknown; landmassIdByTile?: unknown };
  if (!Array.isArray(candidate.landmasses)) {
    errors.push({ message: "Expected landmasses.landmasses to be an array." });
  } else {
    for (const entry of candidate.landmasses) {
      if (!isRecord(entry)) {
        errors.push({ message: "Expected landmasses.landmasses entries to be objects." });
        continue;
      }
      if (typeof entry.id !== "number" || entry.id < 0) {
        errors.push({
          message: "Expected landmasses.landmasses entries to include a non-negative id.",
        });
      }
      if (typeof entry.tileCount !== "number" || entry.tileCount < 0) {
        errors.push({
          message: "Expected landmasses.landmasses entries to include a non-negative tileCount.",
        });
      }
      if (typeof entry.coastlineLength !== "number" || entry.coastlineLength < 0) {
        errors.push({
          message:
            "Expected landmasses.landmasses entries to include a non-negative coastlineLength.",
        });
      }
      const bbox = (entry as { bbox?: unknown }).bbox;
      if (!isRecord(bbox)) {
        errors.push({ message: "Expected landmasses.landmasses entries to include bbox." });
      }
    }
  }
  if (!(candidate.landmassIdByTile instanceof Int32Array)) {
    errors.push({ message: "Expected landmasses.landmassIdByTile to be an Int32Array." });
  }

  return errors;
}

export function validate(value: unknown): readonly { message: string }[] {
  return Object.freeze([...validateArtifactSchema(Schema, value), ...validatePayload(value)]);
}
