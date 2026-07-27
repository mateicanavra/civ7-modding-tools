import { Database } from "bun:sqlite";
import { execFileSync } from "node:child_process";
import { XMLParser } from "fast-xml-parser";

const EXPECTED_PARAMETER_SOURCES = [
  "Base/modules/core/config/SetupParameters.xml",
  "Base/modules/base-standard/config/config.xml",
] as const;
const PARAMETERS_SCHEMA = "Base/Assets/schema/frontend/schema-frontend-10-setup-parameters.sql";
const GAME_LIFECYCLE_PARAMETER_IDS = ["GameRandomSeed"] as const;
const MAP_LIFECYCLE_PARAMETER_IDS = ["Map", "MapSize", "MapRandomSeed"] as const;
const SETUP_LIFECYCLE_PARAMETER_IDS = [
  ...MAP_LIFECYCLE_PARAMETER_IDS,
  ...GAME_LIFECYCLE_PARAMETER_IDS,
] as const;

type SqliteColumn = Readonly<{
  cid: number;
  name: string;
  type: string;
  notnull: 0 | 1;
  dflt_value: string | null;
  pk: 0 | 1;
}>;

type SourceRow = Readonly<{
  source: string;
  sourceIndex: number;
  attributes: Readonly<Record<string, string>>;
}>;

type ParameterRow = Readonly<{
  source: string;
  sourceIndex: number;
  rawAttributes: Readonly<Record<string, string>>;
  columns: Readonly<Record<string, boolean | number | string | null>>;
}>;

type ParameterValueKind = "array" | "boolean" | "integer" | "string";

type DomainEvidence = Readonly<{
  id: string;
  valueKind: Exclude<ParameterValueKind, "array">;
  source: "primitive" | "resource-domain";
  declaredValues: readonly string[];
}>;

type SetupOptionDescriptor = Readonly<{
  configurationGroup: string;
  parameterId: string;
  cardinality: "array" | "scalar";
  valueKind: DomainEvidence["valueKind"];
  physicalProjections: Readonly<{
    configuration: Readonly<{
      key: string;
      encoding: "hash" | "literal";
    }>;
    authoredValue: Readonly<{ key: string }> | null;
  }>;
  authoredValueRead:
    | Readonly<{
        kind: "configuration";
        key: string;
        source: "configuration-key" | "value-configuration-key";
      }>
    | Readonly<{
        kind: "unsupported";
        reason: "no-authored-value-key" | "overlapping-projection-keys";
      }>;
}>;

export type SetupParameterGeneration = Readonly<{
  source: string;
  parameterCount: number;
  uniqueParameterCount: number;
  groupCount: number;
}>;

/**
 * Generates the provenance-bearing Civ7 setup-parameter catalog and closed base schemas.
 * The catalog preserves contextual source rows; product policy may narrow those facts later.
 */
export function generateSetupParameterSource(input: {
  resourceRoot: string;
  resourceCommit: string;
}): SetupParameterGeneration {
  const sourceFiles = discoverParameterSources(input.resourceRoot, input.resourceCommit);
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
    parseAttributeValue: false,
    isArray: (tagName) => tagName === "Row",
  });
  const documents = sourceFiles.map((source) => ({
    source,
    database: parseDatabase(
      parser.parse(readResourceAtCommit(input.resourceRoot, input.resourceCommit, source))
    ),
  }));
  const columns = readParameterColumns(
    readResourceAtCommit(input.resourceRoot, input.resourceCommit, PARAMETERS_SCHEMA)
  );
  const parameters = documents.flatMap(({ source, database }) =>
    tableRows(database, "Parameters").map((attributes, sourceIndex) =>
      resolveParameterRow(source, sourceIndex, attributes, columns)
    )
  );
  const groups = documents.flatMap(({ source, database }) =>
    tableRows(database, "ParameterGroups").map((attributes, sourceIndex) => ({
      source,
      sourceIndex,
      attributes,
    }))
  );
  const inlineDomainValues = documents.flatMap(({ database }) =>
    tableRows(database, "DomainValues")
  );
  validateCorpus(parameters, groups);

  const domains = buildDomainEvidence(parameters, inlineDomainValues);
  const optionDescriptors = buildSetupOptionDescriptors(parameters);
  const source = renderGeneratedSource({
    resourceCommit: input.resourceCommit,
    sourceFiles,
    schemaFile: PARAMETERS_SCHEMA,
    columns,
    groups,
    parameters,
    domains,
    optionDescriptors,
  });
  return {
    source,
    parameterCount: parameters.length,
    uniqueParameterCount: new Set(parameters.map(parameterId)).size,
    groupCount: groups.length,
  };
}

