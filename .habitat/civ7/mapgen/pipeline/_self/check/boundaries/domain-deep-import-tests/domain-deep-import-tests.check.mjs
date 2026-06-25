#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import ts from "typescript";

const repoRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], {
  encoding: "utf8",
}).trim();
const roots = [
  path.join(repoRoot, "mods/mod-swooper-maps/test"),
  ...packageTestRoots(path.join(repoRoot, "packages")),
];
const files = roots.flatMap((root) => collectSourceFiles(root));
const violations = files.flatMap(scanFile);

if (violations.length > 0) {
  console.error("Domain deep import test violations:");
  for (const violation of violations) {
    console.error(`${violation.file}:${violation.line}:${violation.column}: ${violation.source}`);
  }
  process.exit(1);
}

console.log(`No domain deep import test violations found across ${files.length} test files.`);

function packageTestRoots(packagesRoot) {
  if (!existsSync(packagesRoot)) return [];
  return readdirSync(packagesRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(packagesRoot, entry.name, "test"))
    .filter((candidate) => existsSync(candidate));
}

function collectSourceFiles(root) {
  if (!existsSync(root)) return [];
  const stats = statSync(root);
  if (stats.isFile()) return isSourceFile(root) ? [root] : [];
  if (!stats.isDirectory()) return [];
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(root, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === "dist" || entry.name === ".git") {
        return [];
      }
      return collectSourceFiles(absolute);
    }
    return entry.isFile() && isSourceFile(absolute) ? [absolute] : [];
  });
}

function scanFile(file) {
  const sourceText = readFileSync(file, "utf8");
  const sourceFile = ts.createSourceFile(file, sourceText, ts.ScriptTarget.Latest, true);
  const violations = [];
  visit(sourceFile);
  return violations;

  function visit(node) {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
      const moduleSpecifier = node.moduleSpecifier;
      if (moduleSpecifier && ts.isStringLiteral(moduleSpecifier)) {
        const source = moduleSpecifier.text;
        if (isForbiddenDomainSource(source)) {
          const position = sourceFile.getLineAndCharacterOfPosition(moduleSpecifier.getStart());
          violations.push({
            file: path.relative(repoRoot, file),
            line: position.line + 1,
            column: position.character + 1,
            source,
          });
        }
      }
    }
    ts.forEachChild(node, visit);
  }
}

function isForbiddenDomainSource(source) {
  const match = /^@mapgen\/domain\/[^/]+(?:\/(.+))?$/.exec(source);
  if (!match) return false;
  const tail = match[1];
  if (!tail) return false;
  return tail !== "ops" && tail !== "ops/index.js" && tail !== "config.js";
}

function isSourceFile(file) {
  return file.endsWith(".ts") || file.endsWith(".tsx");
}
