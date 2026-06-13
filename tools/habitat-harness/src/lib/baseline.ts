import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { run } from "./spawn.js";
import { baselinesDir, repoRoot } from "./paths.js";
import type { HabitatDiagnostic } from "./diagnostics.js";

/**
 * Ratchet baselines (FRAME hard core #3).
 *
 * One file per rule: tools/habitat-harness/baselines/<rule-id>.json — a sorted
 * JSON array of stable violation keys. Missing file == empty baseline == the
 * rule is LOCKED (any violation hard-fails).
 *
 * Shrink-only: `habitat check` never writes baselines unless invoked with the
 * explicit `--expand-baseline` gate (local authoring for rule-introduction
 * slices). CI enforcement does not trust that flag: the self-check rejects any
 * entry added relative to the merge-base unless the entry's ruleId is itself
 * NEW at the merge-base (cross-referenced against the rule pack diff).
 */

export function baselinePath(ruleId: string): string {
  return path.join(baselinesDir, `${ruleId}.json`);
}

export function loadBaseline(ruleId: string): Set<string> {
  const p = baselinePath(ruleId);
  if (!existsSync(p)) return new Set();
  const parsed = JSON.parse(readFileSync(p, "utf8"));
  if (!Array.isArray(parsed)) throw new Error(`baseline ${p} is not a JSON array`);
  return new Set(parsed as string[]);
}

/** Stable key for a violation. Coarse wrapped rules key on path+message. */
export function violationKey(d: HabitatDiagnostic): string {
  return `${d.path}::${d.message}`;
}

export function applyBaseline(diags: HabitatDiagnostic[], baseline: Set<string>): void {
  for (const d of diags) {
    if (baseline.has(violationKey(d))) d.baselined = true;
  }
}

export function writeBaseline(ruleId: string, keys: string[]): void {
  mkdirSync(baselinesDir, { recursive: true });
  writeFileSync(baselinePath(ruleId), `${JSON.stringify([...keys].sort(), null, 2)}\n`);
}

export interface BaselineIntegrityFinding {
  file: string;
  ruleId: string;
  addedKeys: string[];
  reason: string;
}

function gitShow(ref: string, repoRelPath: string): string | null {
  const res = run(["git", "show", `${ref}:${repoRelPath}`], { cwd: repoRoot });
  return res.exitCode === 0 ? res.stdout : null;
}

export function mergeBase(base = "main"): string | null {
  for (const ref of [`origin/${base}`, base]) {
    const res = run(["git", "merge-base", "HEAD", ref], { cwd: repoRoot });
    if (res.exitCode === 0) return res.stdout.trim();
  }
  return null;
}

/**
 * The CI-visible expansion gate: compare every baseline file against the
 * merge-base. Added entries are rejected unless the ruleId does not exist in
 * the merge-base rule pack (i.e. this change introduces the rule).
 */
export function checkBaselineIntegrity(base = "main"): BaselineIntegrityFinding[] {
  const findings: BaselineIntegrityFinding[] = [];
  const mb = mergeBase(base);
  if (!mb) return findings; // no merge-base (fresh clone edge) — nothing to compare
  const rulePackAtBase =
    gitShow(mb, "tools/habitat-harness/src/rules/rules.json") ?? "";
  if (!existsSync(baselinesDir)) return findings;
  for (const file of readdirSync(baselinesDir)) {
    if (!file.endsWith(".json")) continue;
    const ruleId = file.replace(/\.json$/, "");
    const now = new Set<string>(JSON.parse(readFileSync(path.join(baselinesDir, file), "utf8")));
    const beforeRaw = gitShow(mb, `tools/habitat-harness/baselines/${file}`);
    const before = new Set<string>(beforeRaw ? (JSON.parse(beforeRaw) as string[]) : []);
    const added = [...now].filter((k) => !before.has(k));
    if (added.length === 0) continue;
    const ruleIsNew = !rulePackAtBase.includes(`"id": "${ruleId}"`);
    if (!ruleIsNew) {
      findings.push({
        file: `tools/habitat-harness/baselines/${file}`,
        ruleId,
        addedKeys: added,
        reason:
          `baseline for existing rule '${ruleId}' grew by ${added.length} entr${added.length === 1 ? "y" : "ies"} ` +
          `relative to merge-base ${mb.slice(0, 9)} — baselines are shrink-only outside rule-introduction changes`,
      });
    }
  }
  return findings;
}
