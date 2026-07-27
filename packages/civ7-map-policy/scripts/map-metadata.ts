import { Database } from "bun:sqlite";
import { execFileSync } from "node:child_process";
import { XMLParser } from "fast-xml-parser";

const MAPS_DATA = "Base/modules/base-standard/data/maps.xml";
const MAP_SIZES_CONFIG = "Base/modules/base-standard/config/config.xml";
const MAPS_SCHEMA = "Base/Assets/schema/gameplay/01_GameplaySchema.sql";

const SOURCE_FILES = [MAPS_DATA, MAP_SIZES_CONFIG] as const;

type SqliteColumn = Readonly<{
  cid: number;
  name: string;
  type: string;
  notnull: 0 | 1;
  dflt_value: string | null;
  pk: 0 | 1;
}>;

type MapMetadataValue = boolean | number | string | null;
type MapMetadataRow = Readonly<Record<string, MapMetadataValue>>;
type MapInfoSqlType = "BOOLEAN" | "INTEGER" | "TEXT";

type MapMetadataGeneration = Readonly<{
  source: string;
  standardMapSizeCount: number;
}>;

/**
 * Generates the provenance-bearing official Standard map-size rows in game selection order.
 * Gameplay schema defaults are applied before the rows become static policy evidence.
 */
export function generateMapMetadataSource(input: {
  resourceRoot: string;
  resourceCommit: string;
}): MapMetadataGeneration {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
    parseAttributeValue: false,
    isArray: (tagName) => tagName === "Row",
  });
  const mapsDatabase = parseDatabase(
    parser.parse(readResourceAtCommit(input.resourceRoot, input.resourceCommit, MAPS_DATA))
  );
  const setupDatabase = parseDatabase(
    parser.parse(readResourceAtCommit(input.resourceRoot, input.resourceCommit, MAP_SIZES_CONFIG))
  );
  const columns = readMapColumns(
    readResourceAtCommit(input.resourceRoot, input.resourceCommit, MAPS_SCHEMA)
  );
  const mapRows = tableRows(mapsDatabase, "Maps").map((attributes, index) =>
    resolveMapRow(MAPS_DATA, index, attributes, columns)
  );
  const mapRowsById = indexRowsByString(mapRows, "MapSizeType", "GameInfo.Maps");
  const standardMapSizes = tableRows(setupDatabase, "MapSizes")
    .filter((row) => row.Domain === "StandardMapSizes")
    .sort(
      (left, right) => requiredInteger(left, "SortIndex") - requiredInteger(right, "SortIndex")
    );

  if (standardMapSizes.length === 0) {
    throw new Error("Official setup resources contain no StandardMapSizes rows.");
  }
  assertUniqueStrings(
    "StandardMapSizes.MapSizeType",
    standardMapSizes.map((row) => requiredString(row, "MapSizeType"))
  );
  assertUniqueIntegers(
    "StandardMapSizes.SortIndex",
    standardMapSizes.map((row) => requiredInteger(row, "SortIndex"))
  );

  const standardRows = standardMapSizes.map((mapSize) => {
    const id = requiredString(mapSize, "MapSizeType");
    const mapInfo = mapRowsById.get(id);
    if (!mapInfo) throw new Error(`Standard map size ${id} has no GameInfo.Maps row.`);
    assertMatchingValue(id, mapSize, mapInfo, "Name");
    assertMatchingValue(id, mapSize, mapInfo, "Description");
    assertMatchingValue(id, mapSize, mapInfo, "DefaultPlayers");
    return mapInfo;
  });

  const source = renderGeneratedSource({
    resourceCommit: input.resourceCommit,
    columns,
    rows: standardRows,
  });
  return { source, standardMapSizeCount: standardRows.length };
}

function readResourceAtCommit(resourceRoot: string, commit: string, path: string): string {
  return execFileSync("git", ["-C", resourceRoot, "show", `${commit}:${path}`], {
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  });
}

function readMapColumns(schemaSource: string): readonly SqliteColumn[] {
  const database = new Database(":memory:", { strict: true });
  try {
    database.exec(schemaSource);
    const columns = database.query<SqliteColumn, []>("PRAGMA table_info('Maps')").all();
    if (columns.length === 0) throw new Error("Official gameplay schema has no Maps table.");
    return columns;
  } finally {
    database.close();
  }
}

function parseDatabase(value: unknown): Readonly<Record<string, unknown>> {
  if (!isRecord(value) || !isRecord(value.Database)) {
    throw new Error("Official Civ7 XML does not contain a Database object.");
  }
  return value.Database;
}

