#!/usr/bin/env bun
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const repoRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], {
  encoding: "utf8",
}).trim();
const sourceRoot = join(repoRoot, "packages/civ7-map-policy/src");
const forbiddenImports = [
  "@civ7/adapter",
  "@swooper/mapgen-core",
  "mod-swooper-maps",
  "mapgen-studio",
  `/base-${"standard"}/`,
];
const violations: string[] = [];

function listSourceFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) files.push(...listSourceFiles(path));
    else if (path.endsWith(".ts")) files.push(path);
  }
  return files;
}

for (const file of listSourceFiles(sourceRoot)) {
  const source = readFileSync(file, "utf8");
  const imports = [
    ...source.matchAll(/\b(?:import|export)\s+(?:type\s+)?(?:[^"']*?\s+from\s+)?["']([^"']+)["']/g),
  ];
  for (const [, specifier] of imports) {
    for (const token of forbiddenImports) {
      if (specifier?.includes(token)) violations.push(`${relative(repoRoot, file)}:${specifier}`);
    }
  }
}

if (violations.length > 0) {
  console.error(violations.join("\n"));
  process.exit(1);
}
