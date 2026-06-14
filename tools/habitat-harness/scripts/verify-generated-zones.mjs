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
const preexistingUntrackedMapFiles = untrackedFiles(mapArtifactPaths);
const preexistingUntrackedSet = new Set(preexistingUntrackedMapFiles);
const trackedSnapshot = snapshotFiles(trackedMapFiles);
const untrackedSnapshot = snapshotFiles(preexistingUntrackedMapFiles);

let exitCode = 0;
try {
  const mapGen = run(["bun", "mods/mod-swooper-maps/scripts/generate-map-artifacts.ts"]);
  if (mapGen.status !== 0) exitCode = 1;
  const mapDrift = generatedDrift(trackedSnapshot, untrackedSnapshot, mapArtifactPaths);
  if (mapDrift.length > 0) {
    exitCode = 1;
    console.error("[habitat generated:check] gen:maps drift:");
    for (const file of mapDrift) console.error(`  - ${file}`);
  }
} finally {
  restoreSnapshot(trackedSnapshot);
  restoreSnapshot(untrackedSnapshot);
  removeNewUntracked(mapArtifactPaths, preexistingUntrackedSet);
}

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

function snapshotFiles(files) {
  return new Map(files.map((file) => [file, readFileSync(path.join(repoRoot, file))]));
}

function generatedDrift(trackedSnapshot, untrackedSnapshot, paths) {
  const drift = [];
  for (const [file, before] of trackedSnapshot) {
    const full = path.join(repoRoot, file);
    if (!existsSync(full) || !readFileSync(full).equals(before)) drift.push(file);
  }

  const previousUntracked = new Set(untrackedSnapshot.keys());
  for (const file of untrackedFiles(paths)) {
    const full = path.join(repoRoot, file);
    const before = untrackedSnapshot.get(file);
    if (!previousUntracked.has(file) || !before || !readFileSync(full).equals(before)) {
      drift.push(file);
    }
  }
  return drift;
}

function restoreSnapshot(files) {
  for (const [file, contents] of files) {
    const full = path.join(repoRoot, file);
    mkdirSync(path.dirname(full), { recursive: true });
    writeFileSync(full, contents);
  }
}

function untrackedFiles(paths) {
  return git(["ls-files", "--others", "--exclude-standard", "-z", "--", ...paths])
    .stdout.split("\0")
    .filter(Boolean);
}

function removeNewUntracked(paths, preexisting) {
  const files = untrackedFiles(paths).filter((file) => !preexisting.has(file));
  for (const file of files) {
    const full = path.join(repoRoot, file);
    if (existsSync(full)) rmSync(full, { force: true });
  }
}
