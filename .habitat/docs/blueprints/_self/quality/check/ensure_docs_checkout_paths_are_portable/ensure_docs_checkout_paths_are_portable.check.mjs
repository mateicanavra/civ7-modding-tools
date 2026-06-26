#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const repoRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], {
  encoding: "utf8",
}).trim();
const docsRoot = path.join(repoRoot, "docs");
const message = "Replace local absolute docs paths with durable repo-relative docs paths.";
const localPathPattern = /\/(?:Users|home|Volumes)\//;

const findings = [];
for (const filePath of await markdownFiles(docsRoot)) {
  const text = await readFile(filePath, "utf8");
  if (!text.includes("/docs/") || !text.includes(".md") || !localPathPattern.test(text)) continue;
  const line = firstMatchingLine(text, localPathPattern);
  findings.push(`${toRepoRelative(filePath)}:${line}: ${message}`);
}

if (findings.length > 0) {
  console.error(findings.join("\n"));
  process.exit(1);
}

console.log("Docs local checkout path lint passed.");

async function markdownFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const groups = await Promise.all(
    entries.map(async (entry) => {
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) return markdownFiles(absolute);
      return entry.isFile() && entry.name.endsWith(".md") ? [absolute] : [];
    })
  );
  return groups.flat();
}

function firstMatchingLine(text, pattern) {
  const index = text.split("\n").findIndex((line) => pattern.test(line));
  return index === -1 ? 1 : index + 1;
}

function toRepoRelative(filePath) {
  return path.relative(repoRoot, filePath).split(path.sep).join("/");
}
