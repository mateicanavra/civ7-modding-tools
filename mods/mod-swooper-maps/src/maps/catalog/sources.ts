import { CatalogSourceIndex } from "./sourceIndex.js";

export const CATALOG_CONFIG_PATH_PREFIX = "mods/mod-swooper-maps/src/maps/configs/";
export const CATALOG_CONFIG_PATH_SUFFIX = ".config.json";
const ENTRY_KEYS = new Set([
  "catalogSourceId",
  "configPath",
  "name",
  "description",
  "recipe",
  "sortIndex",
  "latitudeBounds",
  "digestInputs",
]);
const DIGEST_INPUT_KEYS = new Set(["kind", "path"]);
const LATITUDE_BOUNDS_KEYS = new Set(["topLatitude", "bottomLatitude"]);

type JsonObject = Record<string, unknown>;

export type CatalogSourceDigestInput = Readonly<{
  kind: "config-file";
  path: string;
}>;

export type CatalogSourceEntryDefinition = Readonly<{
  catalogSourceId: string;
  configPath: string;
  name: string;
  description: string;
  recipe: "standard";
  sortIndex: number;
  latitudeBounds?: Readonly<{
    topLatitude: number;
    bottomLatitude: number;
  }>;
}>;

export type CatalogSourceEntry = Readonly<{
  catalogSourceId: string;
  configPath: string;
  name: string;
  description: string;
  recipe: "standard";
  sortIndex: number;
  latitudeBounds?: Readonly<{
    topLatitude: number;
    bottomLatitude: number;
  }>;
  digestInputs: readonly [CatalogSourceDigestInput];
}>;

export type CatalogSourceIndexValidationOptions = Readonly<{
  knownConfigPaths?: ReadonlySet<string>;
  configMetadataByPath?: ReadonlyMap<
    string,
    Readonly<{
      id: string;
      name: string;
      description: string;
      recipe: string;
      sortIndex: number;
      latitudeBounds?: unknown;
    }>
  >;
}>;

export type CatalogSourceIndexReadOptions = CatalogSourceIndexValidationOptions &
  Readonly<{
    knownConfigPaths: ReadonlySet<string>;
  }>;

export type CatalogSourceIndexValidationResult = Readonly<{
  ok: true;
  entries: readonly CatalogSourceEntry[];
}>;

/**
 * Reads the tracked source index through the validation boundary.
 *
 * Callers consume catalog membership through this function so later packets can
 * change the backing file format without allowing path scans to become another
 * source of catalog truth.
 */
export function readCatalogSourceIndex(
  options: CatalogSourceIndexReadOptions
): readonly CatalogSourceEntry[] {
  return parseCatalogSourceIndex(CatalogSourceIndex, options).entries;
}

export function parseCatalogSourceIndex(
  value: unknown,
  options: CatalogSourceIndexValidationOptions = {}
): CatalogSourceIndexValidationResult {
  const errors = validateCatalogSourceIndex(value, options);
  if (errors.length > 0) {
    throw new Error(
      `Invalid Swooper catalog source index:\n${errors.map((error) => `- ${error}`).join("\n")}`
    );
  }
  return { ok: true, entries: value as readonly CatalogSourceEntry[] };
}

export function catalogConfigFileNameFromPath(configPath: string): string {
  if (
    !configPath.startsWith(CATALOG_CONFIG_PATH_PREFIX) ||
    !configPath.endsWith(CATALOG_CONFIG_PATH_SUFFIX) ||
    configPath.includes("..")
  ) {
    throw new Error(
      `Catalog source config path must point at ${CATALOG_CONFIG_PATH_PREFIX}*${CATALOG_CONFIG_PATH_SUFFIX}`
    );
  }
  return configPath.slice(CATALOG_CONFIG_PATH_PREFIX.length);
}

