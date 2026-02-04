import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

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

const hasTsup = existsSync(join(repoRoot, "node_modules", ".bin", "tsup"));
if (!hasTsup) {
  console.error("[preflight] missing dev deps (tsup). Run `bun install` at repo root, then retry.");
  process.exit(1);
}

const run = (cwdRel, args) => {
  const result = spawnSync(args[0], args.slice(1), {
    cwd: join(repoRoot, cwdRel),
    stdio: "inherit",
    env: process.env,
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

// Keep this explicit (no Turbo calls) to avoid recursion when invoked from Turbo tasks.
// Order matters: mapgen-core imports mapgen-viz types from dist.
run("packages/mapgen-viz", ["bun", "run", "build"]);
run("packages/mapgen-core", ["bun", "run", "build"]);
run("packages/civ7-adapter", ["bun", "run", "build"]);

const stillMissing = requiredArtifacts.filter((rel) => !existsSync(join(repoRoot, rel)));
if (stillMissing.length > 0) {
  console.error(
    `[preflight] viz runtime deps still missing after build:\n${stillMissing.map((p) => `- ${p}`).join("\n")}`
  );
  process.exit(1);
}
