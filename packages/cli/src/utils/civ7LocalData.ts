import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export type LocalFileEntry = Readonly<{
  path: string;
  relativePath: string;
  sizeBytes: number;
  mtimeMs: number;
  mtime: string;
}>;

export type LocalDatabaseEntry = LocalFileEntry & Readonly<{
  kind: 'sqlite';
  tableCount?: number;
  tableCountError?: string;
}>;

export type Civ7LocalDataInventory = Readonly<{
  appSupportDir: string;
  exists: boolean;
  sqlite3Path: string | null;
  databases: ReadonlyArray<LocalDatabaseEntry>;
  saves: ReadonlyArray<LocalFileEntry>;
  logs: ReadonlyArray<LocalFileEntry>;
  authority: Readonly<{
    directControl: string;
    localData: string;
    warning: string;
  }>;
}>;

export type InspectCiv7LocalDataOptions = Readonly<{
  appSupportDir?: string;
  includeTableCounts?: boolean;
  maxSaves?: number;
  maxLogs?: number;
}>;

const DEFAULT_APP_SUPPORT_DIR = path.join(os.homedir(), 'Library', 'Application Support', 'Civilization VII');

export function inspectCiv7LocalData(options: InspectCiv7LocalDataOptions = {}): Civ7LocalDataInventory {
  const appSupportDir = path.resolve(options.appSupportDir ?? DEFAULT_APP_SUPPORT_DIR);
  const exists = isDirectory(appSupportDir);
  const sqlite3Path = findSqlite3Path();

  if (!exists) {
    return {
      appSupportDir,
      exists: false,
      sqlite3Path,
      databases: [],
      saves: [],
      logs: [],
      authority: authorityLabels(),
    };
  }

  const includeTableCounts = options.includeTableCounts ?? true;
  const databases = collectFiles(appSupportDir, isSqliteFile, 3)
    .map((file) => databaseEntry(appSupportDir, file, includeTableCounts ? sqlite3Path : null))
    .sort(compareByRelativePath);
  const saves = collectFiles(path.join(appSupportDir, 'Saves'), (file) => file.endsWith('.Civ7Save'), 6)
    .map((file) => fileEntry(appSupportDir, file))
    .sort(compareNewestFirst)
    .slice(0, options.maxSaves ?? 20);
  const logs = collectFiles(path.join(appSupportDir, 'Logs'), (file) => /\.(?:log|csv|txt)$/i.test(file), 2)
    .map((file) => fileEntry(appSupportDir, file))
    .sort(compareNewestFirst)
    .slice(0, options.maxLogs ?? 20);

  return {
    appSupportDir,
    exists: true,
    sqlite3Path,
    databases,
    saves,
    logs,
    authority: authorityLabels(),
  };
}

function databaseEntry(root: string, file: string, sqlite3Path: string | null): LocalDatabaseEntry {
  const base = fileEntry(root, file);
  const count = sqlite3Path ? readTableCount(sqlite3Path, file) : { tableCountError: 'sqlite3 unavailable' };
  return { ...base, kind: 'sqlite', ...count };
}

function fileEntry(root: string, file: string): LocalFileEntry {
  const stat = fs.statSync(file);
  return {
    path: file,
    relativePath: path.relative(root, file),
    sizeBytes: stat.size,
    mtimeMs: stat.mtimeMs,
    mtime: stat.mtime.toISOString(),
  };
}

function collectFiles(root: string, predicate: (file: string) => boolean, maxDepth: number): string[] {
  if (!isDirectory(root)) return [];

  const results: string[] = [];
  const visit = (dir: string, depth: number): void => {
    if (depth > maxDepth) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        visit(fullPath, depth + 1);
        continue;
      }
      if (entry.isFile() && predicate(fullPath)) results.push(fullPath);
    }
  };

  visit(root, 0);
  return results;
}

function readTableCount(sqlite3Path: string, file: string): { tableCount: number } | { tableCountError: string } {
  const result = spawnSync(
    sqlite3Path,
    ['-readonly', file, "select count(*) from sqlite_master where type = 'table';"],
    { encoding: 'utf8', timeout: 3_000 },
  );

  if (result.error) return { tableCountError: result.error.message };
  if (result.status !== 0) return { tableCountError: (result.stderr || 'sqlite3 exited non-zero').trim() };

  const tableCount = Number.parseInt(result.stdout.trim(), 10);
  return Number.isFinite(tableCount) ? { tableCount } : { tableCountError: `unexpected sqlite3 output: ${result.stdout.trim()}` };
}

function findSqlite3Path(): string | null {
  const result = spawnSync('which', ['sqlite3'], { encoding: 'utf8', timeout: 1_000 });
  if (result.status !== 0) return null;
  const sqlite3Path = result.stdout.trim();
  return sqlite3Path.length > 0 ? sqlite3Path : null;
}

function isDirectory(value: string): boolean {
  try {
    return fs.statSync(value).isDirectory();
  } catch {
    return false;
  }
}

function isSqliteFile(file: string): boolean {
  return /\.(?:sqlite|sqlite3|db)$/i.test(file);
}

function compareByRelativePath(a: LocalFileEntry, b: LocalFileEntry): number {
  return a.relativePath.localeCompare(b.relativePath);
}

function compareNewestFirst(a: LocalFileEntry, b: LocalFileEntry): number {
  return b.mtimeMs - a.mtimeMs || a.relativePath.localeCompare(b.relativePath);
}

function authorityLabels(): Civ7LocalDataInventory['authority'] {
  return {
    directControl: 'live authority for blockers, ready entities, validators, sends, and postconditions',
    localData: 'static and forensic authority for catalogs, localization, mod inventory, saves, and logs',
    warning: 'local SQLite existence does not prove current turn legality or freshness',
  };
}
