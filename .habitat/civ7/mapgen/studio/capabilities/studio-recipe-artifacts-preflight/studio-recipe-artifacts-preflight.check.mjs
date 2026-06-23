import { execFileSync, spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";

const repoRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], {
  encoding: "utf8",
}).trim();
const lockParentDir = join(repoRoot, ".nx", "workspace-data", "preflight-locks");
const lockDir = join(lockParentDir, "studio-recipe-artifacts.lock");
const lockTimeoutMs = 120_000;
const staleLockMs = 5 * 60_000;

const requiredArtifacts = [
  // Bundled recipe modules (tsup output).
  "mods/mod-swooper-maps/dist/recipes/standard.js",

  // Recipe module declarations (written by generate-studio-recipe-types).
  "mods/mod-swooper-maps/dist/recipes/standard.d.ts",

  // Generated Studio config artifacts (schema/defaults/presets).
  "mods/mod-swooper-maps/dist/recipes/standard.schema.json",
  "mods/mod-swooper-maps/dist/recipes/standard.defaults.json",
  "mods/mod-swooper-maps/dist/recipes/standard.presets.json",

  // Artifacts modules consumed by Studio for schema + defaults + UI metadata.
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

function sleepSync(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

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

function getArtifactState() {
  const missingArtifacts = requiredArtifacts.filter((rel) => !existsSync(join(repoRoot, rel)));
  const artifactsAreStale =
    missingArtifacts.length === 0 &&
    Math.max(...artifactSources.map(newestMtimeMs)) > oldestMtimeMs(requiredArtifacts);
  return { missingArtifacts, artifactsAreStale };
}

function isCurrent(state) {
  return state.missingArtifacts.length === 0 && !state.artifactsAreStale;
}

function isProcessAlive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return error?.code === "EPERM";
  }
}

function lockCanBeReaped() {
  try {
    if (Date.now() - statSync(lockDir).mtimeMs <= staleLockMs) return false;
  } catch {
    return true;
  }

  try {
    const owner = JSON.parse(readFileSync(join(lockDir, "owner.json"), "utf8"));
    return !isProcessAlive(owner?.pid);
  } catch {
    return true;
  }
}

function acquireRebuildLock() {
  mkdirSync(lockParentDir, { recursive: true });
  const startedAt = Date.now();

  for (;;) {
    try {
      mkdirSync(lockDir);
      writeFileSync(
        join(lockDir, "owner.json"),
        JSON.stringify({ pid: process.pid, startedAt: new Date().toISOString() }, null, 2)
      );
      return () => rmSync(lockDir, { recursive: true, force: true });
    } catch (error) {
      if (error?.code !== "EEXIST") throw error;

      if (lockCanBeReaped()) {
        rmSync(lockDir, { recursive: true, force: true });
        continue;
      }

      if (Date.now() - startedAt > lockTimeoutMs) {
        console.error("[preflight] timed out waiting for studio recipe artifact rebuild lock.");
        process.exit(1);
      }
      sleepSync(250);
    }
  }
}

const newestCoreSourceMtime = Math.max(...coreSourceRoots.map(newestMtimeMs));
const newestCoreDistMtime = Math.max(...coreDistRoots.map(newestMtimeMs));
if (newestCoreSourceMtime > newestCoreDistMtime) {
  console.error(
    "[preflight] @swooper/mapgen-core dist is older than source. Run `bun run --cwd packages/mapgen-core build`, then retry Studio."
  );
  process.exit(1);
}

if (isCurrent(getArtifactState())) {
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

const releaseRebuildLock = acquireRebuildLock();
let rebuildStatus = 0;
try {
  const lockedState = getArtifactState();
  if (!isCurrent(lockedState)) {
    if (lockedState.artifactsAreStale) {
      console.log("[preflight] studio recipe artifacts are stale; rebuilding.");
    }

    const result = spawnSync("bun", ["run", "build:studio-recipes"], {
      cwd: join(repoRoot, "mods", "mod-swooper-maps"),
      stdio: "inherit",
      env: process.env,
    });
    rebuildStatus = result.status ?? 1;
  }
} finally {
  releaseRebuildLock();
}
if (rebuildStatus !== 0) {
  process.exit(rebuildStatus);
}

const stillMissing = requiredArtifacts.filter((rel) => !existsSync(join(repoRoot, rel)));
if (stillMissing.length > 0) {
  console.error(
    `[preflight] studio recipe artifacts still missing after build:\n${stillMissing.map((p) => `- ${p}`).join("\n")}`
  );
  process.exit(1);
}
