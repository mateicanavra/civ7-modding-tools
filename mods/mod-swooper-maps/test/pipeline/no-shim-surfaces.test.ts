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

const bannedShimSurfacePatterns: RegExp[] = [
  /\bdualRead/i,
  /\bdual[-_ ]?engine/i,
  /\bdual[-_ ]?path/i,
  /\bshadow(?:Path|Compute|Layer|Mode|Toggle|Bridge)/i,
  /\bcompare(?:Layer|Layers|Mode|Toggle|Only|Path)/i,
  /\bcomparison(?:Layer|Layers|Mode|Toggle|Only|Path)/i,
  /\bshim(?:med|ming|s)?\b/i,
  /\bcompat(?:ibility)?[-_ ]?(shim|bridge)\b/i,
  /\btransitional[-_ ]?(shim|bridge)\b/i,
];

describe("pipeline no-shim-surface guardrails", () => {
  it("does not keep shim/shadow/dual/compare surfaces in runtime sources", () => {
    const repoRoot = path.resolve(import.meta.dir, "../..");
    const runtimeRoots = [
      path.join(repoRoot, "src/domain"),
      path.join(repoRoot, "src/recipes/standard"),
      path.join(repoRoot, "src/maps"),
    ];

    const sourceFiles = runtimeRoots.flatMap((root) =>
      listFilesRecursive(root).filter((file) => file.endsWith(".ts") || file.endsWith(".json"))
    );

    expect(sourceFiles.length).toBeGreaterThan(0);

    for (const file of sourceFiles) {
      const text = readFileSync(file, "utf8");
      for (const pattern of bannedShimSurfacePatterns) {
        expect(text).not.toMatch(pattern);
      }
    }
  });
});
