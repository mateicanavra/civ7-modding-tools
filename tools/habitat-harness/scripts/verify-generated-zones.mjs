#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(new URL("../../..", import.meta.url).pathname);
const mapArtifactPaths = [
  "mods/mod-swooper-maps/src/maps/generated",
  "mods/mod-swooper-maps/mod/config",
  "mods/mod-swooper-maps/mod/swooper-maps.modinfo",
  "mods/mod-swooper-maps/mod/text/en_us/MapText.xml",
];

const trackedMapFiles = git(["ls-files", "-z", "--", ...mapArtifactPaths])
  .stdout.split("\0")
  .filter(Boolean);
const snapshot = new Map(
  trackedMapFiles.map((file) => [file, readFileSync(path.join(repoRoot, file))])
);

let exitCode = 0;
try {
  const mapGen = run(["bun", "run", "--cwd", "mods/mod-swooper-maps", "gen:maps"]);
  if (mapGen.status !== 0) exitCode = 1;
  const mapDrift = git(["diff", "--name-only", "--", ...mapArtifactPaths])
    .stdout.split(/\r?\n/)
    .filter(Boolean);
  if (mapDrift.length > 0) {
    exitCode = 1;
    console.error("[habitat generated:check] gen:maps drift:");
    for (const file of mapDrift) console.error(`  - ${file}`);
  }
} finally {
  restoreSnapshot(snapshot);
  removeUntracked(mapArtifactPaths);
}

const policy = run(["bun", "run", "verify:civ7-map-policy-tables"]);
if (policy.status !== 0) exitCode = 1;

process.exit(exitCode);

function run(argv) {
  const result = spawnSync(argv[0], argv.slice(1), {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  process.stdout.write(result.stdout ?? "");
  process.stderr.write(result.stderr ?? "");
  return { status: result.status ?? 1 };
}

function git(args) {
  const result = spawnSync("git", args, {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  if ((result.status ?? 1) !== 0) {
    process.stderr.write(result.stderr ?? "");
    process.exit(result.status ?? 1);
  }
  return { stdout: result.stdout ?? "" };
}

function restoreSnapshot(files) {
  for (const [file, contents] of files) {
    const full = path.join(repoRoot, file);
    mkdirSync(path.dirname(full), { recursive: true });
    writeFileSync(full, contents);
  }
}

function removeUntracked(paths) {
  const files = git(["ls-files", "--others", "--exclude-standard", "-z", "--", ...paths])
    .stdout.split("\0")
    .filter(Boolean);
  for (const file of files) {
    const full = path.join(repoRoot, file);
    if (existsSync(full)) rmSync(full, { force: true });
  }
}
