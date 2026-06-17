import { describe, expect, it } from "bun:test";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as ts from "typescript";

type Finding = Readonly<{
  file: string;
  line: number;
  source: string;
  kind: "import" | "export";
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

function isForbiddenEcologyStepSource(source: string): boolean {
  return /^@mapgen\/domain\/ecology\/(?:ops|rules)(?:$|\/)/u.test(source);
}

function lineOf(sourceFile: ts.SourceFile, node: ts.Node): number {
  return sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1;
}

function scanSource(text: string, fileName: string, displayFile = fileName): Finding[] {
  const sourceFile = ts.createSourceFile(fileName, text, ts.ScriptTarget.Latest, true);
  const findings: Finding[] = [];

  for (const statement of sourceFile.statements) {
    if (
      ts.isImportDeclaration(statement) &&
      ts.isStringLiteral(statement.moduleSpecifier) &&
      isForbiddenEcologyStepSource(statement.moduleSpecifier.text)
    ) {
      findings.push({
        file: displayFile,
        line: lineOf(sourceFile, statement),
        source: statement.moduleSpecifier.text,
        kind: "import",
      });
    }

    if (
      ts.isExportDeclaration(statement) &&
      statement.moduleSpecifier &&
      ts.isStringLiteral(statement.moduleSpecifier) &&
      isForbiddenEcologyStepSource(statement.moduleSpecifier.text)
    ) {
      findings.push({
        file: displayFile,
        line: lineOf(sourceFile, statement),
        source: statement.moduleSpecifier.text,
        kind: "export",
      });
    }
  }

  return findings;
}

function scanFile(absFile: string, repoRoot: string): Finding[] {
  return scanSource(readFileSync(absFile, "utf8"), absFile, path.relative(repoRoot, absFile));
}

function formatFindings(findings: readonly Finding[]): string {
  return findings
    .map((finding) => `${finding.file}:${finding.line} [${finding.kind}] ${finding.source}`)
    .join("\n");
}

describe("ecology retired-stage topology guardrails", () => {
  it("keeps retired wrapper and generic ecology step directories out of the active recipe topology", () => {
    const modRoot = fileURLToPath(new URL("../..", import.meta.url));
    const retiredStageDirs = [
      "src/recipes/standard/stages/ecology/steps",
      "src/recipes/standard/stages/ecology-features-score",
      "src/recipes/standard/stages/ecology-ice",
      "src/recipes/standard/stages/ecology-reefs",
      "src/recipes/standard/stages/ecology-wetlands",
      "src/recipes/standard/stages/ecology-vegetation",
    ];

    const present = retiredStageDirs.filter((dir) => existsSync(path.join(modRoot, dir)));
    expect(present, `Retired ecology topology dirs still exist: ${present.join(", ")}`).toEqual([]);
  });

  it("keeps active ecology steps from importing ecology ops or rules internals", () => {
    const modRoot = fileURLToPath(new URL("../..", import.meta.url));
    const roots = [
      path.join(modRoot, "src", "recipes", "standard", "stages", "ecology-biomes"),
      path.join(modRoot, "src", "recipes", "standard", "stages", "ecology-features"),
      path.join(modRoot, "src", "recipes", "standard", "stages", "ecology-pedology"),
      path.join(modRoot, "src", "recipes", "standard", "stages", "map-ecology"),
    ] as const;

    const findings = roots
      .flatMap((root) => walkFiles(root))
      .flatMap((file) => scanFile(file, modRoot));

    expect(findings.length, formatFindings(findings)).toBe(0);
  });

  it("classifies ecology ops/rules static import forms without matching public roots or dynamic strings", () => {
    const sample = [
      'import ecology from "@mapgen/domain/ecology";',
      'import { FEATURE_KEY_INDEX } from "@mapgen/domain/ecology";',
      'import type { Contract } from "@mapgen/domain/ecology/ops";',
      'import * as rules from "@mapgen/domain/ecology/rules/private.js";',
      'import "@mapgen/domain/ecology/ops/private.js";',
      'export { privateRule } from "@mapgen/domain/ecology/rules/private.js";',
      'export * from "@mapgen/domain/ecology/ops/private.js";',
      'const source = "@mapgen/domain/ecology/ops/private.js";',
      'void import("@mapgen/domain/ecology/ops/private.js");',
    ].join("\n");

    expect(scanSource(sample, "fixture.ts").map((finding) => finding.source)).toEqual([
      "@mapgen/domain/ecology/ops",
      "@mapgen/domain/ecology/rules/private.js",
      "@mapgen/domain/ecology/ops/private.js",
      "@mapgen/domain/ecology/rules/private.js",
      "@mapgen/domain/ecology/ops/private.js",
    ]);
  });
});
