#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import ts from "typescript";

export const repoRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], {
  encoding: "utf8",
}).trim();
export const modRoot = path.join(repoRoot, "mods/mod-swooper-maps");
export const srcRoot = path.join(modRoot, "src");
export const stagesRoot = path.join(srcRoot, "recipes/standard/stages");

export function read(absFile) {
  return readFileSync(absFile, "utf8");
}

export function readMod(relativeFile) {
  return read(path.join(modRoot, relativeFile));
}

export function readRepo(relativeFile) {
  return read(path.join(repoRoot, relativeFile));
}

export function repoRel(absFile) {
  return path.relative(repoRoot, absFile).split(path.sep).join("/");
}

export function modRel(absFile) {
  return path.relative(modRoot, absFile).split(path.sep).join("/");
}

export function pathExists(absPath) {
  return existsSync(absPath);
}

export function walkFiles(root, extensions = [".ts"]) {
  if (!existsSync(root)) return [];
  const out = [];
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) {
      out.push(...walkFiles(full, extensions));
      continue;
    }
    if (entry.isFile() && extensions.some((extension) => full.endsWith(extension))) out.push(full);
  }
  return out.sort();
}

export function existingFiles(candidates, extensions = [".ts"]) {
  return candidates.flatMap((candidate) => {
    if (!existsSync(candidate)) return [];
    const stat = statSync(candidate);
    if (stat.isDirectory()) return walkFiles(candidate, extensions);
    return extensions.some((extension) => candidate.endsWith(extension)) ? [candidate] : [];
  });
}

export function lineOf(text, index) {
  return text.slice(0, index).split("\n").length;
}

export function textFindings(absFile, tokens, rule) {
  const text = read(absFile);
  return tokens.flatMap((token) => {
    const findings = [];
    let index = text.indexOf(token);
    while (index !== -1) {
      findings.push({ file: repoRel(absFile), line: lineOf(text, index), rule, detail: token });
      index = text.indexOf(token, index + token.length);
    }
    return findings;
  });
}

export function regexFindings(absFile, patterns, rule) {
  const text = read(absFile);
  return patterns.flatMap((pattern) =>
    Array.from(text.matchAll(pattern)).map((match) => ({
      file: repoRel(absFile),
      line: lineOf(text, match.index ?? 0),
      rule,
      detail: match[0].trim(),
    }))
  );
}

export function importSources(absFile) {
  const text = read(absFile);
  const sourceFile = ts.createSourceFile(absFile, text, ts.ScriptTarget.Latest, true);
  const sources = [];
  for (const statement of sourceFile.statements) {
    if (ts.isImportDeclaration(statement) && ts.isStringLiteral(statement.moduleSpecifier)) {
      sources.push({
        kind: "import",
        source: statement.moduleSpecifier.text,
        line: sourceFile.getLineAndCharacterOfPosition(statement.getStart(sourceFile)).line + 1,
        text: statement.getText(sourceFile),
      });
    }
    if (
      ts.isExportDeclaration(statement) &&
      statement.moduleSpecifier &&
      ts.isStringLiteral(statement.moduleSpecifier)
    ) {
      sources.push({
        kind: "export",
        source: statement.moduleSpecifier.text,
        line: sourceFile.getLineAndCharacterOfPosition(statement.getStart(sourceFile)).line + 1,
        text: statement.getText(sourceFile),
      });
    }
  }
  return sources;
}

export function callers(files, pattern) {
  return files
    .filter((file) => pattern.test(read(file)))
    .map(repoRel)
    .sort();
}

export function assertEqual(actual, expected, rule, detail) {
  if (JSON.stringify(actual) === JSON.stringify(expected)) return [];
  return [
    {
      file: "(computed)",
      line: 1,
      rule,
      detail: `${detail}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`,
    },
  ];
}

export function assertContains(absFile, token, rule) {
  return read(absFile).includes(token)
    ? []
    : [{ file: repoRel(absFile), line: 1, rule, detail: `missing ${token}` }];
}

export function assertNoFindings(ruleId, findings) {
  if (findings.length === 0) {
    console.log(`${ruleId} guard passed.`);
    return;
  }
  console.error(
    [
      `[habitat-check] ${ruleId} found ${findings.length} violation(s):`,
      ...findings.map(format),
    ].join("\n")
  );
  process.exit(1);
}

function format(finding) {
  return `${finding.file}:${finding.line} [${finding.rule}] ${finding.detail}`;
}
