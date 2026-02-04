import { Type, type Static } from "typebox";

type JsonObject = Record<string, unknown>;

function isPlainObject(value: unknown): value is JsonObject {
  if (value == null || typeof value !== "object" || Array.isArray(value)) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

export const RecipePresetDefinitionV1Schema = Type.Object(
  {
    $schema: Type.Optional(Type.String()),
    id: Type.Optional(Type.String()),
    label: Type.Optional(Type.String()),
    description: Type.Optional(Type.String()),
    config: Type.Object({}, { additionalProperties: true }),
  },
  { additionalProperties: false }
);

export type RecipePresetDefinitionV1 = Static<typeof RecipePresetDefinitionV1Schema>;

const StudioPresetExportPayloadSchema = Type.Object(
  {
    label: Type.String(),
    description: Type.Optional(Type.String()),
    config: Type.Object({}, { additionalProperties: true }),
  },
  { additionalProperties: false }
);

export const StudioPresetExportFileV1Schema = Type.Object(
  {
    $schema: Type.Optional(Type.String()),
    version: Type.Literal(1),
    recipeId: Type.String(),
    preset: StudioPresetExportPayloadSchema,
  },
  { additionalProperties: false }
);

export type StudioPresetExportFileV1 = Static<typeof StudioPresetExportFileV1Schema>;

export function derivePresetLabel(id: string): string {
  return id
    .split(/[-_]+/g)
    .filter((word) => word.length > 0)
    .map((word) => word[0]!.toUpperCase() + word.slice(1))
    .join(" ");
}

export function isPresetWrapper(value: unknown): value is RecipePresetDefinitionV1 {
  if (!isPlainObject(value)) return false;
  if ("$schema" in value && typeof value.$schema !== "string") return false;
  if ("id" in value && typeof value.id !== "string") return false;
  if ("label" in value && typeof value.label !== "string") return false;
  if ("description" in value && typeof value.description !== "string") return false;
  if (!("config" in value)) return false;
  const config = (value as JsonObject).config;
  return isPlainObject(config);
}
