#!/usr/bin/env bun
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const repoRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], {
  encoding: "utf8",
}).trim();
const files = [
  "mods/mod-swooper-maps/mod/config/config.xml",
  "mods/mod-swooper-maps/mod/swooper-maps.modinfo",
  "mods/mod-swooper-maps/mod/text/en_us/MapText.xml",
];
const failures: string[] = [];

for (const file of files) {
  const source = readFileSync(join(repoRoot, file), "utf8");
  for (const token of ["studio-current", "STUDIO_CURRENT"]) {
    if (source.includes(token)) failures.push(`${file}: contains ${token}`);
  }
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}
