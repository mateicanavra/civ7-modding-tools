import { promises as fs } from "node:fs";
import * as path from "node:path";
import { XMLParser } from "fast-xml-parser";
import { Index, Row, RowRecord, TableIndex } from "../types";
import { PRIMARY_KEYS } from "./constants";

/** Shared XML parser configured to keep attributes and preserve original keys. */
const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "" });

/**
 * Recursively find all XML files under a root path or accept a single XML file.
 * Returns a deterministic lexicographically sorted list to enable last-write-wins layering.
 */
export async function findXmlFiles(root: string): Promise<string[]> {
  const out: string[] = [];
  async function walk(dir: string) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries.filter((entry) => entry.isDirectory())) {
      await walk(path.join(dir, entry.name));
    }
    out.push(
      ...entries
        .filter((entry) => entry.isFile())
        .map((entry) => path.join(dir, entry.name))
        .filter((entryPath) => entryPath.toLowerCase().endsWith(".xml"))
    );
  }
  const stat = await fs.stat(root);
  await Promise.all([root].filter(() => stat.isDirectory()).map((dir) => walk(dir)));
  return [
    ...out,
    ...[root].filter(
      (candidate) => !stat.isDirectory() && candidate.toLowerCase().endsWith(".xml")
    ),
  ].sort((a, b) => a.localeCompare(b));
}

/** Collect classic Civ-style tables from a parsed Database XML object. */
function findTables(obj: any, acc: Record<string, any[]> = {}): Record<string, any[]> {
  if (!obj || typeof obj !== "object") return acc;
  const objectEntries = Object.entries(obj).filter(([, v]) => v && typeof v === "object");
  const tableEntries = objectEntries.filter((entry): entry is [string, Record<"Row", any>] =>
    hasOwn(entry[1], "Row")
  );
  for (const [k, table] of tableEntries) {
    for (const row of toArray(table.Row)) (acc[k] ??= []).push(row);
  }
  for (const [, nested] of objectEntries.filter(([, value]) => !hasOwn(value, "Row"))) {
    findTables(nested, acc);
  }
  return acc;
}

/** Collect <Delete .../> nodes grouped by table for layering semantics. */
function findDeletes(obj: any, acc: Record<string, any[]> = {}): Record<string, any[]> {
  if (!obj || typeof obj !== "object") return acc;
  const objectEntries = Object.entries(obj).filter(([, v]) => v && typeof v === "object");
  const deleteEntries = objectEntries.filter((entry): entry is [string, Record<"Delete", any>] =>
    hasOwn(entry[1], "Delete")
  );
  for (const [k, table] of deleteEntries) {
    for (const deletion of toArray(table.Delete)) (acc[k] ??= []).push(deletion);
  }
  for (const [, nested] of objectEntries.filter(([, value]) => !hasOwn(value, "Delete"))) {
    findDeletes(nested, acc);
  }
  return acc;
}

/** Normalize scalar-or-array into array. */
function toArray<T>(v: T | T[] | undefined): T[] {
  if (v === undefined || v === null) return [];
  if (Array.isArray(v)) return v;
  return [v];
}

/** Get attribute by any of the provided names, case-insensitive. */
function getAttrCaseInsensitive(obj: any, ...names: string[]): any {
  if (!obj || typeof obj !== "object") return undefined;
  const keys = Object.keys(obj);
  for (const n of names) {
    const k = keys.find((kk) => kk.toLowerCase() === n.toLowerCase());
    if (k !== undefined) return (obj as any)[k];
  }
  return undefined;
}

/** Read a value from an <Argument ...> node supporting both attribute and inner-text styles. */
function readArgumentValue(node: any): string | undefined {
  if (!node || typeof node !== "object") return undefined;
  const explicit = getAttrCaseInsensitive(node, "Value");
  if (explicit !== undefined) return String(explicit);
  if (typeof (node as any)["#text"] !== "undefined") return String((node as any)["#text"]);
  const txt = getAttrCaseInsensitive(node, "Text");
  if (txt !== undefined) return String(txt);
  return undefined;
}

