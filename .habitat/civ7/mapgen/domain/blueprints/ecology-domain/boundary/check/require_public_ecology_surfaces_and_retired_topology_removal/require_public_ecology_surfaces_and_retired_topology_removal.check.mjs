#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import ts from "typescript";

const repoRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], {
  encoding: "utf8",
}).trim();
const modRoot = path.join(repoRoot, "mods/mod-swooper-maps");
const activeStageRoots = [
  "src/recipes/standard/stages/ecology-biomes",
  "src/recipes/standard/stages/ecology-features",
  "src/recipes/standard/stages/ecology-pedology",
  "src/recipes/standard/stages/map-ecology",
];
const retiredStageDirs = [
  "src/recipes/standard/stages/ecology/steps",
  "src/recipes/standard/stages/ecology-features-score",
  "src/recipes/standard/stages/ecology-ice",
  "src/recipes/standard/stages/ecology-reefs",
  "src/recipes/standard/stages/ecology-wetlands",
  "src/recipes/standard/stages/ecology-vegetation",
];

const findings = [];

for (const retiredDir of retiredStageDirs) {
  if (existsSync(path.join(modRoot, retiredDir))) {
    findings.push(`${retiredDir}: retired ecology topology directory exists`);
  }
}

for (const root of activeStageRoots) {
  const absoluteRoot = path.join(modRoot, root);
  if (!existsSync(absoluteRoot)) {
    findings.push(`${root}: active ecology stage root is missing`);
    continue;
  }
  for (const file of walkFiles(absoluteRoot)) scanFile(file);
}

if (findings.length > 0) {
  console.error(
    ["[habitat-check] require_public_ecology_surfaces_and_retired_topology_removal found forbidden topology/imports:", ...findings].join(
      "\n"
    )
  );
  process.exit(1);
}

console.log("require_public_ecology_surfaces_and_retired_topology_removal guard passed.");

function walkFiles(root) {
  const out = [];
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) {
      out.push(...walkFiles(full));
      continue;
    }
    if (entry.isFile() && full.endsWith(".ts")) out.push(full);
  }
  return out.sort();
}

function scanFile(file) {
  const text = readFileSync(file, "utf8");
  const sourceFile = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);

  for (const statement of sourceFile.statements) {
    if (
      ts.isImportDeclaration(statement) &&
      ts.isStringLiteral(statement.moduleSpecifier) &&
      isForbiddenEcologyStepSource(statement.moduleSpecifier.text)
    ) {
      findings.push(
        formatFinding(file, sourceFile, statement, "import", statement.moduleSpecifier.text)
      );
    }

    if (
      ts.isExportDeclaration(statement) &&
      statement.moduleSpecifier &&
      ts.isStringLiteral(statement.moduleSpecifier) &&
      isForbiddenEcologyStepSource(statement.moduleSpecifier.text)
    ) {
      findings.push(
        formatFinding(file, sourceFile, statement, "export", statement.moduleSpecifier.text)
      );
    }
  }
}

function isForbiddenEcologyStepSource(source) {
  return /^@mapgen\/domain\/ecology\/(?:ops|rules)(?:$|\/)/u.test(source);
}

function formatFinding(file, sourceFile, node, kind, source) {
  const line = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1;
  return `${toRepoRelative(file)}:${line} [${kind}] ${source}`;
}

function toRepoRelative(file) {
  return path.relative(repoRoot, file).split(path.sep).join("/");
}
