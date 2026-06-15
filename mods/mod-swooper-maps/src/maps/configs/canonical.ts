import { normalizeStrict } from "@swooper/mapgen-core/compiler/normalize";
import { type TObject, type TSchema, Type } from "typebox";

type JsonObject = Record<string, unknown>;

export type CanonicalMapConfigEnvelope = Readonly<{
  $schema?: string;
  id: string;
  name: string;
  description: string;
  recipe: "standard";
  sortIndex: number;
  latitudeBounds?: Readonly<{
    topLatitude: number;
    bottomLatitude: number;
  }>;
  logPrefix?: string;
  config: JsonObject;
}>;

export type CanonicalMapConfigWithRecipe = Readonly<{ config: JsonObject }>;

export type ValidatedMapConfig = CanonicalMapConfigEnvelope &
  Readonly<{
    fileName: string;
    fileStem: string;
    outputFile: string;
    localizationNameTag: string;
    localizationDescriptionTag: string;
  }>;

const ENVELOPE_KEYS = new Set([
  "$schema",
  "id",
  "name",
  "description",
  "recipe",
  "sortIndex",
  "latitudeBounds",
  "logPrefix",
  "config",
]);

export function isPlainObject(value: unknown): value is JsonObject {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function assertPlainObject(value: unknown, label: string, errors: string[]): value is JsonObject {
  if (isPlainObject(value)) return true;
  errors.push(`${label} must be a JSON object`);
  return false;
}

function stripRootSchema(value: JsonObject): JsonObject {
  const { $schema: _schema, ...rest } = value;
  return rest;
}

export function mapConfigFileStem(fileName: string): string {
  return fileName.replace(/\.config\.json$/i, "");
}

export function mapLocalizationTag(id: string, field: "name" | "description"): string {
  const suffix = field === "name" ? "NAME" : "DESCRIPTION";
  return `LOC_MAP_${id.toUpperCase().replace(/[^A-Z0-9]+/g, "_")}_${suffix}`;
}

/**
 * Returns the recipe payload inside a shipped-map envelope.
 *
 * The envelope is the Swooper Maps product record: it carries Civ7-facing map
 * identity, localization ordering, and save/deploy metadata. The nested config
 * remains the standard recipe's authored public surface, so callers that need
 * to run diagnostics or legacy preset aliases cross that boundary here instead
 * of inferring wrapper shapes in each consumer.
 */
export function canonicalRecipeConfig<TConfig extends JsonObject = JsonObject>(
  envelope: CanonicalMapConfigWithRecipe
): TConfig {
  return envelope.config as TConfig;
}

export function buildCanonicalMapConfigSchema(recipeConfigSchema: TSchema): TObject {
  return Type.Object(
    {
      $schema: Type.Optional(Type.String()),
      id: Type.String({ minLength: 1 }),
      name: Type.String({ minLength: 1 }),
      description: Type.String({ minLength: 1 }),
      recipe: Type.Literal("standard"),
      sortIndex: Type.Integer(),
      latitudeBounds: Type.Optional(
        Type.Object(
          {
            topLatitude: Type.Number(),
            bottomLatitude: Type.Number(),
          },
          { additionalProperties: false }
        )
      ),
      logPrefix: Type.Optional(Type.String({ minLength: 1 })),
      config: recipeConfigSchema,
    },
    { additionalProperties: false }
  );
}

export function validateCanonicalMapConfig(args: {
  fileName: string;
  raw: unknown;
  recipeSchema: TSchema;
  stages: readonly unknown[];
}): ValidatedMapConfig {
  const { fileName, raw, recipeSchema, stages } = args;
  void stages;
  const label = `/maps/configs/${fileName}`;
  const errors: string[] = [];
  const fileStem = mapConfigFileStem(fileName);

  if (!fileName.endsWith(".config.json")) {
    errors.push(`${label} must use the .config.json suffix`);
  }

  if (!assertPlainObject(raw, label, errors)) {
    throw new Error(errors.join("\n"));
  }

  for (const key of Object.keys(raw)) {
    if (!ENVELOPE_KEYS.has(key)) errors.push(`${label}/${key} is not a canonical map config key`);
  }

  if (raw.$schema !== undefined && typeof raw.$schema !== "string") {
    errors.push(`${label}/$schema must be a string`);
  }
  if (raw.id !== fileStem) errors.push(`${label}/id must match file stem "${fileStem}"`);
  if (typeof raw.name !== "string" || raw.name.trim().length === 0) {
    errors.push(`${label}/name must be a non-empty string`);
  }
  if (typeof raw.description !== "string" || raw.description.trim().length === 0) {
    errors.push(`${label}/description must be a non-empty string`);
  }
  if (raw.recipe !== "standard") {
    errors.push(`${label}/recipe must be "standard"`);
  }
  if (!Number.isInteger(raw.sortIndex)) {
    errors.push(`${label}/sortIndex must be an integer`);
  }

  if (raw.latitudeBounds !== undefined) {
    if (assertPlainObject(raw.latitudeBounds, `${label}/latitudeBounds`, errors)) {
      const { topLatitude, bottomLatitude } = raw.latitudeBounds;
      if (typeof topLatitude !== "number" || !Number.isFinite(topLatitude)) {
        errors.push(`${label}/latitudeBounds/topLatitude must be a finite number`);
      }
      if (typeof bottomLatitude !== "number" || !Number.isFinite(bottomLatitude)) {
        errors.push(`${label}/latitudeBounds/bottomLatitude must be a finite number`);
      }
      if (
        typeof topLatitude === "number" &&
        typeof bottomLatitude === "number" &&
        topLatitude <= bottomLatitude
      ) {
        errors.push(`${label}/latitudeBounds/topLatitude must be greater than bottomLatitude`);
      }
    }
  }

  if (
    raw.logPrefix !== undefined &&
    (typeof raw.logPrefix !== "string" || raw.logPrefix.trim().length === 0)
  ) {
    errors.push(`${label}/logPrefix must be a non-empty string when present`);
  }

  if (assertPlainObject(raw.config, `${label}/config`, errors)) {
    const authorConfig = stripRootSchema(raw.config);
    const { errors: schemaErrors } = normalizeStrict(recipeSchema, authorConfig, `${label}/config`);
    errors.push(...schemaErrors.map((err) => `${err.path}: ${err.message}`));
  }

  if (errors.length > 0) {
    throw new Error(
      `Invalid canonical map config ${fileName}:\n${errors.map((err) => `- ${err}`).join("\n")}`
    );
  }

  const envelope = raw as unknown as CanonicalMapConfigEnvelope;
  return {
    ...envelope,
    fileName,
    fileStem,
    outputFile: `${envelope.id}.js`,
    localizationNameTag: mapLocalizationTag(envelope.id, "name"),
    localizationDescriptionTag: mapLocalizationTag(envelope.id, "description"),
  };
}