/** Locate <GameEffects> blocks anywhere in a parsed XML tree. */
function collectGameEffectsRoots(obj: any, out: any[] = []): any[] {
  if (!obj || typeof obj !== "object") return out;
  const objectEntries = Object.entries(obj).filter(([, v]) => v && typeof v === "object");
  out.push(...objectEntries.filter(([k]) => k === "GameEffects").map(([, v]) => v));
  for (const [, v] of objectEntries) {
    collectGameEffectsRoots(v, out);
  }
  return out;
}

function hasOwn<T extends string>(value: unknown, key: T): value is Record<T, any> {
  return typeof value === "object" && value !== null && key in value;
}

interface DeleteSpec {
  table: string;
  where: Record<string, string>;
  file: string;
  seq: number;
}

/** Build an in-memory index from Civ-style XML root. */
export async function buildIndexFromXml(root: string): Promise<Index> {
  const files = await findXmlFiles(root);
  const tables = new Map<string, TableIndex>();
  const deleteSpecs: DeleteSpec[] = [];
  let seqCounter = 0;

  function ensureTable(table: string): TableIndex {
    const tableIndex = tables.get(table) ?? { table, rows: [], byCol: new Map() };
    tables.set(table, tableIndex);
    return tableIndex;
  }

  function indexRow(table: string, row: Row, file: string) {
    const ti = ensureTable(table);
    row.__table = table;
    row.__file = file;
    const rr: RowRecord = { table, key: getPrimaryKey(table, row), row, file, seq: seqCounter++ };
    ti.rows.push(rr);
    for (const [col, val] of Object.entries(row)) {
      if (typeof val !== "string") continue;
      const map = ti.byCol.get(col) ?? new Map<string, RowRecord[]>();
      ti.byCol.set(col, map);
      const list = map.get(val) || [];
      list.push(rr);
      map.set(val, list);
    }
  }

  function addDelete(table: string, whereRaw: any, file: string) {
    const where: Record<string, string> = {};
    const deleteEntries = Object.entries(whereRaw || {}).filter(
      ([k, v]) => v !== null && typeof v !== "object" && k !== "__table" && k !== "__file"
    );
    for (const [k, v] of deleteEntries) {
      where[k] = String(v);
    }
    deleteSpecs.push({ table, where, file, seq: seqCounter++ });
  }

  function deleteMatchesRowAfter(del: DeleteSpec, rr: RowRecord): boolean {
    if (del.seq <= rr.seq) return false;
    return Object.entries(del.where).every(([k, v]) => String((rr.row as any)[k]) === String(v));
  }

  function markDeletedWhenMatched(del: DeleteSpec, rr: RowRecord): boolean {
    if (!deleteMatchesRowAfter(del, rr)) return false;
    (rr as RowRecord).deleted = true;
    return true;
  }

  function indexModifierRequirements(
    requirementsRoot: any,
    synthesized: Row,
    synthesizedKey: "SubjectRequirementSetId" | "OwnerRequirementSetId",
    suffix: "SUBJECT" | "OWNER",
    modId: string,
    file: string
  ) {
    const setId = `REQSET_${modId}_${suffix}`;
    (synthesized as any)[synthesizedKey] = setId;
    const setType = String(getAttrCaseInsensitive(requirementsRoot, "type", "Type") || "");
    indexRow("RequirementSets", { RequirementSetId: setId, RequirementSetType: setType }, file);
    const reqs = toArray(getAttrCaseInsensitive(requirementsRoot, "Requirement"));
    let i = 0;
    for (const r of reqs) {
      const reqId = `REQ_${modId}_${suffix}_${i++}`;
      const reqType = String(getAttrCaseInsensitive(r, "type", "Type") || "");
      indexRow("Requirements", { RequirementId: reqId, RequirementType: reqType }, file);
      indexRow(
        "RequirementSetRequirements",
        { RequirementSetId: setId, RequirementId: reqId, Index: i - 1 },
        file
      );
      const args = toArray(getAttrCaseInsensitive(r, "Argument"));
      for (const a of args) {
        const name = String(getAttrCaseInsensitive(a, "name", "Name") || "");
        const value = readArgumentValue(a) || "";
        indexRow("RequirementArguments", { RequirementId: reqId, Name: name, Value: value }, file);
      }
    }
  }

  function maybeString(value: any): string | undefined {
    if (typeof value === "undefined") return undefined;
    return String(value);
  }

  function maybeObject(value: any): any[] {
    if (!value || typeof value !== "object") return [];
    return [value];
  }

  async function indexXmlFile(file: string) {
    const text = await fs.readFile(file, "utf8");
    const obj = parser.parse(text);

    const tablesInFile = findTables(obj);
    for (const [table, rows] of Object.entries(tablesInFile)) {
      for (const raw of rows) {
        const row: Row = normalizeRow(raw);
        indexRow(table, row, file);
      }
    }

    const deletesInFile = findDeletes(obj);
    for (const [table, dels] of Object.entries(deletesInFile)) {
      for (const d of dels) addDelete(table, d, file);
    }

    const geRoots = collectGameEffectsRoots(obj);
    for (const ge of geRoots) {
      const modifiersRaw = toArray(getAttrCaseInsensitive(ge, "Modifier"));
      for (const mod of modifiersRaw) {
        const modId = String(
          getAttrCaseInsensitive(mod, "id", "Id", "ID", "ModifierId", "ModifierID") || ""
        );
        if (!modId) continue;
        const collection = String(getAttrCaseInsensitive(mod, "collection", "Collection") || "");
        const effect = String(getAttrCaseInsensitive(mod, "effect", "Effect") || "");
        const permanentVal = getAttrCaseInsensitive(mod, "permanent", "Permanent");
        const permanent = maybeString(permanentVal);

        const synthesized: Row = {
          ModifierId: modId,
          Collection: collection,
          Effect: effect,
        };
        for (const value of [permanent].filter((value): value is string => value !== undefined)) {
          synthesized.Permanent = value;
        }

        const subjReqs = getAttrCaseInsensitive(mod, "SubjectRequirements");
        const ownerReqs = getAttrCaseInsensitive(mod, "OwnerRequirements");

        for (const requirementsRoot of maybeObject(subjReqs)) {
          indexModifierRequirements(
            requirementsRoot,
            synthesized,
            "SubjectRequirementSetId",
            "SUBJECT",
            modId,
            file
          );
        }

        for (const requirementsRoot of maybeObject(ownerReqs)) {
          indexModifierRequirements(
            requirementsRoot,
            synthesized,
            "OwnerRequirementSetId",
            "OWNER",
            modId,
            file
          );
        }

        indexRow("Modifiers", synthesized, file);

        const args = toArray(getAttrCaseInsensitive(mod, "Argument"));
        for (const a of args) {
          const name = String(getAttrCaseInsensitive(a, "name", "Name") || "");
          const value = readArgumentValue(a) || "";
          indexRow("ModifierArguments", { ModifierId: modId, Name: name, Value: value }, file);
        }
      }
    }
  }

  for (const file of files) {
    await indexXmlFile(file).catch(() => undefined);
  }

  for (const [table, ti] of tables.entries()) {
    const relevantDeletes = deleteSpecs.filter((d) => d.table === table);
    if (!relevantDeletes.length) continue;
    for (const rr of ti.rows) {
      for (const del of relevantDeletes) {
        if (markDeletedWhenMatched(del, rr)) break;
      }
    }
    const newByCol = new Map<string, Map<string, RowRecord[]>>();
    for (const rr of ti.rows) {
      if (rr.deleted) continue;
      for (const [col, val] of Object.entries(rr.row)) {
        if (typeof val !== "string") continue;
        const map = newByCol.get(col) ?? new Map<string, RowRecord[]>();
        newByCol.set(col, map);
        const list = map.get(val) || [];
        list.push(rr);
        map.set(val, list);
      }
    }
    ti.byCol = newByCol;
  }

  return { tables };
}

/** Normalize a raw parsed <Row> payload. */
function normalizeRow(raw: any): Row {
  return raw as Row;
}

/** Return the primary key value for a row if known, with basic fallbacks. */
function getPrimaryKey(table: string, row: Row): string | undefined {
  const pk = (PRIMARY_KEYS as any)[table];
  if (pk && (row as any)[pk]) return String((row as any)[pk]);
  for (const k of ["Type", "Id", "ID", "RowId", "Name"])
    if ((row as any)[k]) return String((row as any)[k]);
  return undefined;
}