function buildSetupOptionDescriptors(
  parameters: readonly ParameterRow[]
): readonly SetupOptionDescriptor[] {
  const rowsByIdentity = new Map<string, ParameterRow[]>();
  for (const row of parameters) {
    const configurationGroup = requireColumnString(row, "ConfigurationGroup");
    const identity = `${configurationGroup}\u0000${parameterId(row)}`;
    const rows = rowsByIdentity.get(identity) ?? [];
    rows.push(row);
    rowsByIdentity.set(identity, rows);
  }

  return [...rowsByIdentity.values()].map((rows) => {
    const [first] = rows;
    if (!first) throw new Error("Setup option identity has no source rows.");
    const descriptor = setupOptionDescriptor(first);
    for (const row of rows.slice(1)) {
      const contextualDescriptor = setupOptionDescriptor(row);
      if (JSON.stringify(contextualDescriptor) !== JSON.stringify(descriptor)) {
        throw new Error(
          `Setup parameter ${descriptor.configurationGroup}.${descriptor.parameterId} changes its projection contract between contextual rows.`
        );
      }
    }
    return descriptor;
  });
}

function setupOptionDescriptor(row: ParameterRow): SetupOptionDescriptor {
  const configurationGroup = requireColumnString(row, "ConfigurationGroup");
  const id = parameterId(row);
  const configurationKey = requireColumnString(row, "ConfigurationKey");
  const valueConfigurationKey = optionalColumnString(row, "ValueConfigurationKey");
  const hashed = row.columns.Hash === true;
  const authoredValueRead: SetupOptionDescriptor["authoredValueRead"] =
    hashed && valueConfigurationKey === configurationKey
      ? { kind: "unsupported", reason: "overlapping-projection-keys" }
      : hashed && valueConfigurationKey !== null
        ? {
            kind: "configuration",
            key: valueConfigurationKey,
            source: "value-configuration-key",
          }
        : hashed
          ? { kind: "unsupported", reason: "no-authored-value-key" }
          : {
              kind: "configuration",
              key: configurationKey,
              source: "configuration-key",
            };

  return {
    configurationGroup,
    parameterId: id,
    cardinality: row.columns.Array === true ? "array" : "scalar",
    valueKind: parameterDomainValueKind(row),
    physicalProjections: {
      configuration: {
        key: configurationKey,
        encoding: hashed ? "hash" : "literal",
      },
      authoredValue: valueConfigurationKey === null ? null : { key: valueConfigurationKey },
    },
    authoredValueRead,
  };
}

function discoverParameterSources(resourceRoot: string, resourceCommit: string): string[] {
  const output = execFileSync(
    "git",
    ["-C", resourceRoot, "grep", "-l", "<Parameters>", resourceCommit, "--", "*.xml"],
    { encoding: "utf8" }
  );
  const actual = output
    .split("\n")
    .map((line) => line.trim().replace(new RegExp(`^${resourceCommit}:`), ""))
    .filter(Boolean)
    .sort();
  const expected = [...EXPECTED_PARAMETER_SOURCES].sort();
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(
      `Civ7 setup parameter source set changed: expected ${expected.join(", ")}; observed ${actual.join(", ")}`
    );
  }
  return [...EXPECTED_PARAMETER_SOURCES];
}

function readResourceAtCommit(resourceRoot: string, commit: string, path: string): string {
  return execFileSync("git", ["-C", resourceRoot, "show", `${commit}:${path}`], {
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
  });
}

function readParameterColumns(schemaSource: string): readonly SqliteColumn[] {
  const database = new Database(":memory:", { strict: true });
  try {
    database.exec(schemaSource);
    const columns = database.query<SqliteColumn, []>("PRAGMA table_info('Parameters')").all();
    if (columns.length !== 31) {
      throw new Error(`Official Parameters table has ${columns.length} columns; expected 31.`);
    }
    return columns;
  } finally {
    database.close();
  }
}

