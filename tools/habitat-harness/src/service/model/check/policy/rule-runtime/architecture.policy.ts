import type { SpawnResult } from "@internal/habitat-harness/resources/command/index";
import type { HabitatDiagnostic } from "@internal/habitat-harness/service/model/check/policy/structural/schema";
import {
  activeRuleRegistryDocument,
  type RuleCommandExecutionFacts,
  type RuleRegistryRecordV1,
} from "@internal/habitat-harness/service/model/rules/index";

/**
 * The rule pack is authored in .habitat and consumed through the registry
 * schema boundary. This module supplies per-rule output parsers.
 */

export type HarnessRule = RuleRegistryRecordV1;

export const rules: HarnessRule[] = activeRuleRegistryDocument.rules.map(toHarnessRule);

export function ruleById(id: string): HarnessRule | undefined {
  return rules.find((r) => r.id === id);
}

function toHarnessRule(rule: RuleRegistryRecordV1): HarnessRule {
  return { ...rule };
}

function coarse(rule: RuleCommandExecutionFacts, res: SpawnResult): HabitatDiagnostic[] {
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

export interface RuleRunResult {
  exitCode: number;
  diagnostics: HabitatDiagnostic[];
}

export function ruleDiagnosticsFromCommandResult(
  rule: RuleCommandExecutionFacts,
  res: SpawnResult
): HabitatDiagnostic[] {
  if (rule.id === "docs-local-checkout-paths") return docsLocalCheckoutPathDiagnostics(rule, res);
  return coarse(rule, res);
}

function docsLocalCheckoutPathDiagnostics(
  rule: RuleCommandExecutionFacts,
  res: SpawnResult
): HabitatDiagnostic[] {
  if (res.exitCode === 0) return [];
  const lines = (res.stdout + res.stderr)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const severity: HabitatDiagnostic["severity"] = rule.lane === "advisory" ? "advisory" : "error";
  const diagnostics = lines.flatMap((line) => {
    const match = /^(.*\.md):(\d+):\s*(.+)$/.exec(line);
    if (!match) return [];
    return [
      {
        ruleId: rule.id,
        path: match[1] ?? ".",
        line: Number.parseInt(match[2] ?? "1", 10),
        message: match[3] ?? rule.message,
        severity,
        baselined: false,
      },
    ];
  });
  return diagnostics.length > 0 ? diagnostics : coarse(rule, res);
}
