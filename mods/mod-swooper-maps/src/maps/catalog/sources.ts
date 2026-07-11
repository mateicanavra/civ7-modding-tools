import { CatalogSourceIndex } from "./sourceIndex.js";

export const CATALOG_CONFIG_PATH_PREFIX = "mods/mod-swooper-maps/src/maps/configs/";
export const CATALOG_CONFIG_PATH_SUFFIX = ".config.json";

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
