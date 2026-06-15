import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";

const repoRoot = path.resolve(import.meta.dirname, "../../../..");
const patternRoot = path.join(repoRoot, ".grit", "patterns", "habitat");
const checkRoot = path.join(patternRoot, "checks");
const applyRoot = path.join(patternRoot, "apply");

interface GritPatternSample {
  state?: string;
}

interface GritPatternTestReport {
  outcome?: string;
  samples?: GritPatternSample[];
}

const checkPatternNames = readdirSync(checkRoot)
  .map((file) => file.match(/^([a-z0-9_]+)\.md$/)?.[1])
  .filter((name): name is string => Boolean(name));

const applyPatternNames = readdirSync(applyRoot)
  .map((file) => file.match(/^([a-z0-9_]+)\.md$/)?.[1])
  .filter((name): name is string => Boolean(name));

describe("Habitat GritQL pattern catalog", () => {
  test("native Grit samples pass", () => {
    const result = spawnSync("grit", ["patterns", "test", "--json"], {
      cwd: repoRoot,
      env: {
        ...process.env,
        GRIT_TELEMETRY_DISABLED: "true",
        PATH: [path.join(repoRoot, "node_modules", ".bin"), process.env.PATH]
          .filter(Boolean)
          .join(path.delimiter),
      },
      encoding: "utf8",
      maxBuffer: 32 * 1024 * 1024,
    });
    expect(result.status ?? 0).toBe(0);
    const report = parsePatternTestReport(result.stdout) ?? parsePatternTestReport(result.stderr);
    if (!report) {
      throw new Error(
        `Could not parse Grit pattern-test JSON:\n${result.stdout}\n${result.stderr}`
      );
    }

    expect(report.length).toBe(checkPatternNames.length + applyPatternNames.length);
    const samples = report.flatMap((patternReport) => patternReport.samples ?? []);
    expect(samples.length).toBeGreaterThanOrEqual(checkPatternNames.length * 2);
    expect(report.every((patternReport) => patternReport.outcome === "success")).toBe(true);
    expect(samples.every((sample) => sample.state === "pass")).toBe(true);
  }, 30_000);
});

function parsePatternTestReport(output: string): GritPatternTestReport[] | undefined {
  const trimmed = output.trim();
  if (!trimmed) return undefined;
  for (const candidate of [
    trimmed,
    trimmed.slice(trimmed.indexOf("["), trimmed.lastIndexOf("]") + 1),
  ]) {
    if (!candidate.startsWith("[") || !candidate.endsWith("]")) continue;
    try {
      return JSON.parse(candidate) as GritPatternTestReport[];
    } catch {
      // try the next candidate
    }
  }
  return undefined;
}
