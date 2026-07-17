import {
  defineArtifact,
  Type,
  TypedArraySchemas,
  validateArtifactSchema,
} from "@swooper/mapgen-core/authoring/contracts";

const VolcanoKindSchema = Type.Union([
  Type.Literal("subductionArc"),
  Type.Literal("rift"),
  Type.Literal("hotspot"),
]);

const MorphologyVolcanoesArtifactSchema = Type.Object(
  {
    volcanoMask: TypedArraySchemas.u8({
      description: "Mask (1/0): tiles containing a volcano vent.",
    }),
    volcanoes: Type.Immutable(
      Type.Array(
        Type.Object(
          {
            tileIndex: Type.Integer({ minimum: 0, description: "Tile index in row-major order." }),
            kind: VolcanoKindSchema,
            strength01: Type.Number({
              minimum: 0,
              maximum: 1,
              description: "Normalized intensity (0..1) derived from volcanism driver strength.",
            }),
          },
          { additionalProperties: false }
        )
      )
    ),
  },
  {
    additionalProperties: false,
    description: "Volcano intent snapshot (Phase 2 schema; immutable at F2).",
  }
);

/** Runtime schema for immutable volcano vents and their map-tile-sized intent mask. */
export const Schema = MorphologyVolcanoesArtifactSchema;

/** Registers immutable volcano intent and its tile mask for later Civ7 projection. */
export const artifact = defineArtifact({
  name: "volcanoes",
  id: "artifact:morphology.volcanoes",
  schema: Schema,
});

type ArtifactValidationIssue = Readonly<{ message: string }>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function validatePayload(value: unknown): ArtifactValidationIssue[] {
  if (!isRecord(value)) {
    return [{ message: "Missing volcanoes artifact." }];
  }
  const candidate = value as { volcanoMask?: unknown; volcanoes?: unknown };
  if (!(candidate.volcanoMask instanceof Uint8Array)) {
    return [{ message: "Expected volcanoes.volcanoMask to be a Uint8Array." }];
  }
  if (!Array.isArray(candidate.volcanoes)) {
    return [{ message: "Expected volcanoes.volcanoes to be an array." }];
  }
  for (const entry of candidate.volcanoes) {
    if (!isRecord(entry) || typeof entry.tileIndex !== "number" || entry.tileIndex < 0) {
      return [
        { message: "Expected volcanoes.volcanoes entries to include a non-negative tileIndex." },
      ];
    }
    if (entry.kind !== "subductionArc" && entry.kind !== "rift" && entry.kind !== "hotspot") {
      return [{ message: "Expected volcanoes.volcanoes entries to include a Phase 2 kind." }];
    }
    if (typeof entry.strength01 !== "number" || entry.strength01 < 0 || entry.strength01 > 1) {
      return [
        { message: "Expected volcanoes.volcanoes entries to include strength01 within [0,1]." },
      ];
    }
  }
  return [];
}

/**
 * Validates the volcano mask and each vent's nonnegative tile index, admitted
 * tectonic kind, and normalized strength in `[0, 1]`.
 */
export function validate(value: unknown): readonly { message: string }[] {
  return Object.freeze([...validateArtifactSchema(Schema, value), ...validatePayload(value)]);
}
