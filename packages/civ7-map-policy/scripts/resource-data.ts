import { Database } from "bun:sqlite";

export const RESOURCE_GAMEPLAY_SCHEMA = "Base/Assets/schema/gameplay/01_GameplaySchema.sql";

type Attributes = Readonly<Record<string, string>>;
type SqliteColumn = { name: string; dflt_value: string | null };

export type ResourceDefaults = Readonly<{
  weight: number;
  minimumPerLandmass: number;
  landmassUnique: boolean;
  placementWeight: number;
}>;

/** Read defaults from SQLite itself rather than maintaining a second schema parser. */
export function readResourceDefaults(schema: string): ResourceDefaults {
  const database = new Database(":memory:", { strict: true });
  try {
    database.exec(schema);
    const resources = database.query<SqliteColumn, []>("PRAGMA table_info('Resources')").all();
    const placements = database
      .query<SqliteColumn, []>("PRAGMA table_info('Resource_ValidBiomes')")
      .all();
    function requiredDefault(columns: readonly SqliteColumn[], name: string): string {
      const value = columns.find((column) => column.name === name)?.dflt_value;
      if (value === undefined || value === null) {
        throw new Error(`${RESOURCE_GAMEPLAY_SCHEMA} has no default for ${name}`);
      }
      return value;
    }
    const uniqueDefault = requiredDefault(resources, "LandmassUnique");
    if (uniqueDefault !== "0" && uniqueDefault !== "1") {
      throw new Error(`Invalid schema LandmassUnique default: ${uniqueDefault}`);
    }
    return {
      weight: positiveWeight(requiredDefault(resources, "Weight"), "Resources.Weight"),
      minimumPerLandmass: nonnegativeInteger(
        requiredDefault(resources, "MinimumPerLandmass"),
        "Resources.MinimumPerLandmass"
      ),
      landmassUnique: uniqueDefault === "1",
      placementWeight: positiveWeight(
        requiredDefault(placements, "Weight"),
        "Resource_ValidBiomes.Weight"
      ),
    };
  } finally {
    database.close();
  }
}

export function resolveResourceFacts(attributes: Attributes, defaults: ResourceDefaults) {
  const context = attributes.ResourceType ?? "Resources row";
  return {
    weight:
      attributes.Weight === undefined
        ? defaults.weight
        : positiveWeight(attributes.Weight, `${context}.Weight`),
    minimumPerLandmass:
      attributes.MinimumPerLandmass === undefined
        ? defaults.minimumPerLandmass
        : nonnegativeInteger(attributes.MinimumPerLandmass, `${context}.MinimumPerLandmass`),
    landmassUnique:
      attributes.LandmassUnique === undefined
        ? defaults.landmassUnique
        : booleanAttribute(attributes.LandmassUnique, `${context}.LandmassUnique`),
  };
}

export function resolveResourcePlacementWeight(
  attributes: Attributes,
  defaults: ResourceDefaults
): number {
  return attributes.Weight === undefined
    ? defaults.placementWeight
    : positiveWeight(attributes.Weight, `${attributes.ResourceType}.Resource_ValidBiomes.Weight`);
}

function positiveWeight(value: string, context: string): number {
  const number = Number(value);
  if (value.trim() === "" || !Number.isFinite(number) || number <= 0) {
    throw new Error(
      `Invalid ${context}: expected a positive finite weight, got ${JSON.stringify(value)}`
    );
  }
  return number;
}

function nonnegativeInteger(value: string, context: string): number {
  const number = Number(value);
  if (value.trim() === "" || !Number.isSafeInteger(number) || number < 0) {
    throw new Error(
      `Invalid ${context}: expected a nonnegative integer, got ${JSON.stringify(value)}`
    );
  }
  return number;
}

function booleanAttribute(value: string, context: string): boolean {
  if (value !== "true" && value !== "false") {
    throw new Error(`Invalid ${context}: expected true or false, got ${JSON.stringify(value)}`);
  }
  return value === "true";
}
