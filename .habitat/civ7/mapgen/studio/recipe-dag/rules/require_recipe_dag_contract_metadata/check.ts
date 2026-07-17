#!/usr/bin/env bun
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";

const repoRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], {
  encoding: "utf8",
}).trim();
const servicePath = resolve(repoRoot, "apps/mapgen-studio/src/server/recipeDag/service.ts");
const studioContractsPath = resolve(
  repoRoot,
  "mods/mod-swooper-maps/src/recipes/studio-contracts/index.ts"
);
const failures: string[] = [];

const importSpecifierPattern =
  /\bimport\s+(?:type\s+)?(?:[\s\S]*?\s+from\s+)?["']([^"']+)["']|\bexport\s+(?:type\s+)?(?:[\s\S]*?\s+from\s+)?["']([^"']+)["']|\bimport\(\s*["']([^"']+)["']\s*\)/g;

function resolveLocalImport(fromFile: string, specifier: string): string | null {
  if (specifier === "@swooper/mapgen-core/authoring/recipe-dag") {
    return resolve(repoRoot, "packages/mapgen-core/src/authoring/recipe-dag.ts");
  }
  if (specifier === "@swooper/mapgen-core/authoring/contracts") {
    return resolve(repoRoot, "packages/mapgen-core/src/authoring/contracts.ts");
  }
  if (specifier === "@swooper/mapgen-core/authoring") {
    return resolve(repoRoot, "packages/mapgen-core/src/authoring/index.ts");
  }
  if (specifier === "mod-swooper-maps/recipes/studio-contracts") {
    return resolve(repoRoot, "mods/mod-swooper-maps/src/recipes/studio-contracts/index.ts");
  }
  if (specifier.startsWith("@mapgen/domain/")) {
    const suffix = specifier.slice("@mapgen/domain/".length).replace(/\.(m?js)$/, "");
    const base = resolve(repoRoot, "mods/mod-swooper-maps/src/domain", suffix);
    for (const candidate of [`${base}.ts`, `${base}/index.ts`]) {
      if (existsSync(candidate)) return candidate;
    }
    return `${base}.ts`;
  }
  if (!specifier.startsWith(".")) return null;
  const base = resolve(dirname(fromFile), specifier);
  for (const candidate of [
    base,
    base.replace(/\.(m?js)$/, ".ts"),
    `${base}.ts`,
    `${base}.tsx`,
    `${base}/index.ts`,
    `${base}/index.tsx`,
  ]) {
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

async function collectLocalImportGraph(entry: string): Promise<Map<string, string>> {
  const visited = new Map<string, string>();
  const pending = [entry];
  while (pending.length > 0) {
    const file = pending.pop();
    if (!file || visited.has(file)) continue;
    const source = await readFile(file, "utf8");
    visited.set(file, source);
    for (const match of source.matchAll(importSpecifierPattern)) {
      const specifier = match[1] ?? match[2] ?? match[3];
      if (!specifier) continue;
      const resolvedImport = resolveLocalImport(file, specifier);
      if (resolvedImport && !visited.has(resolvedImport)) pending.push(resolvedImport);
    }
  }
  return visited;
}

function rel(file: string): string {
  return relative(repoRoot, file).split(/[\\/]/).join("/");
}

function requireIncludes(source: string, token: string, label: string) {
  if (!source.includes(token)) failures.push(`${label}: missing ${token}`);
}

function requireNotMatches(source: string, pattern: RegExp, label: string) {
  if (pattern.test(source)) failures.push(`${label}: matched ${pattern}`);
}

const serviceSource = await readFile(servicePath, "utf8");
const studioContractsSource = await readFile(studioContractsPath, "utf8");
const graph = await collectLocalImportGraph(servicePath);
const graphPaths = [...graph.keys()].map(rel).sort();

requireIncludes(
  serviceSource,
  'from "mod-swooper-maps/recipes/studio-contracts"',
  "service source"
);
requireIncludes(serviceSource, "@swooper/mapgen-core/authoring/recipe-dag", "service source");
requireIncludes(studioContractsSource, "../standard/contract-manifest.js", "studio contracts");

for (const expectedPath of [
  "mods/mod-swooper-maps/src/recipes/studio-contracts/index.ts",
  "mods/mod-swooper-maps/src/recipes/standard/contract-manifest.ts",
  "packages/mapgen-core/src/authoring/recipe-dag.ts",
  "packages/mapgen-core/src/authoring/contracts.ts",
]) {
  if (!graphPaths.includes(expectedPath)) failures.push(`import graph missing ${expectedPath}`);
}
if (graphPaths.includes("packages/mapgen-core/src/authoring/index.ts")) {
  failures.push("import graph includes packages/mapgen-core/src/authoring/index.ts");
}

for (const graphPath of graphPaths) {
  for (const forbidden of [
    /^mods\/mod-swooper-maps\/src\/recipes\/browser-test\//,
    /^mods\/mod-swooper-maps\/src\/recipes\/standard\/stages\/[^/]+\/index\.ts$/,
    /^mods\/mod-swooper-maps\/src\/recipes\/standard\/stages\/[^/]+\/steps\/(?:index|.*\/index)\.ts$/,
    /^mods\/mod-swooper-maps\/(?:dist|mod)\//,
    /^mods\/mod-swooper-maps\/src\/maps\/generated\//,
  ]) {
    if (forbidden.test(graphPath))
      failures.push(`import graph includes forbidden path ${graphPath}`);
  }
  if (
    graphPath === "mods/mod-swooper-maps/src/recipes/standard/recipe.ts" ||
    graphPath === "mods/mod-swooper-maps/src/recipes/standard/runtime.ts"
  ) {
    failures.push(`import graph includes forbidden path ${graphPath}`);
  }
}

for (const [file, source] of graph) {
  const graphPath = rel(file);
  requireNotMatches(source, /from\s+["']@swooper\/mapgen-core(?:\/authoring)?["']/, graphPath);
  requireNotMatches(
    source,
    /from\s+["'](?:mod-swooper-maps\/recipes\/(?:standard|standard-artifacts|standard-map-configs|browser-test)|@mapgen\/domain\/[^"']+\/(?:contract|ops)["'])/,
    graphPath
  );
  if (graphPath.startsWith("mods/mod-swooper-maps/src/recipes/")) {
    requireNotMatches(
      source,
      /createRecipe|createStage|createStep\s*\(|collectCompileOps|compileOpsById|implementArtifactModules/,
      graphPath
    );
  }
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}
