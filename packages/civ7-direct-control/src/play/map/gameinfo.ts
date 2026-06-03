import type {
  Civ7CommandResult,
  Civ7DirectControlOptions,
  Civ7GameInfoRowsInput,
  Civ7GameInfoRowsResult,
} from "../../index.js";

type GameInfoReadDependencies = Readonly<{
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
  dependencies: GameInfoReadDependencies,
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
