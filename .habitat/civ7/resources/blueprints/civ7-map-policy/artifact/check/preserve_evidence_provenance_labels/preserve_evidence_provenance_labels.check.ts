#!/usr/bin/env bun
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const repoRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], {
  encoding: "utf8",
}).trim();
const source = readFileSync(join(repoRoot, "packages/civ7-map-policy/src/civ7-tables.gen.ts"), "utf8");
const failures: string[] = [];

if (!source.includes("Source evidence:")) failures.push("missing Source evidence label");
for (const forbidden of [
  "Source of truth: Civ7 official",
  "Source of truth: `Base/modules/base-standard/data/terrain.xml`",
]) {
  if (source.includes(forbidden)) failures.push(`contains forbidden provenance label: ${forbidden}`);
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}
