import { Type, type Static } from "typebox";

import type {
  Civ7CommandResult,
  Civ7DirectControlOptions,
  Civ7TunerState,
} from "../../session/types.js";
import { jsLiteral } from "../../runtime/command-serialization.js";
import {
  Civ7RuntimeProbeSchema,
  probeHelperSource,
  type Civ7RuntimeProbe,
} from "../../runtime/probe.js";
import { jsonPayloadFromCommandResult } from "../../session/command-result.js";
import { executeCiv7TunerCommand } from "../../session/execute.js";
import { boundedInteger, validateIdentifier } from "../../validation.js";
import {
  DEFAULT_CIV7_GAMEINFO_LIMIT,
  HARD_CIV7_GAMEINFO_LIMIT,
} from "./constants.js";

const civ7GameInfoIdentifierSchema = Type.String({ pattern: "^[A-Za-z_][A-Za-z0-9_]*$" });

export const Civ7GameInfoRowsInputSchema = Type.Object({
  table: civ7GameInfoIdentifierSchema,
  limit: Type.Optional(Type.Integer({ minimum: 1, maximum: HARD_CIV7_GAMEINFO_LIMIT })),
  offset: Type.Optional(Type.Integer({ minimum: 0, maximum: 1_000_000 })),
  lookup: Type.Optional(Type.Union([
    Type.String(),
    Type.Number(),
    Type.Array(Type.Union([Type.String(), Type.Number()])),
  ])),
  filter: Type.Optional(Type.Object({
    key: civ7GameInfoIdentifierSchema,
    equals: Type.Union([Type.String(), Type.Number(), Type.Boolean()]),
  }, { additionalProperties: false })),
  includeSchema: Type.Optional(Type.Boolean()),
  includePrimaryKeys: Type.Optional(Type.Boolean()),
}, { additionalProperties: false });

export type Civ7GameInfoRowsInput = Readonly<Static<typeof Civ7GameInfoRowsInputSchema>>;

export const Civ7GameInfoRowsResultSchema = Type.Object({
  host: Type.String(),
  port: Type.Number(),
  state: Type.Object({
    id: Type.String(),
    name: Type.String(),
  }, { additionalProperties: false }),
  table: civ7GameInfoIdentifierSchema,
  source: Type.Literal("GameInfo"),
  rows: Type.Array(Type.Record(Type.String(), Type.Unknown())),
  limit: Type.Integer({ minimum: 1, maximum: HARD_CIV7_GAMEINFO_LIMIT }),
  offset: Type.Integer({ minimum: 0, maximum: 1_000_000 }),
  total: Civ7RuntimeProbeSchema(Type.Number()),
  omittedUnknown: Type.Boolean(),
  schema: Type.Optional(Civ7RuntimeProbeSchema(Type.Unknown())),
  primaryKeys: Type.Optional(Civ7RuntimeProbeSchema(Type.Unknown())),
}, { additionalProperties: false });

export type Civ7GameInfoRowsResult = Readonly<{
  host: string;
  port: number;
  state: Civ7TunerState;
  table: string;
  source: "GameInfo";
  rows: ReadonlyArray<Record<string, unknown>>;
  limit: number;
  offset: number;
  total: Civ7RuntimeProbe<number>;
  omittedUnknown: boolean;
  schema?: Civ7RuntimeProbe<unknown>;
  primaryKeys?: Civ7RuntimeProbe<unknown>;
}>;

export type GameInfoReadDependencies = Readonly<{
  boundedInteger: (value: number, min: number, max: number, label: string) => number;
  defaultGameInfoLimit: number;
  executeTunerCommand: (options: Civ7DirectControlOptions & Readonly<{ command: string }>) => Promise<Civ7CommandResult>;
  hardGameInfoLimit: number;
  jsLiteral: (value: unknown) => string;
  parseGameInfoRows: (result: Civ7CommandResult, label: string) => Civ7GameInfoRowsResult;
  probeHelperSource: () => string;
  validateIdentifier: (value: string, label: string) => string;
}>;

