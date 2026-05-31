import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

const requiredArtifacts = [
  // Bundled recipe modules (tsup output).
  "mods/mod-swooper-maps/dist/recipes/standard.js",
  "mods/mod-swooper-maps/dist/recipes/browser-test.js",

  // Recipe module declarations (written by generate-studio-recipe-types).
  "mods/mod-swooper-maps/dist/recipes/standard.d.ts",
  "mods/mod-swooper-maps/dist/recipes/browser-test.d.ts",

  // Generated Studio config artifacts (schema/defaults/presets).
  "mods/mod-swooper-maps/dist/recipes/standard.schema.json",
  "mods/mod-swooper-maps/dist/recipes/standard.defaults.json",
  "mods/mod-swooper-maps/dist/recipes/standard.presets.json",
  "mods/mod-swooper-maps/dist/recipes/browser-test.schema.json",
  "mods/mod-swooper-maps/dist/recipes/browser-test.defaults.json",
  "mods/mod-swooper-maps/dist/recipes/browser-test.presets.json",

  // Artifacts modules consumed by Studio for schema + defaults + UI metadata.
  "mods/mod-swooper-maps/dist/recipes/standard-artifacts.js",
  "mods/mod-swooper-maps/dist/recipes/standard-artifacts.d.ts",
  "mods/mod-swooper-maps/dist/recipes/browser-test-artifacts.js",
  "mods/mod-swooper-maps/dist/recipes/browser-test-artifacts.d.ts",
];

const missingArtifacts = requiredArtifacts.filter((rel) => !existsSync(join(repoRoot, rel)));

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
  if (!existsSync(path)) {
    return 0;
  }

  const stat = statSync(path);
  if (!stat.isDirectory()) {
    return stat.mtimeMs;
  }

  let newest = stat.mtimeMs;
  for (const entry of readdirSync(path, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".git") {
      continue;
    }
    newest = Math.max(newest, newestPathMtimeMs(join(path, entry.name)));
  }
  return newest;
}

function oldestMtimeMs(rels) {
  return Math.min(...rels.map((rel) => statSync(join(repoRoot, rel)).mtimeMs));
}

const newestCoreSourceMtime = Math.max(...coreSourceRoots.map(newestMtimeMs));
const newestCoreDistMtime = Math.max(...coreDistRoots.map(newestMtimeMs));
if (newestCoreSourceMtime > newestCoreDistMtime) {
  console.error(
    "[preflight] @swooper/mapgen-core dist is older than source. Run `bun run --cwd packages/mapgen-core build`, then retry Studio."
  );
  process.exit(1);
}

const artifactsAreStale =
  missingArtifacts.length === 0 &&
  Math.max(...artifactSources.map(newestMtimeMs)) > oldestMtimeMs(requiredArtifacts);

if (missingArtifacts.length === 0 && !artifactsAreStale) {
  process.exit(0);
}

const tsupCandidates = [
  join(repoRoot, "node_modules", ".bin", "tsup"),
  join(repoRoot, "mods", "mod-swooper-maps", "node_modules", ".bin", "tsup"),
];
const hasTsup = tsupCandidates.some((p) => existsSync(p));
if (!hasTsup) {
  console.error(
    "[preflight] missing dev deps (tsup) for studio recipe artifacts. Run `bun install` at repo root (and/or in mods/mod-swooper-maps if using isolated linking), then retry."
  );
  process.exit(1);
}

if (artifactsAreStale) {
  console.log("[preflight] studio recipe artifacts are stale; rebuilding.");
}

const result = spawnSync("bun", ["run", "build:studio-recipes"], {
  cwd: join(repoRoot, "mods", "mod-swooper-maps"),
  stdio: "inherit",
  env: process.env,
});
if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

const stillMissing = requiredArtifacts.filter((rel) => !existsSync(join(repoRoot, rel)));
if (stillMissing.length > 0) {
  console.error(
    `[preflight] studio recipe artifacts still missing after build:\n${stillMissing.map((p) => `- ${p}`).join("\n")}`
  );
  process.exit(1);
}
