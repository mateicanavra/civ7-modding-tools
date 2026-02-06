import { describe, expect, it } from "bun:test";

import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

function listFilesRecursive(rootDir: string): string[] {
  const out: string[] = [];
  const entries = readdirSync(rootDir);
  for (const entry of entries) {
    const full = path.join(rootDir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      out.push(...listFilesRecursive(full));
      continue;
    }
    out.push(full);
  }
  return out;
}

const bannedShadowSurfacePatterns: RegExp[] = [
  /\bdualRead/i,
  /\bdual[-_ ]?engine/i,
  /\bdual[-_ ]?path/i,
  /\bshadow(?:Path|Compute|Layer|Mode|Toggle)/i,
  /\bcompare(?:Layer|Layers|Mode|Toggle|Only)/i,
  /\bcomparison(?:Layer|Layers|Mode|Toggle|Only)/i,
];

describe("pipeline no-shadow-path guardrails", () => {
  it("does not keep shadow/dual/compare surfaces in standard contracts", () => {
    const repoRoot = path.resolve(import.meta.dir, "../..");
    const standardRoot = path.join(repoRoot, "src/recipes/standard");
    const contractFiles = listFilesRecursive(standardRoot).filter(
      (file) => file.endsWith("contract.ts") || file.endsWith("artifacts.ts")
    );

    expect(contractFiles.length).toBeGreaterThan(0);

    for (const file of contractFiles) {
      const text = readFileSync(file, "utf8");
      for (const pattern of bannedShadowSurfacePatterns) {
        expect(text).not.toMatch(pattern);
      }
    }
  });

  it("does not reintroduce shadow/dual/compare toggles in standard pipeline sources", () => {
    const repoRoot = path.resolve(import.meta.dir, "../..");
    const standardRoot = path.join(repoRoot, "src/recipes/standard");
    const sourceFiles = listFilesRecursive(standardRoot).filter((file) => file.endsWith(".ts"));

    expect(sourceFiles.length).toBeGreaterThan(0);

    for (const file of sourceFiles) {
      const text = readFileSync(file, "utf8");
      for (const pattern of bannedShadowSurfacePatterns) {
        expect(text).not.toMatch(pattern);
      }
    }
  });
});