function tableRows(
  database: Readonly<Record<string, unknown>>,
  table: string
): Readonly<Record<string, string>>[] {
  const rawSections = database[table];
  const sections = Array.isArray(rawSections) ? rawSections : [rawSections];
  const rows: Readonly<Record<string, string>>[] = [];
  for (const section of sections) {
    if (!isRecord(section)) continue;
    const rawRows = section.Row;
    for (const rawRow of Array.isArray(rawRows) ? rawRows : [rawRows]) {
      if (!isRecord(rawRow)) continue;
      const attributes: Record<string, string> = {};
      for (const [key, rawValue] of Object.entries(rawRow)) {
        if (typeof rawValue !== "string") {
          throw new Error(`${table}.${key} must remain a string attribute.`);
        }
        attributes[key] = rawValue;
      }
      rows.push(Object.freeze(attributes));
    }
  }
  return rows;
}

function resolveMapRow(
  source: string,
  sourceIndex: number,
  attributes: Readonly<Record<string, string>>,
  columns: readonly SqliteColumn[]
): MapMetadataRow {
  const columnNames = new Set(columns.map(({ name }) => name.toLowerCase()));
  const unexpected = Object.keys(attributes).filter((name) => !columnNames.has(name.toLowerCase()));
  if (unexpected.length > 0) {
    throw new Error(
      `${source} Maps row ${sourceIndex} has unknown columns: ${unexpected.join(", ")}.`
    );
  }

  const resolved: Record<string, MapMetadataValue> = {};
  for (const column of columns) {
    const raw = attributeValue(attributes, column.name);
    resolved[column.name] = resolveColumnValue(raw, column);
    if (column.notnull === 1 && resolved[column.name] === null) {
      throw new Error(`${source} Maps row ${sourceIndex} omits required column ${column.name}.`);
    }
  }
  return Object.freeze(resolved);
}

function attributeValue(
  attributes: Readonly<Record<string, string>>,
  columnName: string
): string | undefined {
  const exact = attributes[columnName];
  if (exact !== undefined) return exact;
  const normalizedName = columnName.toLowerCase();
  for (const [name, value] of Object.entries(attributes)) {
    if (name.toLowerCase() === normalizedName) return value;
  }
  return undefined;
}

function resolveColumnValue(raw: string | undefined, column: SqliteColumn): MapMetadataValue {
  const value = raw ?? sqlDefaultValue(column.dflt_value);
  if (value === null) return null;
  switch (mapInfoSqlType(column)) {
    case "BOOLEAN":
      if (value === "1" || value === "true") return true;
      if (value === "0" || value === "false") return false;
      throw new Error(`Invalid boolean Maps.${column.name}=${value}.`);
    case "INTEGER": {
      const number = Number(value);
      if (!Number.isSafeInteger(number)) {
        throw new Error(`Invalid integer Maps.${column.name}=${value}.`);
      }
      return number;
    }
    case "TEXT":
      return value;
  }
}

function mapInfoSqlType(column: SqliteColumn): MapInfoSqlType {
  const sqlType = column.type.toUpperCase();
  if (sqlType === "BOOLEAN" || sqlType === "INTEGER" || sqlType === "TEXT") return sqlType;
  throw new Error(`Unsupported official Maps.${column.name} SQL type ${column.type}.`);
}

