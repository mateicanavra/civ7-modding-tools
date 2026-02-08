import { describe, expect, it } from "bun:test";

import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

type Finding = Readonly<{
  file: string; // repo-root-relative
  line: number;
  kind: "ops-impl-import" | "rules-import" | "manual-normalize";
  text: string; // single-line snippet
}>;

function walkTsFiles(rootDir: string): string[] {
  const out: string[] = [];
  const entries = readdirSync(rootDir, { withFileTypes: true });
  for (const entry of entries) {
    const abs = path.join(rootDir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walkTsFiles(abs));
      continue;
    }
    if (!entry.isFile()) continue;
    if (!abs.endsWith(".ts")) continue;
    out.push(abs);
  }
  return out.sort((a, b) => a.localeCompare(b));
}

function stripCommentsPreserveNewlines(text: string): string {
  // Lightweight JS/TS comment stripper to avoid obvious false positives in scans.
  // Keeps newlines so line numbers remain accurate.
  let out = "";
  let inLine = false;
  let inBlock = false;
  let inSingle = false;
  let inDouble = false;
  let inTemplate = false;
  let escaped = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i] ?? "";
    const next = text[i + 1] ?? "";

    if (inLine) {
      if (ch === "\n") {
        inLine = false;
        out += "\n";
      } else {
        out += " ";
      }
      continue;
    }

    if (inBlock) {
      if (ch === "*" && next === "/") {
        inBlock = false;
        out += "  ";
        i++;
        continue;
      }
      out += ch === "\n" ? "\n" : " ";
      continue;
    }

    if (inSingle) {
      out += ch;
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === "\\") {
        escaped = true;
        continue;
      }
      if (ch === "'") inSingle = false;
      continue;
    }

    if (inDouble) {
      out += ch;
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === "\\") {
        escaped = true;
        continue;
      }
      if (ch === '"') inDouble = false;
      continue;
    }

    if (inTemplate) {
      out += ch;
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === "\\") {
        escaped = true;
        continue;
      }
      if (ch === "`") inTemplate = false;
      continue;
    }

    // Not currently in string/comment.
    if (ch === "/" && next === "/") {
      inLine = true;
      out += "  ";
      i++;
      continue;
    }
    if (ch === "/" && next === "*") {
      inBlock = true;
      out += "  ";
      i++;
      continue;
    }

    if (ch === "'") {
      inSingle = true;
      out += ch;
      continue;
    }
    if (ch === '"') {
      inDouble = true;
      out += ch;
      continue;
    }
    if (ch === "`") {
      inTemplate = true;
      out += ch;
      continue;
    }

    out += ch;
  }

  return out;
}

function scanStepDir(dir: string, repoRoot: string): Finding[] {
  const findings: Finding[] = [];
  const files = walkTsFiles(dir);

  for (const absFile of files) {
    const originalText = readFileSync(absFile, "utf8");
    const stripped = stripCommentsPreserveNewlines(originalText);
    const lines = stripped.split(/\r?\n/u);
    const originalLines = originalText.split(/\r?\n/u);
    const relFile = path.relative(repoRoot, absFile);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i] ?? "";

      // Capture module specifiers from common import/export patterns, one line at a time.
      const specs: string[] = [];

      // import "x"
      const sideEffect = /^\s*import\s+["']([^"']+)["']\s*;?\s*$/u.exec(line);
      if (sideEffect?.[1]) specs.push(sideEffect[1]);

      // import ... from "x" | export ... from "x"
      for (const match of line.matchAll(/\bfrom\s+["']([^"']+)["']/gu)) {
        if (match[1]) specs.push(match[1]);
      }

      // import("x")
      for (const match of line.matchAll(/\bimport\s*\(\s*["']([^"']+)["']\s*\)/gu)) {
        if (match[1]) specs.push(match[1]);
      }

      // require("x")
      for (const match of line.matchAll(/\brequire\s*\(\s*["']([^"']+)["']\s*\)/gu)) {
        if (match[1]) specs.push(match[1]);
      }

      if (specs.length === 0) continue;

      for (const spec of specs) {
        if (spec.startsWith("@mapgen/domain/ecology/ops")) {
          findings.push({
            file: relFile,
            line: i + 1,
            kind: "ops-impl-import",
            text: (originalLines[i] ?? "").trim(),
          });
        }
        if (spec.includes("rules/")) {
          findings.push({
            file: relFile,
            line: i + 1,
            kind: "rules-import",
            text: (originalLines[i] ?? "").trim(),
          });
        }
      }
    }

    // Gate for the known drift location: step-owned normalize should not be used here.
    if (relFile.endsWith("src/recipes/standard/stages/ecology/steps/features-plan/index.ts")) {
      const match = stripped.match(/\bnormalize\s*:\s*\(/u);
      if (match?.index != null) {
        const prefix = stripped.slice(0, match.index);
        const lineNo = prefix.split("\n").length; // 1-based
        const snippet = (originalLines[lineNo - 1] ?? "").trim();
        findings.push({
          file: relFile,
          line: lineNo,
          kind: "manual-normalize",
          text: snippet,
        });
      }
    }
  }

  return findings;
}

function formatFindings(findings: Finding[]): string {
  const byFile = new Map<string, Finding[]>();
  for (const finding of findings) {
    const arr = byFile.get(finding.file) ?? [];
    arr.push(finding);
    byFile.set(finding.file, arr);
  }

  const files = [...byFile.keys()].sort((a, b) => a.localeCompare(b));
  const lines: string[] = [];

  lines.push("Forbidden step imports detected (Gate G1/G2):");
  for (const file of files) {
    const fileFindings = (byFile.get(file) ?? []).sort((a, b) => a.line - b.line);
    lines.push("");
    lines.push(`diff --git a/${file} b/${file}`);
    for (const f of fileFindings) {
      lines.push(`@@ L${f.line} (${f.kind})`);
      lines.push(`- ${f.text}`);
    }
  }
  return lines.join("\n");
}

describe("M2 guardrails: ecology steps must not deep-import ops implementations or rules", () => {
  it("enforces Gate G1/G2 for ecology and map-ecology step runtime code", () => {
    const modRoot = fileURLToPath(new URL("../..", import.meta.url));
    const repoRoot = path.resolve(modRoot, "..", "..");
    const ecologyStepsDir = path.join(modRoot, "src/recipes/standard/stages/ecology/steps");
    const mapEcologyStepsDir = path.join(modRoot, "src/recipes/standard/stages/map-ecology/steps");

    const findings = [
      ...scanStepDir(ecologyStepsDir, repoRoot),
      ...scanStepDir(mapEcologyStepsDir, repoRoot),
    ];

    const message = findings.length === 0 ? "" : formatFindings(findings);
    expect(findings.length, message).toBe(0);
  });
});

