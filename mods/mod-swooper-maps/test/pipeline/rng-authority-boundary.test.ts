import { describe, expect, it } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

type Finding = Readonly<{
  file: string;
  line: number;
  pattern: string;
  text: string;
}>;

function walkFiles(rootDir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(rootDir, { withFileTypes: true })) {
    const abs = path.join(rootDir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walkFiles(abs));
      continue;
    }
    if (entry.isFile() && abs.endsWith(".ts")) out.push(abs);
  }
  return out.sort((a, b) => a.localeCompare(b));
}

function scanFile(absFile: string, repoRoot: string): Finding[] {
  const text = readFileSync(absFile, "utf8");
  const relFile = path.relative(repoRoot, absFile);
  const isStandardRecipeFile = relFile.startsWith(path.join("src", "recipes", "standard"));
  const lines = text.split(/\r?\n/u);
  const patterns = [
    { name: "direct-adapter-rng", re: /\.\s*getRandomNumber\s*\(/u },
    { name: "terrainbuilder-rng", re: /\bTerrainBuilder\s*\.\s*getRandomNumber\s*\(/u },
    { name: "ambient-random", re: /\bMath\s*\.\s*random\s*\(/u },
    { name: "official-lakes-generator", re: /\.\s*generateLakes\s*\(/u },
    { name: "official-biome-generator", re: /\.\s*designateBiomes\s*\(/u },
    { name: "official-feature-generator", re: /\.\s*addFeatures\s*\(/u },
    { name: "official-snow-generator", re: /\.\s*generateSnow\s*\(/u },
    {
      name: "official-resource-generator",
      re: /\.\s*(?:generateResources|generateOfficialResources)\s*\(/u,
    },
    {
      name: "official-discovery-generator",
      re: /\.\s*(?:generateDiscoveries|generateOfficialDiscoveries)\s*\(/u,
    },
    {
      name: "official-start-generator",
      re: /\.\s*(?:assignStartPositions|chooseStartSectors)\s*\(/u,
    },
  ] as const;

  const findings: Finding[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? "";
    for (const { name, re } of patterns) {
      if (!re.test(line)) continue;
      findings.push({ file: relFile, line: i + 1, pattern: name, text: line.trim() });
    }
    if (
      (isStandardRecipeFile || relFile.startsWith(path.join("src", "domain"))) &&
      /from\s+["']@swooper\/mapgen-core\/lib\/rng/u.test(line)
    ) {
      findings.push({
        file: relFile,
        line: i + 1,
        pattern: "authored-generation-internal-rng-import",
        text: line.trim(),
      });
    }
  }
  return findings;
}

function formatFindings(findings: readonly Finding[]): string {
  return findings
    .map((finding) => `${finding.file}:${finding.line} [${finding.pattern}] ${finding.text}`)
    .join("\n");
}

describe("authored RNG authority boundary", () => {
  it("keeps standard recipe and domain generation off engine RNG and official generators", () => {
    const testDir = path.dirname(fileURLToPath(import.meta.url));
    const repoRoot = path.resolve(testDir, "..", "..");
    const roots = [
      path.join(repoRoot, "src", "domain"),
      path.join(repoRoot, "src", "recipes", "standard"),
    ] as const;

    const findings = roots
      .flatMap((root) => walkFiles(root))
      .flatMap((file) => scanFile(file, repoRoot));

    expect(findings.length, formatFindings(findings)).toBe(0);
  });
});
