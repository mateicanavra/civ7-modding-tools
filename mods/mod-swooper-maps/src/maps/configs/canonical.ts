import {
  type MapConfigEnvelope,
  mapConfigIdSchema,
  snapshotMapConfigEnvelope,
} from "@civ7/studio-contract";
import { sha256Hex, stableStringify } from "@swooper/mapgen-core";
import { normalizeStrict } from "@swooper/mapgen-core/compiler/normalize";
import { type TObject, type TSchema, Type } from "typebox";
import { Value } from "typebox/value";
import {
  buildStandardRecipeDefaultConfig,
  STANDARD_RECIPE_CONFIG_SCHEMA,
} from "../../recipes/standard/artifacts.js";
import type { StandardRecipeConfig } from "../../recipes/standard/recipe.js";

type JsonObject = MapConfigEnvelope["config"];

export type CanonicalMapConfigEnvelope = MapConfigEnvelope;

export type StandardMapConfigEnvelope = CanonicalMapConfigEnvelope &
  Readonly<{ recipe: "standard"; config: JsonObject & StandardRecipeConfig }>;

/** The portable config record that may cross catalog and launch boundaries. */
export type MaterializedCanonicalMapConfig = StandardMapConfigEnvelope;

export type ValidatedMapConfig = Readonly<{
  canonicalConfig: StandardMapConfigEnvelope;
  fileName: string;
  fileStem: string;
  outputFile: string;
  localizationNameTag: string;
  localizationDescriptionTag: string;
}>;

export const STANDARD_MAP_CONFIG_ENVELOPE_SCHEMA = buildCanonicalMapConfigSchema();

export const DEFAULT_CANONICAL_MAP_LATITUDE_BOUNDS = {
  topLatitude: 80,
  bottomLatitude: -80,
} as const;

type StandardRecipeConfigValidation = Readonly<{
  complete: boolean;
  errors: readonly string[];
}>;

export function createStandardRecipeDefaultConfig(): StandardRecipeConfig {
  return buildStandardRecipeDefaultConfig();
}

function strictStandardRecipeConfigValidation(
  value: unknown,
  recipeSchema: TSchema
): StandardRecipeConfigValidation {
  const normalized = normalizeStrict<Record<string, unknown>>(recipeSchema, value, "/config");
  if (normalized.errors.length > 0) {
    return {
      complete: false,
      errors: normalized.errors.map((error) => `${error.path}: ${error.message}`),
    } as const;
  }
  return {
    complete: Value.Equal(normalized.value, value),
    errors: [] as readonly string[],
  } as const;
}

function isCompleteStandardMapConfig(
  value: CanonicalMapConfigEnvelope,
  validation: StandardRecipeConfigValidation
): value is StandardMapConfigEnvelope {
  return value.recipe === "standard" && validation.complete;
}

export function isStandardMapConfigEnvelope(
  value: CanonicalMapConfigEnvelope
): value is StandardMapConfigEnvelope {
  return isCompleteStandardMapConfig(
    value,
    strictStandardRecipeConfigValidation(value.config, STANDARD_RECIPE_CONFIG_SCHEMA)
  );
}

/** The Standard recipe's strict immutable admission boundary. */
export function admitStandardMapConfig(
  value: unknown,
  recipeSchema: TSchema = STANDARD_RECIPE_CONFIG_SCHEMA
): StandardMapConfigEnvelope {
  return admitStandardMapConfigWithSchema(value, recipeSchema);
}

export function canonicalRecipeConfig(value: unknown): StandardRecipeConfig {
  return admitStandardMapConfig(value).config;
}

export function canonicalMapConfigContentDigest(config: StandardMapConfigEnvelope): string {
  return sha256Hex(stableStringify(config.config));
}

export function canonicalMapConfigDigest(config: StandardMapConfigEnvelope): string {
  return sha256Hex(stableStringify(config));
}

