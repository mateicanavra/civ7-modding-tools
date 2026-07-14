#!/usr/bin/env node
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const checkoutDocsPathPattern = /\/(?:Users|home|Volumes)\/[^`\s)]+\/(docs\/[^`\s)]+\.md)\b/g;
const findingFileLimit = 10;

/**
 * Finds checkout-specific Markdown paths and their durable repo-relative replacements.
 * This regex is the rule's sole detection authority.
 */
export function findCheckoutDocsPaths(markdown) {
  return [...markdown.matchAll(checkoutDocsPathPattern)].map((match) => ({
    absolutePath: match[0],
    replacement: match[1],
    index: match.index,
    line: lineAtOffset(markdown, match.index),
  }));
}

/** Scans one Markdown document without reading or writing the filesystem. */
export function scanPortableDocsMarkdown(file, markdown) {
  const findings = findCheckoutDocsPaths(markdown);
  if (findings.length === 0) return undefined;
  return {
    file,
    occurrenceCount: findings.length,
    firstFinding: findings[0],
  };
}

export function runPortableDocsCheck(repoRoot) {
  const docsRoot = path.join(repoRoot, "docs");
  const violations = markdownFiles(docsRoot)
    .map((file) => scanPortableDocsMarkdown(toRepoPath(repoRoot, file), readFileSync(file, "utf8")))
    .filter((violation) => violation !== undefined);
  const occurrenceCount = violations.reduce(
    (total, violation) => total + violation.occurrenceCount,
    0
  );

  if (violations.length === 0) {
    console.log("Portable docs checkout path check passed.");
    return 0;
  }

  for (const violation of violations.slice(0, findingFileLimit)) {
    const finding = violation.firstFinding;
    console.error(
      `${violation.file}:${finding.line}: ${finding.absolutePath} -> ${finding.replacement}`
    );
  }
  if (violations.length > findingFileLimit) {
    console.error(`... ${violations.length - findingFileLimit} additional files omitted.`);
  }
  console.error(
    `Found ${occurrenceCount} checkout-specific docs path occurrences across ${violations.length} files.`
  );
  return 1;
}

function markdownFiles(directory) {
  return readdirSync(directory, { withFileTypes: true })
    .sort((left, right) => compareText(left.name, right.name))
    .flatMap((entry) => {
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) return markdownFiles(absolute);
      return entry.isFile() && entry.name.endsWith(".md") ? [absolute] : [];
    });
}

function lineAtOffset(source, offset) {
  let line = 1;
  for (let index = 0; index < offset; index += 1) {
    if (source[index] === "\n") line += 1;
  }
  return line;
}

function toRepoPath(repoRoot, file) {
  return path.relative(repoRoot, file).split(path.sep).join("/");
}

function compareText(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  process.exitCode = runPortableDocsCheck(process.cwd());
}
