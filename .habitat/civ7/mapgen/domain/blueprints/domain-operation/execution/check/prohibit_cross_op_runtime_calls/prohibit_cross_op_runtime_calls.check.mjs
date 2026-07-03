#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import ts from "typescript";

const repoRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], {
  encoding: "utf8",
}).trim();
const domainRoot = path.join(repoRoot, "mods/mod-swooper-maps/src/domain");

const findings = [];
for (const file of walkFiles(domainRoot).filter(isOpRuntimeEntrypoint)) {
  const text = readFileSync(file, "utf8");
  const sourceFile = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
  scanModuleSources(sourceFile, file);
  scanLocalOrchestration(text, file);
}

if (findings.length > 0) {
  console.error(
    [
      "[habitat-check] prohibit_cross_op_runtime_calls found forbidden domain op orchestration:",
      ...findings.map(formatFinding),
    ].join("\n")
  );
  process.exit(1);
}

console.log("prohibit_cross_op_runtime_calls guard passed.");

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

function isOpRuntimeEntrypoint(file) {
  return /\/mods\/mod-swooper-maps\/src\/domain\/[^/]+\/ops\/[^/]+\/index\.ts$/.test(toPosix(file));
}

function scanModuleSources(sourceFile, file) {
  for (const statement of sourceFile.statements) {
    if (
      ts.isImportDeclaration(statement) &&
      ts.isStringLiteral(statement.moduleSpecifier) &&
      isForbiddenSource(statement.moduleSpecifier.text)
    ) {
      findings.push(finding(file, sourceFile, statement, "import", statement.moduleSpecifier.text));
    }

    if (
      ts.isExportDeclaration(statement) &&
      statement.moduleSpecifier &&
      ts.isStringLiteral(statement.moduleSpecifier) &&
      isForbiddenSource(statement.moduleSpecifier.text)
    ) {
      findings.push(finding(file, sourceFile, statement, "export", statement.moduleSpecifier.text));
    }
  }
}

function scanLocalOrchestration(text, file) {
  const patterns = [
    { rule: "ops.bind orchestration", pattern: /\bops\.bind\(/g },
    { rule: "runValidated orchestration", pattern: /\brunValidated\(/g },
    {
      rule: "dynamic sibling op import",
      pattern: /\bimport\s*\(\s*["'](\.\.\/[^"']+\/index\.js)["']\s*\)/g,
    },
    {
      rule: "dynamic domain ops import",
      pattern: /\bimport\s*\(\s*["'](@mapgen\/domain\/[^"']+\/ops(?:\/index\.js)?)["']\s*\)/g,
    },
  ];

  for (const { rule, pattern } of patterns) {
    pattern.lastIndex = 0;
    for (const match of text.matchAll(pattern)) {
      findings.push({
        file: toRepoRelative(file),
        line: countLines(text, match.index ?? 0),
        rule,
        source: match[1] ?? match[0],
      });
    }
  }
}

function isForbiddenSource(source) {
  return (
    /^\.\.\/[^/]+\/index\.js$/.test(source) ||
    /^@mapgen\/domain\/[^/]+\/ops(?:\/index\.js)?$/.test(source)
  );
}

function finding(file, sourceFile, node, rule, source) {
  return {
    file: toRepoRelative(file),
    line: sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1,
    rule,
    source,
  };
}

function formatFinding(item) {
  return `${item.file}:${item.line} [${item.rule}] ${item.source}`;
}

function countLines(input, end) {
  return input.slice(0, end).split("\n").length;
}

function toRepoRelative(file) {
  return path.relative(repoRoot, file).split(path.sep).join("/");
}

function toPosix(file) {
  return file.split(path.sep).join("/");
}
