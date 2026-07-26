#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const repoRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], {
  encoding: "utf8",
}).trim();
export const modRoot = path.join(repoRoot, "mods/mod-swooper-maps");

export function read(absFile) {
  return readFileSync(absFile, "utf8");
}

export function repoRel(absFile) {
  return path.relative(repoRoot, absFile).split(path.sep).join("/");
}

export function modRel(absFile) {
  return path.relative(modRoot, absFile).split(path.sep).join("/");
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
