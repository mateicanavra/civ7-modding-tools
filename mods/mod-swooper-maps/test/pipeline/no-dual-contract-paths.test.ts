import { describe, expect, it } from "bun:test";

import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

type DualPathViolation = {
  file: string;
  legacyToken: string;
  targetToken: string;
};

type LegacyTokenHit = {
  file: string;
  token: string;
};

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

const legacyStageTokens = [
  "\"hydrology-pre\"",
  "\"hydrology-core\"",
  "\"hydrology-post\"",
  "\"narrative-pre\"",
  "\"narrative-mid\"",
  "\"narrative-post\"",
] as const;

const dualStagePairs = [
  { legacy: "\"hydrology-pre\"", target: "\"hydrology-climate-baseline\"" },
  { legacy: "\"hydrology-core\"", target: "\"hydrology-hydrography\"" },
  { legacy: "\"hydrology-post\"", target: "\"hydrology-climate-refine\"" },
] as const;

describe("pipeline no-dual-contract-paths guardrails", () => {
  it("does not keep legacy + target stage semantics in parallel runtime paths", () => {
    const repoRoot = path.resolve(import.meta.dir, "../..");
    const runtimeRoots = [
      path.join(repoRoot, "src/recipes/standard"),
      path.join(repoRoot, "src/maps"),
      path.join(repoRoot, "src/domain"),
    ];

    const files = runtimeRoots.flatMap((root) =>
      listFilesRecursive(root).filter((file) => file.endsWith(".ts") || file.endsWith(".json"))
    );
    expect(files.length).toBeGreaterThan(0);

    const dualViolations: DualPathViolation[] = [];
    const legacyHits: LegacyTokenHit[] = [];

    for (const file of files) {
      const text = readFileSync(file, "utf8");

      for (const token of legacyStageTokens) {
        if (text.includes(token)) {
          legacyHits.push({ file, token });
        }
      }

      for (const pair of dualStagePairs) {
        if (text.includes(pair.legacy) && text.includes(pair.target)) {
          dualViolations.push({
            file,
            legacyToken: pair.legacy,
            targetToken: pair.target,
          });
        }
      }
    }

    expect(legacyHits).toEqual([]);
    expect(dualViolations).toEqual([]);
  });
});