export function validateCatalogSourceIndex(
  value: unknown,
  options: CatalogSourceIndexValidationOptions = {}
): string[] {
  const errors: string[] = [];
  if (!Array.isArray(value)) return ["CatalogSourceIndex must be an array"];

  const seenIds = new Map<string, number>();
  const seenPaths = new Map<string, number>();

  value.forEach((entry, index) => {
    const label = `CatalogSourceIndex[${index}]`;
    if (!isPlainObject(entry)) {
      errors.push(`${label} must be an object`);
      return;
    }
    validateAllowedKeys(entry, ENTRY_KEYS, label, errors);

    const catalogSourceId = stringField(entry, "catalogSourceId", label, errors);
    const configPath = stringField(entry, "configPath", label, errors);
    const name = stringField(entry, "name", label, errors);
    const description = stringField(entry, "description", label, errors);
    const recipe = stringField(entry, "recipe", label, errors);
    const sortIndex = entry.sortIndex;

    if (recipe !== undefined && recipe !== "standard") {
      errors.push(`${label}/recipe must be "standard"`);
    }
    if (!Number.isInteger(sortIndex)) {
      errors.push(`${label}/sortIndex must be an integer`);
    }
    validateOptionalLatitudeBounds(entry.latitudeBounds, label, errors);
    validateDigestInputs(entry.digestInputs, configPath, label, errors);

    if (catalogSourceId) {
      const previous = seenIds.get(catalogSourceId);
      if (previous !== undefined) {
        errors.push(
          `${label}/catalogSourceId duplicates CatalogSourceIndex[${previous}]/catalogSourceId "${catalogSourceId}"`
        );
      } else {
        seenIds.set(catalogSourceId, index);
      }
    }

    if (configPath) {
      validateConfigPath(configPath, label, errors);
      const previous = seenPaths.get(configPath);
      if (previous !== undefined) {
        errors.push(
          `${label}/configPath duplicates CatalogSourceIndex[${previous}]/configPath "${configPath}"`
        );
      } else {
        seenPaths.set(configPath, index);
      }
      if (options.knownConfigPaths && !options.knownConfigPaths.has(configPath)) {
        errors.push(`${label}/configPath does not resolve in the repository: ${configPath}`);
      }
    }

    if (configPath && options.configMetadataByPath?.has(configPath)) {
      const config = options.configMetadataByPath.get(configPath);
      if (config && catalogSourceId && config.id !== catalogSourceId) {
        errors.push(`${label}/catalogSourceId must match config id "${config.id}"`);
      }
      if (config && name && config.name !== name) {
        errors.push(`${label}/name must match config name "${config.name}"`);
      }
      if (config && description && config.description !== description) {
        errors.push(`${label}/description must match config description`);
      }
      if (config && recipe && config.recipe !== recipe) {
        errors.push(`${label}/recipe must match config recipe "${config.recipe}"`);
      }
      if (config && Number.isInteger(sortIndex) && config.sortIndex !== sortIndex) {
        errors.push(`${label}/sortIndex must match config sortIndex ${config.sortIndex}`);
      }
      if (config && !sameJson(config.latitudeBounds ?? null, entry.latitudeBounds ?? null)) {
        errors.push(`${label}/latitudeBounds must match config latitudeBounds`);
      }
    }
  });

  return errors;
}

function isPlainObject(value: unknown): value is JsonObject {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function sameJson(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function stringField(
  entry: JsonObject,
  field: string,
  label: string,
  errors: string[]
): string | undefined {
  const value = entry[field];
  if (typeof value !== "string" || value.trim().length === 0) {
    errors.push(`${label}/${field} must be a non-empty string`);
    return undefined;
  }
  return value;
}

function validateConfigPath(path: string, label: string, errors: string[]): void {
  if (!path.startsWith(CATALOG_CONFIG_PATH_PREFIX) || !path.endsWith(CATALOG_CONFIG_PATH_SUFFIX)) {
    errors.push(
      `${label}/configPath must point at ${CATALOG_CONFIG_PATH_PREFIX}*${CATALOG_CONFIG_PATH_SUFFIX}`
    );
  }
  if (path.includes("..")) {
    errors.push(`${label}/configPath must not contain parent-directory segments`);
  }
}

function validateOptionalLatitudeBounds(value: unknown, label: string, errors: string[]): void {
  if (value === undefined) return;
  if (!isPlainObject(value)) {
    errors.push(`${label}/latitudeBounds must be an object when present`);
    return;
  }
  validateAllowedKeys(value, LATITUDE_BOUNDS_KEYS, `${label}/latitudeBounds`, errors);
  const { topLatitude, bottomLatitude } = value;
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

function validateDigestInputs(
  value: unknown,
  configPath: string | undefined,
  label: string,
  errors: string[]
): void {
  if (!Array.isArray(value) || value.length !== 1) {
    errors.push(`${label}/digestInputs must contain exactly one config-file input`);
    return;
  }
  value.forEach((input, inputIndex) => {
    const inputLabel = `${label}/digestInputs[${inputIndex}]`;
    if (!isPlainObject(input)) {
      errors.push(`${inputLabel} must be an object`);
      return;
    }
    validateAllowedKeys(input, DIGEST_INPUT_KEYS, inputLabel, errors);
    if (input.kind !== "config-file") {
      errors.push(`${inputLabel}/kind must be "config-file"`);
    }
    if (typeof input.path !== "string" || input.path.trim().length === 0) {
      errors.push(`${inputLabel}/path must be a non-empty string`);
    } else if (configPath && input.path !== configPath) {
      errors.push(`${inputLabel}/path must match configPath`);
    }
  });
}

function validateAllowedKeys(
  value: JsonObject,
  allowedKeys: ReadonlySet<string>,
  label: string,
  errors: string[]
): void {
  for (const key of Object.keys(value)) {
    if (!allowedKeys.has(key)) errors.push(`${label}/${key} is not a catalog source key`);
  }
}
