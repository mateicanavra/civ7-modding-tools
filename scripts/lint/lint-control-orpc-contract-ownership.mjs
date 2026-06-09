#!/usr/bin/env node

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("../..", import.meta.url));
const contractRoot = join(
  repoRoot,
  "packages/civ7-control-orpc/src/modules",
);

const contractFiles = collectContractFiles(contractRoot);
const violations = [];

for (const file of contractFiles) {
  const source = readFileSync(file, "utf8");
  const lines = source.split(/\r?\n/);
  lines.forEach((line, index) => {
    if (line.includes("@civ7/direct-control")) {
      violations.push({
        path: relative(repoRoot, file),
        line: index + 1,
        text: line.trim(),
      });
    }
  });
}

if (violations.length > 0) {
  console.error("control-oRPC contract ownership guard failed:");
  for (const violation of violations) {
    console.error(
      `- ${violation.path}:${violation.line} imports direct-control in a service contract: ${violation.text}`,
    );
  }
  console.error(
    "Move caller-facing contract schemas into packages/civ7-control-orpc, or keep direct-control imports in runtime/proof procedures instead.",
  );
  process.exit(1);
}

console.log("control-oRPC contract ownership guard passed.");

function collectContractFiles(directory) {
  const files = [];
  for (const entry of readdirSync(directory)) {
    const path = join(directory, entry);
    const stats = statSync(path);
    if (stats.isDirectory()) {
      files.push(...collectContractFiles(path));
      continue;
    }
    if (entry === "contract.ts") files.push(path);
  }
  return files.sort();
}