function sqlDefaultValue(value: string | null): string | null {
  if (value === null) return null;
  if (
    (value.startsWith("'") && value.endsWith("'")) ||
    (value.startsWith('"') && value.endsWith('"'))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

function indexRowsByString(
  rows: readonly MapMetadataRow[],
  key: string,
  label: string
): ReadonlyMap<string, MapMetadataRow> {
  const indexed = new Map<string, MapMetadataRow>();
  for (const row of rows) {
    const id = requiredResolvedString(row, key);
    if (indexed.has(id)) throw new Error(`Duplicate ${label} identity ${id}.`);
    indexed.set(id, row);
  }
  return indexed;
}

function assertMatchingValue(
  id: string,
  setupRow: Readonly<Record<string, string>>,
  mapInfo: MapMetadataRow,
  key: string
): void {
  const setupValue =
    key === "DefaultPlayers" ? requiredInteger(setupRow, key) : requiredString(setupRow, key);
  if (setupValue !== mapInfo[key]) {
    throw new Error(
      `Standard map size ${id} has inconsistent ${key}: setup=${JSON.stringify(setupValue)}, mapInfo=${JSON.stringify(mapInfo[key])}.`
    );
  }
}

function requiredString(row: Readonly<Record<string, string>>, key: string): string {
  const value = row[key];
  if (value === undefined || value.length === 0) throw new Error(`Missing ${key}.`);
  return value;
}

function requiredResolvedString(row: MapMetadataRow, key: string): string {
  const value = row[key];
  if (typeof value !== "string" || value.length === 0) throw new Error(`Missing ${key}.`);
  return value;
}

function requiredInteger(row: Readonly<Record<string, string>>, key: string): number {
  const value = Number(requiredString(row, key));
  if (!Number.isSafeInteger(value)) throw new Error(`${key} must be an integer.`);
  return value;
}

function assertUniqueStrings(label: string, values: readonly string[]): void {
  if (new Set(values).size !== values.length) throw new Error(`${label} values must be unique.`);
}

function assertUniqueIntegers(label: string, values: readonly number[]): void {
  if (new Set(values).size !== values.length) throw new Error(`${label} values must be unique.`);
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function indentSource(source: string, spaces: number): string {
  const indent = " ".repeat(spaces);
  return source
    .split("\n")
    .map((line) => `${indent}${line}`)
    .join("\n");
}

function frozenObjectSource(value: Readonly<Record<string, MapMetadataValue>>): string {
  return `Object.freeze(${JSON.stringify(value, null, 2)} as const)`;
}

function renderGeneratedSource(input: {
  resourceCommit: string;
  columns: readonly SqliteColumn[];
  rows: readonly MapMetadataRow[];
}): string {
  const columns = input.columns.map((column) =>
    Object.freeze({
      name: column.name,
      sqlType: mapInfoSqlType(column),
      nullable: column.notnull !== 1,
      hasDefault: column.dflt_value !== null,
      defaultValue: column.dflt_value === null ? null : resolveColumnValue(undefined, column),
    })
  );
  const columnNames = columns.map(({ name }) => name);
  const numberKeys = columns.filter(({ sqlType }) => sqlType === "INTEGER").map(({ name }) => name);
  const booleanKeys = columns
    .filter(({ sqlType }) => sqlType === "BOOLEAN")
    .map(({ name }) => name);
  const stringKeys = columns
    .filter(({ sqlType }) => !["BOOLEAN", "INTEGER"].includes(sqlType))
    .map(({ name }) => name);
  const nullableKeys = columns.filter(({ nullable }) => nullable).map(({ name }) => name);
  return `/* eslint-disable */
/**
 * GENERATED FILE - DO NOT EDIT BY HAND.
 *
 * Generated by: \`nx run civ7-map-policy:generate\`
 * Source evidence: Civ7 official Standard MapSizes selection policy joined to GameInfo.Maps.
 * Submodule commit: ${input.resourceCommit}
 */

/** Official sources that determine Standard map-size membership, order, fields, and defaults. */
export const CIV7_STANDARD_MAP_METADATA_SOURCE = Object.freeze({
  files: Object.freeze(${JSON.stringify(SOURCE_FILES)} as const),
  schema: ${JSON.stringify(MAPS_SCHEMA)},
  commit: ${JSON.stringify(input.resourceCommit)},
} as const);

/** Complete GameInfo.Maps column facts derived from the official gameplay SQL schema. */
export const CIV7_MAP_INFO_COLUMN_DESCRIPTORS = Object.freeze([
${columns.map((column) => `${indentSource(frozenObjectSource(column), 2)},`).join("\n")}
] as const);

/** Complete GameInfo.Maps column identities in official schema order. */
export const CIV7_MAP_INFO_KEYS = Object.freeze(${JSON.stringify(columnNames, null, 2)} as const);

/** Numeric GameInfo.Maps columns derived from the official gameplay schema. */
export const CIV7_MAP_INFO_NUMBER_KEYS = Object.freeze(${JSON.stringify(numberKeys, null, 2)} as const);

/** Text GameInfo.Maps columns derived from the official gameplay schema. */
export const CIV7_MAP_INFO_STRING_KEYS = Object.freeze(${JSON.stringify(stringKeys, null, 2)} as const);

/** Boolean GameInfo.Maps columns derived from the official gameplay schema. */
export const CIV7_MAP_INFO_BOOLEAN_KEYS = Object.freeze(${JSON.stringify(booleanKeys, null, 2)} as const);

/** Nullable GameInfo.Maps columns derived from the official gameplay schema. */
export const CIV7_MAP_INFO_NULLABLE_KEYS = Object.freeze(${JSON.stringify(nullableKeys, null, 2)} as const);

/** Complete official Standard GameInfo.Maps rows in game selection order. */
export const CIV7_STANDARD_MAP_INFO_ROWS = Object.freeze([
${input.rows.map((row) => `${indentSource(frozenObjectSource(row), 2)},`).join("\n")}
] as const);
`;
}
