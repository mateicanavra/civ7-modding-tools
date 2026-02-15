import { describe, expect, it } from "bun:test";

import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

type OpCallViolation = {
  file: string;
  line: number;
  rule: string;
  excerpt: string;
};

function countLines(input: string, end: number): number {
  return input.slice(0, end).split("\n").length;
}

describe("foundation no-op-calls-op guardrails", () => {
  it("forbids op-level orchestration surfaces in foundation op runtimes", () => {
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

    const bannedImportPatterns: Array<{ rule: string; pattern: RegExp }> = [
      {
        rule: "sibling op runtime import",
        pattern: /from\s+["'](\.\.\/[^"']+\/index\.js)["']/g,
      },
      {
        rule: "domain ops barrel import",
        pattern: /from\s+["'](@mapgen\/domain\/[^"']+\/ops(?:\/index\.js)?)["']/g,
      },
    ];
    const bannedLocalPatterns: Array<{ rule: string; pattern: RegExp }> = [
      {
        rule: "ops.bind orchestration",
        pattern: /\bops\.bind\(/g,
      },
      {
        rule: "runValidated orchestration",
        pattern: /\brunValidated\(/g,
      },
    ];
    const violations: OpCallViolation[] = [];

    for (const file of opIndexFiles) {
      const text = readFileSync(file, "utf8");

      for (const banned of bannedImportPatterns) {
        banned.pattern.lastIndex = 0;
        for (const match of text.matchAll(banned.pattern)) {
          const index = match.index ?? 0;
          violations.push({
            file,
            line: countLines(text, index),
            rule: banned.rule,
            excerpt: (match[1] ?? match[0] ?? "").toString(),
          });
        }
      }

      for (const banned of bannedLocalPatterns) {
        banned.pattern.lastIndex = 0;
        for (const match of text.matchAll(banned.pattern)) {
          const index = match.index ?? 0;
          violations.push({
            file,
            line: countLines(text, index),
            rule: banned.rule,
            excerpt: (match[0] ?? "").toString(),
          });
        }
      }
    }

    expect(violations).toEqual([]);
  });
});