function parseDatabase(value: unknown): Readonly<Record<string, unknown>> {
  if (!isRecord(value) || !isRecord(value.Database)) {
    throw new Error("Official setup XML does not contain a Database object.");
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

function resolveParameterRow(
  source: string,
  sourceIndex: number,
  attributes: Readonly<Record<string, string>>,
  columns: readonly SqliteColumn[]
): ParameterRow {
  const resolved: Record<string, boolean | number | string | null> = {};
  for (const column of columns) {
    const raw = attributeValue(attributes, column.name);
    resolved[column.name] = resolveColumnValue(raw, column);
    if (column.notnull === 1 && resolved[column.name] === null) {
      throw new Error(
        `${source} Parameters row ${sourceIndex} omits required column ${column.name}.`
      );
    }
  }
  return {
    source,
    sourceIndex,
    rawAttributes: Object.freeze({ ...attributes }),
    columns: Object.freeze(resolved),
  };
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

function resolveColumnValue(
  raw: string | undefined,
  column: SqliteColumn
): boolean | number | string | null {
  const value = raw ?? sqlDefaultValue(column.dflt_value);
  if (value === null) return null;
  if (column.type.toUpperCase() === "BOOLEAN") {
    if (value === "1" || value === "true") return true;
    if (value === "0" || value === "false") return false;
    throw new Error(`Invalid boolean ${column.name}=${value}.`);
  }
  if (column.type.toUpperCase() === "INTEGER") {
    const number = Number(value);
    if (!Number.isInteger(number)) throw new Error(`Invalid integer ${column.name}=${value}.`);
    return number;
  }
  return value;
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

function validateCorpus(parameters: readonly ParameterRow[], groups: readonly SourceRow[]): void {
  if (parameters.length !== 61) {
    throw new Error(`Official setup corpus has ${parameters.length} rows; expected 61.`);
  }
  const uniqueIds = new Set(parameters.map(parameterId));
  if (uniqueIds.size !== 54) {
    throw new Error(`Official setup corpus has ${uniqueIds.size} unique IDs; expected 54.`);
  }
  if (groups.length !== 14) {
    throw new Error(`Official setup corpus has ${groups.length} groups; expected 14.`);
  }
  const groupIds = new Set(groups.map((row) => requireAttribute(row.attributes, "GroupId")));
  for (const row of parameters) {
    const groupId = requireColumnString(row, "GroupID");
    if (!groupIds.has(groupId)) {
      throw new Error(`Setup parameter ${parameterId(row)} references unknown group ${groupId}.`);
    }
  }
}

function buildDomainEvidence(
  parameters: readonly ParameterRow[],
  inlineRows: readonly Readonly<Record<string, string>>[]
): readonly DomainEvidence[] {
  const valuesByDomain = new Map<string, Set<string>>();
  for (const row of inlineRows) {
    const domain = row.Domain;
    const value = row.Value;
    if (!domain || value === undefined) continue;
    const values = valuesByDomain.get(domain) ?? new Set<string>();
    values.add(value);
    valuesByDomain.set(domain, values);
  }
  const domainIds = [
    ...new Set(parameters.map((row) => requireColumnString(row, "Domain"))),
  ].sort();
  return domainIds.map((id) => {
    const valueKind = parameterValueKindForDomain(id, parameters);
    const primitive = isPrimitiveDomain(id);
    return {
      id,
      valueKind,
      source: primitive ? "primitive" : "resource-domain",
      declaredValues: [...(valuesByDomain.get(id) ?? [])].sort(),
    };
  });
}

function parameterValueKindForDomain(
  domain: string,
  parameters: readonly ParameterRow[]
): DomainEvidence["valueKind"] {
  const rows = parameters.filter((row) => requireColumnString(row, "Domain") === domain);
  const kinds = new Set(rows.map(parameterDomainValueKind));
  if (kinds.size !== 1) {
    throw new Error(
      `Domain ${domain} has incompatible parameter value kinds: ${[...kinds].join(", ")}`
    );
  }
  const [kind] = kinds;
  if (!kind) throw new Error(`Domain ${domain} has no parameter rows.`);
  return kind;
}

function parameterValueKind(row: ParameterRow): ParameterValueKind {
  if (row.columns.Array === true) return "array";
  return parameterDomainValueKind(row);
}

function parameterDomainValueKind(row: ParameterRow): DomainEvidence["valueKind"] {
  const domain = requireColumnString(row, "Domain");
  if (domain === "bool") return "boolean";
  if (domain === "int" || domain === "uint") return "integer";
  return "string";
}

function isPrimitiveDomain(domain: string): boolean {
  return domain === "bool" || domain === "int" || domain === "uint" || domain === "text";
}

function renderGeneratedSource(input: {
  resourceCommit: string;
  sourceFiles: readonly string[];
  schemaFile: string;
  columns: readonly SqliteColumn[];
  groups: readonly SourceRow[];
  parameters: readonly ParameterRow[];
  domains: readonly DomainEvidence[];
  optionDescriptors: readonly SetupOptionDescriptor[];
}): string {
  const gameOptionDescriptors = input.optionDescriptors.filter(
    ({ configurationGroup }) => configurationGroup === "Game"
  );
  const mapOptionDescriptors = input.optionDescriptors.filter(
    ({ configurationGroup }) => configurationGroup === "Map"
  );
  const playerOptionDescriptors = input.optionDescriptors.filter(
    ({ configurationGroup }) => configurationGroup === "Player"
  );
  const gameRandomSeedDescriptorIndex = gameOptionDescriptors.findIndex(
    ({ parameterId: id }) => id === "GameRandomSeed"
  );
  if (gameRandomSeedDescriptorIndex < 0) {
    throw new Error("Official setup parameters have no Game.GameRandomSeed descriptor.");
  }

  return `/* eslint-disable */
/**
 * GENERATED FILE - DO NOT EDIT BY HAND.
 *
 * Generated by: \`nx run civ7-map-policy:generate\`
 * Source evidence: Civ7 official setup XML and SQL under \`.civ7/outputs/resources\`
 * Submodule commit: ${input.resourceCommit}
 *
 * These are declared setup facts, not live availability or product defaults.
 * Runtime GameSetup state remains authoritative for contextual admission.
 */

import { type Static, Type } from "typebox";
import { defineCiv7SetupOptionEvidenceSchema } from "./setup-option-evidence.js";

function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) deepFreeze(child);
    Object.freeze(value);
  }
  return value;
}

/** Pinned official resource provenance for the generated setup catalog. */
export type Civ7SetupParameterSource = Readonly<{
  files: readonly string[];
  schema: string;
  commit: string;
}>;

/** One column declared by Civ7's official frontend Parameters table. */
export type Civ7SetupParameterColumn = Readonly<{
  cid: number;
  name: string;
  type: string;
  notnull: 0 | 1;
  dflt_value: string | null;
  pk: 0 | 1;
}>;

/** One source-ordered row whose attributes remain exactly as authored by Civ7. */
export type Civ7SetupSourceRow = Readonly<{
  source: string;
  sourceIndex: number;
  attributes: Readonly<Record<string, string>>;
}>;

/** SQL-resolved values for every column in Civ7's Parameters table. */
export type Civ7SetupParameterColumns = Readonly<{
${renderParameterColumnType(input.columns)}
}>;

/** One declared setup-parameter row with raw provenance and SQL-resolved values. */
export type Civ7SetupParameterFact = Readonly<{
  source: string;
  sourceIndex: number;
  rawAttributes: Readonly<Record<string, string>>;
  columns: Civ7SetupParameterColumns;
}>;

/** Evidence for the value kind and known values declared by one setup domain. */
export type Civ7SetupDomainEvidence = Readonly<{
  id: string;
  valueKind: "boolean" | "integer" | "string";
  source: "primitive" | "resource-domain";
  declaredValues: readonly string[];
}>;

/** Physical Civ7 configuration projections and the authored-value read selected for one setup option. */
export type Civ7SetupOptionDescriptor<
  ConfigurationGroup extends string = string,
  ParameterId extends string = string,
> = Readonly<{
  configurationGroup: ConfigurationGroup;
  parameterId: ParameterId;
  cardinality: "array" | "scalar";
  valueKind: "boolean" | "integer" | "string";
  physicalProjections: Readonly<{
    configuration: Readonly<{
      key: string;
      encoding: "hash" | "literal";
    }>;
    authoredValue: Readonly<{ key: string }> | null;
  }>;
  authoredValueRead:
    | Readonly<{
        kind: "configuration";
        key: string;
        source: "configuration-key" | "value-configuration-key";
      }>
    | Readonly<{
        kind: "unsupported";
        reason: "no-authored-value-key" | "overlapping-projection-keys";
      }>;
}>;

/** Official resource evidence used to derive the setup-parameter catalog. */
export const CIV7_SETUP_PARAMETER_SOURCE: Civ7SetupParameterSource = ${JSON.stringify(
    { files: input.sourceFiles, schema: input.schemaFile, commit: input.resourceCommit },
    null,
    2
  )};

/** SQL-resolved Parameters table column metadata from the official frontend schema. */
export const CIV7_SETUP_PARAMETER_COLUMNS: readonly Civ7SetupParameterColumn[] = ${JSON.stringify(
    input.columns,
    null,
    2
  )};

/** All declared setup parameter groups, preserving source file and row order. */
export const CIV7_SETUP_PARAMETER_GROUPS: readonly Civ7SetupSourceRow[] = ${JSON.stringify(
    input.groups,
    null,
    2
  )};

/** All declared setup parameter rows, including keyed and multiplayer variants. */
export const CIV7_SETUP_PARAMETER_FACTS: readonly Civ7SetupParameterFact[] = ${JSON.stringify(
    input.parameters,
    null,
    2
  )};

/** Declared setup-domain evidence; resource values are evidence, never an exhaustive enum. */
export const CIV7_SETUP_DOMAIN_EVIDENCE: readonly Civ7SetupDomainEvidence[] = ${JSON.stringify(
    input.domains,
    null,
    2
  )};

/** Game setup identities owned by first-class lifecycle fields rather than option maps. */
export const CIV7_GAME_SETUP_LIFECYCLE_PARAMETER_IDS = ${JSON.stringify(
    GAME_LIFECYCLE_PARAMETER_IDS
  )} as const;

/** Map setup identities owned by first-class lifecycle fields rather than option maps. */
export const CIV7_MAP_SETUP_LIFECYCLE_PARAMETER_IDS = ${JSON.stringify(
    MAP_LIFECYCLE_PARAMETER_IDS
  )} as const;

/** Setup identities owned by first-class lifecycle fields rather than option maps. */
export const CIV7_SETUP_LIFECYCLE_PARAMETER_IDS = ${JSON.stringify(
    SETUP_LIFECYCLE_PARAMETER_IDS
  )} as const;

/** Exact official Game setup projection descriptors in declared parameter order. */
export const CIV7_GAME_SETUP_PARAMETER_DESCRIPTORS = deepFreeze(${JSON.stringify(
    gameOptionDescriptors,
    null,
    2
  )} as const satisfies readonly Civ7SetupOptionDescriptor<"Game">[]);

/** Generated lifecycle descriptor for the game seed read performed at GenerateMap admission. */
export const CIV7_GAME_RANDOM_SEED_PARAMETER_DESCRIPTOR =
  CIV7_GAME_SETUP_PARAMETER_DESCRIPTORS[${gameRandomSeedDescriptorIndex}];

/** Exact official Map setup projection descriptors in declared parameter order. */
export const CIV7_MAP_SETUP_PARAMETER_DESCRIPTORS = deepFreeze(${JSON.stringify(
    mapOptionDescriptors,
    null,
    2
  )} as const satisfies readonly Civ7SetupOptionDescriptor<"Map">[]);

/** Exact official Player setup projection descriptors in declared parameter order. */
export const CIV7_PLAYER_SETUP_PARAMETER_DESCRIPTORS = deepFreeze(${JSON.stringify(
    playerOptionDescriptors,
    null,
    2
  )} as const satisfies readonly Civ7SetupOptionDescriptor<"Player">[]);

${renderBaseSchema(input.parameters, "Game", "Civ7GameSetupBaseSchema")}

${renderBaseSchema(input.parameters, "Map", "Civ7MapSetupBaseSchema")}

${renderBaseSchema(input.parameters, "Player", "Civ7PlayerSetupBaseSchema")}

${renderBaseSchema(
  input.parameters,
  "AgeTransitionPlayer",
  "Civ7AgeTransitionPlayerSetupBaseSchema"
)}

${renderEvidenceSchemaUnion(
  input.parameters,
  "Game",
  "Civ7GameSetupBaseSchema",
  "Civ7GameOptionEvidenceSchema",
  GAME_LIFECYCLE_PARAMETER_IDS
)}

${renderEvidenceSchemaUnion(
  input.parameters,
  "Map",
  "Civ7MapSetupBaseSchema",
  "Civ7MapOptionEvidenceSchema",
  MAP_LIFECYCLE_PARAMETER_IDS
)}

${renderEvidenceSchemaUnion(
  input.parameters,
  "Player",
  "Civ7PlayerSetupBaseSchema",
  "Civ7PlayerOptionEvidenceSchema",
  []
)}
`;
}

function renderParameterColumnType(columns: readonly SqliteColumn[]): string {
  return columns
    .map((column) => {
      const primitive =
        column.type.toUpperCase() === "BOOLEAN"
          ? "boolean"
          : column.type.toUpperCase() === "INTEGER"
            ? "number"
            : "string";
      const type = column.notnull === 1 ? primitive : `${primitive} | null`;
      return `  readonly ${JSON.stringify(column.name)}: ${type};`;
    })
    .join("\n");
}

function renderBaseSchema(
  parameters: readonly ParameterRow[],
  configurationGroup: string,
  exportName: string
): string {
  const byId = new Map<string, ParameterRow>();
  for (const row of parameters) {
    if (requireColumnString(row, "ConfigurationGroup") !== configurationGroup) continue;
    const id = parameterId(row);
    const prior = byId.get(id);
    if (prior && parameterValueKind(prior) !== parameterValueKind(row)) {
      throw new Error(`Setup parameter ${id} changes value kind between contextual rows.`);
    }
    if (!prior) byId.set(id, row);
  }
  const properties = [...byId.entries()]
    .map(([id, row]) => {
      const description = `Official Civ7 ${configurationGroup} setup parameter ${id}; GameSetup projects it to ${configurationGroup}.${requireColumnString(row, "ConfigurationKey")}. Live availability remains contextual.`;
      return `    ${JSON.stringify(id)}: ${schemaExpression(row, description)},`;
    })
    .join("\n");
  const typeName = exportName.replace(/Schema$/, "");
  return `/** Closed declared ${configurationGroup} setup shape before product-specific exclusions. */
export const ${exportName} = Type.Object(
  {
${properties}
  },
  {
    additionalProperties: false,
    description: ${JSON.stringify(
      `All ${configurationGroup} setup parameters declared by the pinned Civ7 resources; runtime availability remains contextual.`
    )},
  }
);

/** Declared ${configurationGroup} setup values before product-specific exclusions. */
export type ${typeName} = Static<typeof ${exportName}>;`;
}

function renderEvidenceSchemaUnion(
  parameters: readonly ParameterRow[],
  configurationGroup: string,
  baseSchemaName: string,
  exportName: string,
  excludedParameterIds: readonly string[]
): string {
  const excluded = new Set(excludedParameterIds);
  const parameterIds = [
    ...new Set(
      parameters
        .filter(
          (row) =>
            requireColumnString(row, "ConfigurationGroup") === configurationGroup &&
            !excluded.has(parameterId(row))
        )
        .map(parameterId)
    ),
  ];
  if (parameterIds.length === 0) {
    throw new Error(`${configurationGroup} has no authored setup option evidence schemas.`);
  }
  const variants = parameterIds
    .map(
      (id) =>
        `  defineCiv7SetupOptionEvidenceSchema(${JSON.stringify(id)}, ${baseSchemaName}.properties[${JSON.stringify(id)}]),`
    )
    .join("\n");
  const typeName = exportName.replace(/Schema$/, "");
  return `/** Exact available-or-unavailable evidence for every authored ${configurationGroup} option. */
export const ${exportName} = Type.Union([
${variants}
]);

/** Available-or-unavailable evidence for one exact authored ${configurationGroup} option. */
export type ${typeName} = Static<typeof ${exportName}>;`;
}

function schemaExpression(row: ParameterRow, description: string): string {
  const options = JSON.stringify({ description });
  const kind = parameterValueKind(row);
  if (kind === "array") {
    return `Type.Array(Type.String(), { ...${options}, uniqueItems: true })`;
  }
  if (kind === "boolean") return `Type.Boolean(${options})`;
  if (kind === "integer") {
    return requireColumnString(row, "Domain") === "uint"
      ? `Type.Integer({ ...${options}, minimum: 0 })`
      : `Type.Integer(${options})`;
  }
  return `Type.String(${options})`;
}

function parameterId(row: ParameterRow): string {
  return requireColumnString(row, "ParameterID");
}

function requireColumnString(row: ParameterRow, name: string): string {
  const value = row.columns[name];
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`${row.source} Parameters row ${row.sourceIndex} has no ${name}.`);
  }
  return value;
}

function optionalColumnString(row: ParameterRow, name: string): string | null {
  const value = row.columns[name];
  if (value === null) return null;
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`${row.source} Parameters row ${row.sourceIndex} has invalid ${name}.`);
  }
  return value;
}

function requireAttribute(row: Readonly<Record<string, string>>, name: string): string {
  const value = row[name];
  if (!value) throw new Error(`Official setup row has no ${name}.`);
  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
