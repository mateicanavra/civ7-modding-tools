import { describe, expect, it } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

type Finding = Readonly<{
  file: string;
  line: number;
  kind: "ops-impl-import" | "rules-import";
  text: string;
}>;

function walkTsFiles(rootDir: string): string[] {
  const out: string[] = [];
  const entries = readdirSync(rootDir, { withFileTypes: true });
  for (const entry of entries) {
    const abs = join(rootDir, entry.name);
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

function scanStepDir(dir: string): Finding[] {
  const findings: Finding[] = [];

  for (const file of walkTsFiles(dir)) {
    const text = readFileSync(file, "utf8");
    const lines = text.split(/\r?\n/u);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i] ?? "";
      const m = /^\s*import\s+(?:[^'"]+\s+from\s+)?["']([^"']+)["']\s*;?\s*$/u.exec(line);
      if (!m) continue;
      const spec = m[1] ?? "";

      if (spec === "@mapgen/domain/ecology/ops") {
        findings.push({ file, line: i + 1, kind: "ops-impl-import", text: line.trim() });
      }
      if (spec.includes("rules/")) {
        findings.push({ file, line: i + 1, kind: "rules-import", text: line.trim() });
      }
    }
  }

  return findings;
}

describe("M2 guardrails: steps must not deep-import ops implementations or rules", () => {
  it("enforces Gate G1/G2 for ecology and map-ecology step runtime code", () => {
    const ecologyStepsDir = fileURLToPath(
      new URL("../../src/recipes/standard/stages/ecology/steps", import.meta.url)
    );
    const mapEcologyStepsDir = fileURLToPath(
      new URL("../../src/recipes/standard/stages/map-ecology/steps", import.meta.url)
    );

    const findings = [...scanStepDir(ecologyStepsDir), ...scanStepDir(mapEcologyStepsDir)];

    const message =
      findings.length === 0
        ? ""
        : [
            "Forbidden imports detected in step code:",
            ...findings.map((f) => `- ${f.kind} ${f.file}:${f.line}: ${f.text}`),
          ].join("\n");

    expect(findings.length, message).toBe(0);
  });

  it("ensures features-plan does not define manual normalize (compiler-owned binding/normalization)", () => {
    const featuresPlanPath = fileURLToPath(
      new URL("../../src/recipes/standard/stages/ecology/steps/features-plan/index.ts", import.meta.url)
    );
    const text = readFileSync(featuresPlanPath, "utf8");
    expect(text.includes("normalize:"), 'features-plan should not define a "normalize" function').toBe(false);
  });
});