export function buildCanonicalMapConfigSchema(
  recipeConfigSchema: TSchema = STANDARD_RECIPE_CONFIG_SCHEMA
): TObject {
  return Type.Object(
    {
      id: mapConfigIdSchema,
      name: Type.String({ minLength: 1 }),
      description: Type.String({ minLength: 1 }),
      recipe: Type.Literal("standard"),
      sortIndex: Type.Integer(),
      latitudeBounds: Type.Object(
        {
          topLatitude: Type.Number(),
          bottomLatitude: Type.Number(),
        },
        { additionalProperties: false }
      ),
      logPrefix: Type.Optional(Type.String({ minLength: 1 })),
      config: recipeConfigSchema,
    },
    { additionalProperties: false }
  );
}

export function mapConfigFileStem(fileName: string): string {
  return fileName.replace(/\.config\.json$/i, "");
}

export function mapLocalizationTag(id: string, field: "name" | "description"): string {
  const suffix = field === "name" ? "NAME" : "DESCRIPTION";
  return `LOC_MAP_${id.toUpperCase().replace(/[^A-Z0-9]+/g, "_")}_${suffix}`;
}

export function validateCanonicalMapConfig(args: {
  fileName: string;
  raw: unknown;
  recipeSchema?: TSchema;
}): ValidatedMapConfig {
  assertCanonicalMapConfigFileName(args.fileName);
  return validatedMapConfig(
    args.fileName,
    admitStandardMapConfigWithSchema(args.raw, args.recipeSchema)
  );
}

function assertCanonicalMapConfigFileName(fileName: string): void {
  if (!fileName.endsWith(".config.json")) {
    throw new Error(`Canonical map config must use the .config.json suffix: ${fileName}`);
  }
}

function validatedMapConfig(
  fileName: string,
  canonicalConfig: StandardMapConfigEnvelope
): ValidatedMapConfig {
  const fileStem = mapConfigFileStem(fileName);
  if (canonicalConfig.id !== fileStem) {
    throw new Error(
      `Canonical map config id must match file stem "${fileStem}", got "${canonicalConfig.id}".`
    );
  }
  return {
    canonicalConfig,
    fileName,
    fileStem,
    outputFile: `${canonicalConfig.id}.js`,
    localizationNameTag: mapLocalizationTag(canonicalConfig.id, "name"),
    localizationDescriptionTag: mapLocalizationTag(canonicalConfig.id, "description"),
  };
}

function admitStandardMapConfigWithSchema(
  value: unknown,
  recipeSchema: TSchema = STANDARD_RECIPE_CONFIG_SCHEMA
): StandardMapConfigEnvelope {
  const envelope = snapshotMapConfigEnvelope(value);
  if (envelope === undefined) {
    throw new Error("Map config must be a complete portable config envelope.");
  }
  return validateStandardMapConfigSnapshot(envelope, recipeSchema);
}

/** Validates Standard semantics on a canonical immutable envelope without rebuilding it. */
export function validateStandardMapConfigSnapshot(
  envelope: CanonicalMapConfigEnvelope,
  recipeSchema: TSchema = STANDARD_RECIPE_CONFIG_SCHEMA
): StandardMapConfigEnvelope {
  if (envelope.recipe !== "standard") {
    throw new Error(
      `Map config must use the Standard recipe, got ${JSON.stringify(envelope.recipe)}.`
    );
  }
  const validation = strictStandardRecipeConfigValidation(envelope.config, recipeSchema);
  if (validation.errors.length > 0) {
    throw new Error(
      `Map config must carry a complete recipe config JSON:\n${validation.errors
        .map((error) => `- ${error}`)
        .join("\n")}`
    );
  }
  if (!validation.complete) {
    throw new Error("Map config must carry a complete recipe config JSON.");
  }
  if (envelope.latitudeBounds.topLatitude <= envelope.latitudeBounds.bottomLatitude) {
    throw new Error("Map config latitudeBounds.topLatitude must exceed bottomLatitude.");
  }
  if (!isCompleteStandardMapConfig(envelope, validation)) {
    throw new Error("Map config must carry a complete recipe config JSON.");
  }
  return envelope;
}
