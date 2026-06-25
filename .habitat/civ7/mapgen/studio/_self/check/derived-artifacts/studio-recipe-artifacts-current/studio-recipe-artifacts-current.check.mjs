#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const repoRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], {
  encoding: "utf8",
}).trim();

const requiredArtifacts = [
  "mods/mod-swooper-maps/dist/recipes/standard.js",
  "mods/mod-swooper-maps/dist/recipes/standard.d.ts",
  "mods/mod-swooper-maps/dist/recipes/standard.schema.json",
  "mods/mod-swooper-maps/dist/recipes/standard.defaults.json",
  "mods/mod-swooper-maps/dist/recipes/standard.presets.json",
  "mods/mod-swooper-maps/dist/recipes/standard-artifacts.js",
  "mods/mod-swooper-maps/dist/recipes/standard-artifacts.d.ts",
];

const artifactSources = [
  "mods/mod-swooper-maps/src/domain",
  "mods/mod-swooper-maps/src/maps/configs",
  "mods/mod-swooper-maps/src/maps/presets",
  "mods/mod-swooper-maps/src/recipes",
  "mods/mod-swooper-maps/scripts/generate-map-artifacts.ts",
  "mods/mod-swooper-maps/scripts/generate-studio-recipe-types.ts",
  "mods/mod-swooper-maps/package.json",
  "mods/mod-swooper-maps/tsup.studio-recipes.config.ts",
  "packages/mapgen-core/dist",
];

const coreSourceRoots = ["packages/mapgen-core/src"];
const coreDistRoots = ["packages/mapgen-core/dist"];

function newestMtimeMs(rel) {
  return newestPathMtimeMs(join(repoRoot, rel));
}

function newestPathMtimeMs(path) {
  if (!existsSync(path)) return 0;

  const stat = statSync(path);
  if (!stat.isDirectory()) return stat.mtimeMs;

  let newest = stat.mtimeMs;
  for (const entry of readdirSync(path, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".git") continue;
    newest = Math.max(newest, newestPathMtimeMs(join(path, entry.name)));
  }
  return newest;
}

function oldestMtimeMs(rels) {
  return Math.min(...rels.map((rel) => statSync(join(repoRoot, rel)).mtimeMs));
}

const missingArtifacts = requiredArtifacts.filter((rel) => !existsSync(join(repoRoot, rel)));
const coreDistIsStale =
  Math.max(...coreSourceRoots.map(newestMtimeMs)) > Math.max(...coreDistRoots.map(newestMtimeMs));
const artifactsAreStale =
  missingArtifacts.length === 0 &&
  Math.max(...artifactSources.map(newestMtimeMs)) > oldestMtimeMs(requiredArtifacts);

if (missingArtifacts.length === 0 && !coreDistIsStale && !artifactsAreStale) {
  process.exit(0);
}

const messages = [];
if (missingArtifacts.length > 0) {
  messages.push("[habitat-check] Studio recipe artifacts are missing:");
  messages.push(...missingArtifacts.map((artifact) => `- ${artifact}`));
}
if (coreDistIsStale) {
  messages.push("[habitat-check] @swooper/mapgen-core dist is older than source.");
}
if (artifactsAreStale) {
  messages.push("[habitat-check] Studio recipe artifacts are stale.");
}
messages.push(
  "",
  "Run `bun run --cwd apps/mapgen-studio ensure:studio-recipe-artifacts` to refresh the package-local artifacts."
);

console.error(messages.join("\n"));
process.exit(1);
