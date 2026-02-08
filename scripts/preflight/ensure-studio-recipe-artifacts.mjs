import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

const requiredArtifacts = [
  "mods/mod-swooper-maps/dist/recipes/standard-artifacts.js",
  "mods/mod-swooper-maps/dist/recipes/browser-test-artifacts.js",
];

const missingArtifacts = requiredArtifacts.filter((rel) => !existsSync(join(repoRoot, rel)));

if (missingArtifacts.length === 0) {
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

