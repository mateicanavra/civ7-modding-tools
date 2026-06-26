#!/usr/bin/env bun
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

type Finding = Readonly<{
  file: string;
  line: number;
  pattern: string;
  text: string;
}>;

const repoRoot = execFileSync("git", ["rev-parse", "--show-toplevel"], {
  encoding: "utf8",
}).trim();
const adapterRoot = path.join(repoRoot, "packages/civ7-adapter/src");

function walkFiles(rootDir: string, exts: readonly string[]): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(rootDir, { withFileTypes: true })) {
    const abs = path.join(rootDir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walkFiles(abs, exts));
    } else if (entry.isFile() && exts.some((ext) => abs.endsWith(ext))) {
      out.push(abs);
    }
  }
  return out.sort((a, b) => a.localeCompare(b));
}

function scanFile(
  absFile: string,
  patterns: readonly { name: string; re: RegExp }[]
): Finding[] {
  const text = readFileSync(absFile, "utf8");
  const lines = text.split(/\r?\n/u);
  const relFile = path.relative(repoRoot, absFile);
  const findings: Finding[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? "";
    for (const { name, re } of patterns) {
      if (re.test(line)) findings.push({ file: relFile, line: i + 1, pattern: name, text: line.trim() });
    }
  }
  return findings;
}

const adapterPatterns = [
  { name: "createLabelRng", re: /\bcreateLabelRng\b/u },
  { name: "rngCall", re: /\brng\s*\(/u },
  { name: "rollPercent", re: /\brollPercent\b/u },
  { name: "coverageChance", re: /\bcoverageChance\b/u },
  { name: "legacy.addNaturalWonders", re: /\baddNaturalWonders\s*\(/u },
  { name: "legacy.naturalWonderModule", re: /natural-wonder-generator\.js/u },
];

const findings = walkFiles(adapterRoot, [".ts"])
  .filter((file) => !file.endsWith(path.join("packages", "civ7-adapter", "src", "mock-adapter.ts")))
  .flatMap((file) => scanFile(file, adapterPatterns));

if (findings.length > 0) {
  console.error(
    findings
      .sort((a, b) => `${a.file}:${a.line}`.localeCompare(`${b.file}:${b.line}`))
      .map((finding) => `${finding.file}:${finding.line} [${finding.pattern}] ${finding.text}`)
      .join("\n")
  );
  process.exit(1);
}
