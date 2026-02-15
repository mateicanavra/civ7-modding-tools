import { describe, expect, it } from "bun:test";

import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

type Finding = Readonly<{
  file: string; // repo-root-relative
  line: number;
  pattern: string;
  text: string;
}>;

function walkFiles(rootDir: string, exts: readonly string[]): string[] {
  const out: string[] = [];
  const entries = readdirSync(rootDir, { withFileTypes: true });
  for (const entry of entries) {
    const abs = path.join(rootDir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walkFiles(abs, exts));
      continue;
    }
    if (!entry.isFile()) continue;
    if (!exts.some((ext) => abs.endsWith(ext))) continue;
    out.push(abs);
  }
  return out.sort((a, b) => a.localeCompare(b));
}

function scanFile(absFile: string, repoRoot: string, patterns: readonly { name: string; re: RegExp }[]): Finding[] {
  const text = readFileSync(absFile, "utf8");
  const lines = text.split(/\r?\n/u);
  const relFile = path.relative(repoRoot, absFile);
  const findings: Finding[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? "";
    for (const { name, re } of patterns) {
      if (!re.test(line)) continue;
      findings.push({ file: relFile, line: i + 1, pattern: name, text: line.trim() });
    }
  }

  return findings;
}

function formatFindings(findings: readonly Finding[]): string {
  const byFile = new Map<string, Finding[]>();
  for (const finding of findings) {
    const arr = byFile.get(finding.file) ?? [];
    arr.push(finding);
    byFile.set(finding.file, arr);
  }

  const files = [...byFile.keys()].sort((a, b) => a.localeCompare(b));
  const lines: string[] = [];
  for (const file of files) {
    const fileFindings = (byFile.get(file) ?? []).sort((a, b) => a.line - b.line);
    for (const finding of fileFindings) {
      lines.push(`${finding.file}:${finding.line} [${finding.pattern}] ${finding.text}`);
    }
  }
  return lines.join("\n");
}

describe("M3 no-fudging posture (static scan)", () => {
  it("has no probabilistic gating constructs in ecology planning surfaces", () => {
    const testDir = path.dirname(fileURLToPath(import.meta.url));
    const repoRoot = path.resolve(testDir, "..", "..");

    const roots = [
      path.join(repoRoot, "src", "domain", "ecology"),
      path.join(repoRoot, "src", "recipes", "standard", "stages", "ecology"),
      path.join(repoRoot, "src", "recipes", "standard", "stages", "ecology-pedology"),
      path.join(repoRoot, "src", "recipes", "standard", "stages", "ecology-biomes"),
      path.join(repoRoot, "src", "recipes", "standard", "stages", "ecology-features-score"),
      path.join(repoRoot, "src", "recipes", "standard", "stages", "ecology-ice"),
      path.join(repoRoot, "src", "recipes", "standard", "stages", "ecology-reefs"),
      path.join(repoRoot, "src", "recipes", "standard", "stages", "ecology-wetlands"),
      path.join(repoRoot, "src", "recipes", "standard", "stages", "ecology-vegetation"),
      path.join(repoRoot, "src", "recipes", "standard", "stages", "map-ecology"),
    ] as const;

    const exts = [".ts", ".json"] as const;
    const patterns = [
      { name: "rollPercent", re: /\brollPercent\b/u },
      { name: "coverageChance", re: /\bcoverageChance\b/u },
      { name: "chance", re: /\bchance\b/iu },
      { name: "multiplier", re: /\bmultiplier\b/iu },
    ] as const;

    const files = roots.flatMap((root) => walkFiles(root, exts));
    const findings = files.flatMap((abs) => scanFile(abs, repoRoot, patterns));

    expect(findings.length, formatFindings(findings)).toBe(0);
  });

  it("keeps scoped classifier/planner runtime logic free of fudge + RNG constructs", () => {
    const testDir = path.dirname(fileURLToPath(import.meta.url));
    const repoRoot = path.resolve(testDir, "..", "..");

    const roots = [
      path.join(repoRoot, "src", "domain", "ecology", "ops", "classify-biomes", "layers"),
      path.join(repoRoot, "src", "domain", "ecology", "ops", "classify-biomes", "rules"),
      path.join(repoRoot, "src", "domain", "ecology", "ops", "features-plan-vegetation", "strategies"),
      path.join(repoRoot, "src", "domain", "ecology", "ops", "features-plan-wetlands", "strategies"),
      path.join(repoRoot, "src", "domain", "ecology", "ops", "features-plan-reefs", "strategies"),
      path.join(repoRoot, "src", "domain", "ecology", "ops", "features-plan-ice", "strategies"),
    ] as const;

    const exts = [".ts"] as const;
    const patterns = [
      { name: "createLabelRng", re: /\bcreateLabelRng\b/u },
      { name: "rngCall", re: /\brng\s*\(/u },
      { name: "bandpass", re: /\bbandpass\b/iu },
      { name: "rampUp01", re: /\brampUp01\s*\(/u },
      { name: "rampDown01", re: /\brampDown01\s*\(/u },
      { name: "window01", re: /\bwindow01\s*\(/u },
      { name: "bonusTerm", re: /\bbonus\b/iu },
      { name: "penaltyTerm", re: /\bpenalty\b/iu },
      { name: "minScoreGate", re: /\bminScore01\b.*[<>]=?|[<>]=?.*\bminScore01\b/u },
    ] as const;

    const files = roots
      .flatMap((root) => walkFiles(root, exts))
      .filter((abs) => !abs.endsWith(".schema.ts"));
    const findings = files.flatMap((abs) => scanFile(abs, repoRoot, patterns));

    expect(findings.length, formatFindings(findings)).toBe(0);
  });
});
