#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const repoRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], {
  encoding: "utf8",
}).trim();

const requiredArtifacts = [
  // Studio worker imports @civ7/adapter/mock.
  "packages/civ7-adapter/dist/mock-adapter.js",
  "packages/mapgen-core/dist/index.js",
  "packages/mapgen-viz/dist/index.js",
  "packages/mapgen-viz/dist/index.d.ts",
];

const missingArtifacts = requiredArtifacts.filter((rel) => !existsSync(join(repoRoot, rel)));

if (missingArtifacts.length === 0) {
  process.exit(0);
}

console.error(
  [
    "[habitat-check] viz runtime deps are missing:",
    ...missingArtifacts.map((artifact) => `- ${artifact}`),
    "",
    "Run `bun run --cwd mods/mod-swooper-maps viz:runtime-deps` to build the package-local runtime deps.",
  ].join("\n")
);
process.exit(1);
