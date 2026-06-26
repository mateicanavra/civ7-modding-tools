import type { CheckReport, RuleReport } from "../domains/structural-check/schema.js";

/** Human rendering of rule results (the agent-readable half of every failure). */

const ICONS = { pass: "✓", fail: "✗", "advisory-findings": "▲" } as const;

export function renderRule(r: RuleReport): string {
  const lines: string[] = [];
  const lock = r.locked && r.lane === "enforced" ? " [locked]" : "";
  lines.push(
    `${ICONS[r.status]} ${r.ruleId} (${r.ownerTool}, ${r.lane})${lock} — ${r.durationMs}ms`
  );
  for (const d of r.diagnostics) {
    const mark = d.baselined ? "  [baselined] " : "  ";
    const loc = d.line ? `${d.path}:${d.line}` : d.path;
    lines.push(`${mark}${loc}: ${d.message.split("\n")[0]}`);
  }
  if (r.status === "fail") {
    lines.push(`  why: ${r.message}`);
    if (r.remediate) lines.push(`  remediate: ${r.remediate}`);
    if (r.locked) lines.push(`  this rule is locked (empty baseline): any violation fails.`);
    else lines.push(`  baselined violations are tracked debt; NEW violations fail the check.`);
  }
  return lines.join("\n");
}

export function renderReport(report: CheckReport): string {
  const lines = report.rules.map(renderRule);
  const failed = report.rules.filter((r) => r.status === "fail");
  const advisories = report.rules.filter((r) => r.status === "advisory-findings");
  lines.push("");
  lines.push(
    `habitat check: ${report.ok ? "PASS" : "FAIL"} — ${report.rules.length} rules, ` +
      `${failed.length} failing, ${advisories.length} with advisory findings`
  );
  if (!report.ok) {
    lines.push(`failing: ${failed.map((r) => r.ruleId).join(", ")}`);
  }
  return lines.join("\n");
}
