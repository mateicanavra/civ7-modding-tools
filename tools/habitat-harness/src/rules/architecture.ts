import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { HabitatDiagnostic } from "../lib/diagnostics.js";
import { type FileLayerContext, runGeneratedZoneRule } from "../lib/generated-zones.js";
import { runGritRule } from "../lib/grit.js";
import { repoRoot } from "../lib/paths.js";
import { run, type SpawnResult } from "../lib/spawn.js";

/**
 * The rule pack. Data lives in rules.json (shared with the Nx plugin); this
 * module types it and supplies per-rule output parsers. H2 wrapped existing
 * mechanisms unchanged; later slices add owning-tool gates such as H3
 * nx-boundaries and H4 Biome hygiene.
 */

export interface HarnessRule {
  id: string;
  ownerTool: string;
  ownerProject: string;
  lane: "enforced" | "advisory";
  scope: string;
  forbids: string;
  why: string;
  detect: string[];
  remediate: string | null;
  message: string;
  exceptionPath: string;
  gritPattern?: string;
  generatedZone?: string;
  forbiddenFileNames?: string[];
  hookScope?: "pre-commit";
}

const rulesJsonPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "rules.json");

export const rules: HarnessRule[] = (
  JSON.parse(readFileSync(rulesJsonPath, "utf8")) as { rules: HarnessRule[] }
).rules;

export function ruleById(id: string): HarnessRule | undefined {
  return rules.find((r) => r.id === id);
}

function coarse(rule: HarnessRule, res: SpawnResult): HabitatDiagnostic[] {
  if (res.exitCode === 0) return [];
  const tail = (res.stdout + res.stderr).trim().split("\n").slice(-12).join("\n");
  return [
    {
      ruleId: rule.id,
      path: ".",
      message: `${rule.message}\n--- tool output (tail) ---\n${tail}`,
      severity: rule.lane === "advisory" ? "advisory" : "error",
      baselined: false,
    },
  ];
}

/** adapter-boundary: surface allowlisted files as baselined diagnostics; unapproved as errors. */
function parseAdapterBoundary(rule: HarnessRule, res: SpawnResult): HabitatDiagnostic[] {
  const out = res.stdout + res.stderr;
  const diags: HabitatDiagnostic[] = [];
  const section = (header: string): string[] => {
    const idx = out.indexOf(header);
    if (idx === -1) return [];
    const files: string[] = [];
    for (const line of out.slice(idx + header.length).split("\n")) {
      const m = line.match(/^\s+-\s+(\S+)$/);
      if (m) files.push(m[1]);
      else if (line.trim() === "" && files.length > 0) break;
    }
    return files;
  };
  for (const f of section("Allowlisted violations (tracked for future cleanup):")) {
    diags.push({
      ruleId: rule.id,
      path: f,
      message:
        "/base-standard/ reference allowlisted in scripts/lint/lint-adapter-boundary.sh (tracked debt)",
      severity: "error",
      baselined: true, // legacy allowlist is this rule's transitional baseline (design.md)
    });
  }
  for (const f of section("ERROR: Unapproved adapter boundary violations:")) {
    diags.push({
      ruleId: rule.id,
      path: f,
      message: rule.message,
      severity: "error",
      baselined: false,
    });
  }
  // Script failed but we parsed nothing → fall back to coarse so failures never vanish.
  if (res.exitCode !== 0 && !diags.some((d) => !d.baselined))
    return [...diags, ...coarse(rule, res)];
  return diags;
}

export interface RuleRunResult {
  exitCode: number;
  diagnostics: HabitatDiagnostic[];
}

/** Execute a rule's detect command and parse its output into diagnostics. */
export function executeRule(rule: HarnessRule, context: FileLayerContext = {}): RuleRunResult {
  if (rule.ownerTool === "grit-check") return runGritRule(rule);
  if (rule.ownerTool === "file-layer") return runGeneratedZoneRule(rule, context);
  const res = run(rule.detect, { cwd: repoRoot });
  const diagnostics =
    rule.id === "adapter-boundary" ? parseAdapterBoundary(rule, res) : coarse(rule, res);
  return { exitCode: res.exitCode, diagnostics };
}