export async function getCiv7GameInfoRows(
  input: Civ7GameInfoRowsInput,
  options: Civ7DirectControlOptions = {},
  dependencies: GameInfoReadDependencies = defaultGameInfoReadDependencies,
): Promise<Civ7GameInfoRowsResult> {
  const table = dependencies.validateIdentifier(input.table, "GameInfo table");
  const filterKey = input.filter ? dependencies.validateIdentifier(input.filter.key, "GameInfo filter key") : undefined;
  const result = await dependencies.executeTunerCommand({
    ...options,
    command: buildGameInfoRowsCommand(
      {
        ...input,
        table,
        filter: input.filter && filterKey ? { ...input.filter, key: filterKey } : undefined,
        limit: dependencies.boundedInteger(
          input.limit ?? dependencies.defaultGameInfoLimit,
          1,
          dependencies.hardGameInfoLimit,
          "limit",
        ),
        offset: dependencies.boundedInteger(input.offset ?? 0, 0, 1_000_000, "offset"),
      },
      dependencies,
    ),
  });
  return dependencies.parseGameInfoRows(result, "Civ7 GameInfo rows");
}

function buildGameInfoRowsCommand(input: Civ7GameInfoRowsInput & {
  table: string;
  limit: number;
  offset: number;
}, dependencies: GameInfoReadDependencies): string {
  return `(() => {
    ${dependencies.probeHelperSource()}
    const input = ${dependencies.jsLiteral(input)};
    const toPlain = (row) => {
      if (row == null || typeof row !== "object") return row;
      try {
        return JSON.parse(JSON.stringify(row));
      } catch {
        const out = {};
        for (const key of Object.getOwnPropertyNames(row)) {
          try {
            const value = row[key];
            if (typeof value !== "function") out[key] = value;
          } catch {}
        }
        return out;
      }
    };
    const table = GameInfo[input.table];
    const allRows = (() => {
      if (!table) return [];
      if (input.lookup !== undefined) {
        const lookups = Array.isArray(input.lookup) ? input.lookup : [input.lookup];
        return lookups.map((key) => {
          if (typeof table.lookup === "function") return table.lookup(key);
          return Array.from(table).find((row) => row?.Type === key || row?.Hash === key || row?.Name === key || row?.ID === key);
        }).filter(Boolean);
      }
      return Array.from(table);
    })();
    const filtered = input.filter
      ? allRows.filter((row) => row != null && row[input.filter.key] === input.filter.equals)
      : allRows;
    const rows = filtered.slice(input.offset, input.offset + input.limit).map(toPlain);
    return JSON.stringify({
      table: input.table,
      source: "GameInfo",
      rows,
      limit: input.limit,
      offset: input.offset,
      total: { ok: true, value: filtered.length },
      omittedUnknown: filtered.length > input.offset + input.limit,
      ...(input.includeSchema ? { schema: probe(() => typeof Database !== "undefined" ? Database.getTableData(input.table) : undefined) } : {}),
      ...(input.includePrimaryKeys ? { primaryKeys: probe(() => typeof Database !== "undefined" ? Database.getPrimaryKeys(input.table) : undefined) } : {}),
    });
  })()`;
}

const defaultGameInfoReadDependencies: GameInfoReadDependencies = {
  boundedInteger,
  defaultGameInfoLimit: DEFAULT_CIV7_GAMEINFO_LIMIT,
  executeTunerCommand: executeCiv7TunerCommand,
  hardGameInfoLimit: HARD_CIV7_GAMEINFO_LIMIT,
  jsLiteral,
  parseGameInfoRows: (result, label) =>
    jsonPayloadFromCommandResult<Civ7GameInfoRowsResult>(result, label),
  probeHelperSource,
  validateIdentifier,
};
