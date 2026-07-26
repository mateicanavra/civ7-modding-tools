import { CatalogSourceIndex } from "./sourceIndex.js";

/**
 * Repository-relative namespace for authored map configuration sources.
 * Catalog validation and generation share this prefix so every indexed map has one file identity.
 */
export const CATALOG_CONFIG_PATH_PREFIX = "mods/mod-swooper-maps/src/maps/configs/";
const CATALOG_CONFIG_PATH_SUFFIX = ".config.json";

export type CatalogSourceEntry = string;

export type CatalogSourceIndexValidationOptions = Readonly<{
  knownConfigPaths?: ReadonlySet<string>;
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
 * Reads ordered catalog membership through its validation boundary. Config
 * envelopes are admitted separately; the index does not mirror their metadata.
 */
export function readCatalogSourceIndex(
  options: CatalogSourceIndexReadOptions
): readonly CatalogSourceEntry[] {
  return parseCatalogSourceIndex(CatalogSourceIndex, options).entries;
}

/**
 * Admits an unknown catalog index while preserving its authored map order.
 * Generation uses this throwing boundary so invalid or unresolved sources fail before output is
 * materialized.
 */
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

/**
 * Projects an indexed source path to the filename identity used for config admission.
 * Rejecting paths outside the authored namespace prevents catalog and envelope identity from
 * diverging.
 */
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

/**
 * Collects catalog membership defects without throwing so generation can report them together.
 * The check owns path shape, uniqueness, and optional repository-resolution evidence.
 */
export function validateCatalogSourceIndex(
  value: unknown,
  options: CatalogSourceIndexValidationOptions = {}
): string[] {
  const errors: string[] = [];
  if (!Array.isArray(value)) return ["CatalogSourceIndex must be an array"];

  const seenPaths = new Map<string, number>();
  value.forEach((entry, index) => {
    const label = `CatalogSourceIndex[${index}]`;
    if (typeof entry !== "string" || entry.trim().length === 0) {
      errors.push(`${label} must be a non-empty config path string`);
      return;
    }
    validateConfigPath(entry, label, errors);
    const previous = seenPaths.get(entry);
    if (previous !== undefined) {
      errors.push(`${label} duplicates CatalogSourceIndex[${previous}] "${entry}"`);
    } else {
      seenPaths.set(entry, index);
    }
    if (options.knownConfigPaths && !options.knownConfigPaths.has(entry)) {
      errors.push(`${label} does not resolve in the repository: ${entry}`);
    }
  });

  return errors;
}

function validateConfigPath(path: string, label: string, errors: string[]): void {
  if (!path.startsWith(CATALOG_CONFIG_PATH_PREFIX) || !path.endsWith(CATALOG_CONFIG_PATH_SUFFIX)) {
    errors.push(
      `${label} must point at ${CATALOG_CONFIG_PATH_PREFIX}*${CATALOG_CONFIG_PATH_SUFFIX}`
    );
  }
  if (path.includes("..")) {
    errors.push(`${label} must not contain parent-directory segments`);
  }
}
