import {
  type MapConfigEnvelope,
  mapConfigIdSchema,
  snapshotMapConfigEnvelope,
} from "@civ7/studio-contract";
import { sha256Hex, stableStringify } from "@swooper/mapgen-core";
import { type TObject, type TSchema, Type } from "typebox";
import { Value } from "typebox/value";
import { STANDARD_RECIPE_CONFIG_SCHEMA } from "../../recipes/standard/artifacts.js";
import type { StandardRecipeConfig } from "../../recipes/standard/recipe.js";
import { validateStandardMapConfigSnapshotForSchema } from "./standard-admission.js";

type JsonObject = MapConfigEnvelope["config"];

const CANONICAL_MAP_CONFIG_FILE_SUFFIX = ".config.json";

export type CanonicalMapConfigEnvelope = MapConfigEnvelope;

export type StandardMapConfigEnvelope = CanonicalMapConfigEnvelope &
  Readonly<{ recipe: "standard"; config: JsonObject & StandardRecipeConfig }>;

/** An admitted Standard map configuration paired with its canonical source filename. */
export type ValidatedMapConfig = Readonly<{
  canonicalConfig: StandardMapConfigEnvelope;
  fileName: string;
}>;

/**
 * Closed runtime envelope schema for Standard map configurations.
 * Studio and artifact generators use it to admit metadata and the compiled recipe surface through
 * the same boundary.
 */
export const STANDARD_MAP_CONFIG_ENVELOPE_SCHEMA = buildCanonicalMapConfigSchema();

/**
 * Canonical latitude window offered to callers constructing a Standard map envelope.
 * Admission requires explicit bounds and does not silently inject this default.
 */
export const DEFAULT_CANONICAL_MAP_LATITUDE_BOUNDS = {
  topLatitude: 80,
  bottomLatitude: -80,
} as const;

function isStandardMapConfigEnvelopeForSchema(
  value: CanonicalMapConfigEnvelope,
  recipeSchema: TSchema
): value is StandardMapConfigEnvelope {
  return value.recipe === "standard" && Value.Check(recipeSchema, value.config);
}

/**
 * Narrows an already canonical envelope when its discriminator and nested Standard config agree.
 * Use {@link admitStandardMapConfig} instead when the value still needs snapshot admission.
 */
export function isStandardMapConfigEnvelope(
  value: CanonicalMapConfigEnvelope
): value is StandardMapConfigEnvelope {
  return isStandardMapConfigEnvelopeForSchema(value, STANDARD_RECIPE_CONFIG_SCHEMA);
}

/** The Standard recipe's strict immutable admission boundary. */
export function admitStandardMapConfig(
  value: unknown,
  recipeSchema: TSchema = STANDARD_RECIPE_CONFIG_SCHEMA
): StandardMapConfigEnvelope {
  return admitStandardMapConfigWithSchema(value, recipeSchema);
}

/**
 * Admits a portable Standard envelope and returns the nested config consumed by recipe execution.
 * Generated entrypoints and test tooling use this boundary to keep catalog metadata out of the
 * recipe compiler.
 */
export function canonicalRecipeConfig(value: unknown): StandardRecipeConfig {
  return admitStandardMapConfig(value).config;
}

/**
 * Hashes only the authored recipe settings for configuration-content correlation.
 * Envelope metadata can therefore change without altering this digest.
 */
export function canonicalMapConfigContentDigest(config: StandardMapConfigEnvelope): string {
  return sha256Hex(stableStringify(config.config));
}

/**
 * Hashes the complete canonical envelope for catalog and provenance identity.
 * Metadata, latitude bounds, and recipe-setting changes all intentionally affect this digest.
 */
export function canonicalMapConfigDigest(config: CanonicalMapConfigEnvelope): string {
  return sha256Hex(stableStringify(config));
}

/**
 * Builds the closed map-envelope schema around a supplied Standard recipe schema.
 * Studio generation and focused tests substitute the current compiled recipe surface without
 * duplicating envelope rules.
 */
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
      config: recipeConfigSchema,
    },
    { additionalProperties: false }
  );
}

/**
 * Admits a raw map envelope and binds it to its source filename identity.
 * The filename stem must equal the admitted map id; renderers derive every other output identity
 * from that canonical id rather than carrying parallel cached names.
 */
export function validateCanonicalMapConfig(args: {
  fileName: string;
  raw: unknown;
  recipeSchema?: TSchema;
}): ValidatedMapConfig {
  assertCanonicalMapConfigFileName(args.fileName);
  const canonicalConfig = admitStandardMapConfigWithSchema(args.raw, args.recipeSchema);
  const fileStem = args.fileName.slice(0, -CANONICAL_MAP_CONFIG_FILE_SUFFIX.length);
  if (canonicalConfig.id !== fileStem) {
    throw new Error(
      `Canonical map config id must match file stem "${fileStem}", got "${canonicalConfig.id}".`
    );
  }
  return { canonicalConfig, fileName: args.fileName };
}

function assertCanonicalMapConfigFileName(fileName: string): void {
  if (!fileName.endsWith(CANONICAL_MAP_CONFIG_FILE_SUFFIX)) {
    throw new Error(
      `Canonical map config must use the ${CANONICAL_MAP_CONFIG_FILE_SUFFIX} suffix: ${fileName}`
    );
  }
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
function validateStandardMapConfigSnapshot(
  envelope: CanonicalMapConfigEnvelope,
  recipeSchema: TSchema = STANDARD_RECIPE_CONFIG_SCHEMA
): StandardMapConfigEnvelope {
  return validateStandardMapConfigSnapshotForSchema(
    envelope,
    recipeSchema
  ) as StandardMapConfigEnvelope;
}
