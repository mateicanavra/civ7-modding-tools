import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, test } from "vitest";

const allowedConstructors = new Set([
  "packages/studio-server/src/services/Civ7TunerSession.ts",
  "packages/civ7-direct-control/src/session/session.ts",
]);

const scannedRoots = ["apps", "packages"] as const;
const ignoredDirectoryNames = new Set([
  ".git",
  "coverage",
  "dist",
  "mod",
  "node_modules",
  "test",
  "tests",
  "types",
]);

describe("Civ7 game-door invariant", () => {
  test("constructs Civ7DirectControlSession only at sanctioned owner paths", () => {
    const repoRoot = findRepoRoot(dirname(fileURLToPath(import.meta.url)));
    const violations: string[] = [];

    for (const root of scannedRoots) {
      for (const file of collectTsFiles(join(repoRoot, root))) {
        const rel = normalizePath(relative(repoRoot, file));
        if (allowedConstructors.has(rel)) continue;

        const text = readFileSync(file, "utf8");
        if (/\bnew\s+Civ7DirectControlSession\s*\(/.test(text)) {
          violations.push(rel);
        }
      }
    }

    expect(violations).toEqual([]);
  });
});

function findRepoRoot(start: string): string {
  let current = start;
  while (current !== dirname(current)) {
    if (fileExists(join(current, "pnpm-workspace.yaml")) || fileExists(join(current, "bun.lock"))) {
      return current;
    }
    current = dirname(current);
  }
  throw new Error(`Could not resolve repo root from ${start}`);
}

function collectTsFiles(root: string): string[] {
  const out: string[] = [];
  collect(root, out);
  return out;
}

function collect(path: string, out: string[]): void {
  const stats = statSync(path);
  if (stats.isDirectory()) {
    const name = path.split("/").at(-1);
    if (name && ignoredDirectoryNames.has(name)) return;
    for (const entry of readdirSync(path)) collect(join(path, entry), out);
    return;
  }
  if (!stats.isFile()) return;
  if (path.endsWith(".ts") || path.endsWith(".tsx")) out.push(path);
}

function fileExists(path: string): boolean {
  try {
    return statSync(path).isFile();
  } catch {
    return false;
  }
}

function normalizePath(path: string): string {
  return path.split("\\").join("/");
}
