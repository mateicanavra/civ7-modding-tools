/**
 * Normalized diagnostic shape every habitat rule emits, regardless of the
 * underlying tool. The JSON contract (machine half of every failure):
 * { ruleId, path, line?, message, severity, baselined }.
 */
export type HabitatSeverity = "error" | "advisory";

export interface HabitatDiagnostic {
  ruleId: string;
  /** Repo-relative path the finding points at; "." for coarse whole-rule findings. */
  path: string;
  line?: number;
  message: string;
  severity: HabitatSeverity;
  /** True when the finding is covered by the rule's ratchet baseline (or legacy allowlist). */
  baselined: boolean;
}

export type RuleStatus = "pass" | "fail" | "advisory-findings";

export interface RuleReport {
  ruleId: string;
  ownerTool: string;
  lane: "enforced" | "advisory";
  status: RuleStatus;
  /** True when the rule's baseline is empty (violations hard-fail; "locked" messaging). */
  locked: boolean;
  durationMs: number;
  diagnostics: HabitatDiagnostic[];
  /** What was executed, for reproduction. */
  detect: string[];
  message: string;
  remediate: string | null;
}

export interface CheckReport {
  schemaVersion: 1;
  command: string;
  startedAt: string;
  ok: boolean;
  rules: RuleReport[];
}

/** Structural validation of the JSON contract (no deps; used by tests/probes). */
export function validateCheckReport(value: unknown): string[] {
  const errors: string[] = [];
  const r = value as CheckReport;
  if (!r || typeof r !== "object") return ["report is not an object"];
  if (r.schemaVersion !== 1) errors.push("schemaVersion must be 1");
  if (typeof r.ok !== "boolean") errors.push("ok must be boolean");
  if (!Array.isArray(r.rules)) return [...errors, "rules must be an array"];
  for (const rule of r.rules) {
    if (typeof rule.ruleId !== "string") errors.push("rule.ruleId must be string");
    if (!["pass", "fail", "advisory-findings"].includes(rule.status))
      errors.push(`rule ${rule.ruleId}: bad status ${rule.status}`);
    for (const d of rule.diagnostics ?? []) {
      if (typeof d.ruleId !== "string") errors.push("diagnostic.ruleId must be string");
      if (typeof d.path !== "string") errors.push("diagnostic.path must be string");
      if (typeof d.message !== "string") errors.push("diagnostic.message must be string");
      if (!["error", "advisory"].includes(d.severity))
        errors.push(`diagnostic severity invalid: ${d.severity}`);
      if (typeof d.baselined !== "boolean") errors.push("diagnostic.baselined must be boolean");
    }
  }
  return errors;
}
