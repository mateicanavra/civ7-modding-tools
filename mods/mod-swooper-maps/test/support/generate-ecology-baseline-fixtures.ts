import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { computeEcologyBaselineV1 } from "./ecology-fixtures.js";

function ensureDir(path: string): void {
  mkdirSync(path, { recursive: true });
}

function writeText(path: string, text: string): void {
  ensureDir(dirname(path));
  writeFileSync(path, text, "utf8");
}

function writeJson(path: string, value: unknown): void {
  writeText(path, `${JSON.stringify(value, null, 2)}\n`);
}

function main(): void {
  const baseline = computeEcologyBaselineV1();

  const fixturesRoot = join(process.cwd(), "test", "fixtures");
  const artifactsPath = join(fixturesRoot, "ecology-parity", "ecology-artifacts-fingerprints.v1.json");
  const vizKeysPath = join(fixturesRoot, "viz-keys", "ecology-vizkeys-v1.txt");

  writeJson(artifactsPath, {
    version: baseline.version,
    case: baseline.case,
    artifacts: baseline.artifacts,
  });

  writeText(vizKeysPath, `${baseline.vizKeys.join("\n")}\n`);

  // Keep output minimal (scripts are often run in CI/agents).
  console.log(JSON.stringify({ ok: true, artifactsPath, vizKeysPath }));
}

main();

