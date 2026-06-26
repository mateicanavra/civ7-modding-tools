import {
  activeRuleRegistryDocument,
  type RuleCommandExecutionFacts,
  type RuleRegistryRecordV1,
} from "../domains/rule-registry/index.js";
import type { HabitatDiagnostic } from "../domains/structural-check/schema.js";
import type { SpawnResult } from "../providers/command/index.js";

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
  return coarse(rule, res);
}
