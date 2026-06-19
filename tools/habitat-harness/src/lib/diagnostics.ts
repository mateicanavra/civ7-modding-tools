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
  let hasFailingRule = false;
  for (const rule of r.rules) {
    if (typeof rule.ruleId !== "string") errors.push("rule.ruleId must be string");
    if (!["pass", "fail", "advisory-findings"].includes(rule.status))
      errors.push(`rule ${rule.ruleId}: bad status ${rule.status}`);
    else if (rule.status === "fail") hasFailingRule = true;
    if (!["enforced", "advisory"].includes(rule.lane))
      errors.push(`rule ${rule.ruleId}: bad lane ${rule.lane}`);
    if (typeof rule.ownerTool !== "string")
      errors.push(`rule ${rule.ruleId}: ownerTool must be string`);
    if (typeof rule.locked !== "boolean")
      errors.push(`rule ${rule.ruleId}: locked must be boolean`);
    if (typeof rule.durationMs !== "number")
      errors.push(`rule ${rule.ruleId}: durationMs must be number`);
    if (!Array.isArray(rule.detect)) errors.push(`rule ${rule.ruleId}: detect must be an array`);
    if (!Array.isArray(rule.diagnostics))
      errors.push(`rule ${rule.ruleId}: diagnostics must be an array`);
    for (const d of rule.diagnostics ?? []) {
      if (typeof d.ruleId !== "string") errors.push("diagnostic.ruleId must be string");
      if (typeof d.path !== "string") errors.push("diagnostic.path must be string");
      if (typeof d.message !== "string") errors.push("diagnostic.message must be string");
      if (!["error", "advisory"].includes(d.severity))
        errors.push(`diagnostic severity invalid: ${d.severity}`);
      if (typeof d.baselined !== "boolean") errors.push("diagnostic.baselined must be boolean");
    }
  }
  if (r.ok && hasFailingRule) errors.push("ok must be false when any rule status is fail");
  if (!r.ok && !hasFailingRule) errors.push("ok must be true when no rule status is fail");
  return errors;
}
