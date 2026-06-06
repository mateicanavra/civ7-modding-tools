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
const publicSurfaceViolations = [];

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

const publicIndex = join(
  repoRoot,
  "packages/civ7-control-orpc/src/index.ts",
);
const publicIndexSource = readFileSync(publicIndex, "utf8");
const exportBlockPattern = /export\s*\{([\s\S]*?)\}\s*from\s*"([^"]+)";/g;
const moduleContractSchemaPattern = /\bCiv7[A-Za-z0-9]+Schema\b/g;

for (const block of publicIndexSource.matchAll(exportBlockPattern)) {
  const exportedNames = block[1];
  const modulePath = block[2];
  if (!/^\.\/modules\/[^"]+\/contract$/.test(modulePath)) continue;

  const startLine = publicIndexSource.slice(0, block.index).split(/\r?\n/)
    .length;
  const blockLines = exportedNames.split(/\r?\n/);

  blockLines.forEach((line, offset) => {
    const matches = [...line.matchAll(moduleContractSchemaPattern)];
    for (const match of matches) {
      const symbol = match[0];
      const lineNumber = startLine + offset + 1;
      publicSurfaceViolations.push({
        path: relative(repoRoot, publicIndex),
        line: lineNumber,
        symbol,
        modulePath,
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

if (publicSurfaceViolations.length > 0) {
  console.error("control-oRPC public contract surface guard failed:");
  for (const violation of publicSurfaceViolations) {
    console.error(
      `- ${violation.path}:${violation.line} exports contract-local schema ${violation.symbol} from ${violation.modulePath}`,
    );
  }
  console.error(
    "Expose the aggregate contract/router/client surface from the package root; keep module schemas with their contract modules.",
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
