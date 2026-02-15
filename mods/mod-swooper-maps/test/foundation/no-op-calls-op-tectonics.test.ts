import { describe, expect, it } from "bun:test";

import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

type OpCallViolation = {
  file: string;
  line: number;
  importPath: string;
};

function countLines(input: string, end: number): number {
  return input.slice(0, end).split("\n").length;
}

describe("foundation no-op-calls-op guardrails", () => {
  it("forbids foundation op runtime imports from sibling op implementations", () => {
    const repoRoot = path.resolve(import.meta.dir, "../..");
    const opsRoot = path.join(repoRoot, "src/domain/foundation/ops");
    const opDirs = readdirSync(opsRoot).filter((entry) => {
      const full = path.join(opsRoot, entry);
      return statSync(full).isDirectory();
    });
    const opIndexFiles = opDirs
      .map((entry) => path.join(opsRoot, entry, "index.ts"))
      .filter((file) => {
        try {
          return statSync(file).isFile();
        } catch {
          return false;
        }
      });

    expect(opIndexFiles.length).toBeGreaterThan(0);

    const opImportPattern = /from\s+["'](\.\.\/[^"']+\/index\.js)["']/g;
    const violations: OpCallViolation[] = [];

    for (const file of opIndexFiles) {
      const text = readFileSync(file, "utf8");
      opImportPattern.lastIndex = 0;
      for (const match of text.matchAll(opImportPattern)) {
        const importPath = match[1] ?? "";
        if (!importPath.startsWith("../")) {
          continue;
        }
        const index = match.index ?? 0;
        violations.push({
          file,
          line: countLines(text, index),
          importPath,
        });
      }
    }

    expect(violations).toEqual([]);
  });
});
