import type { HabitatDiagnostic } from "../lib/diagnostics.js";
import { repoRoot } from "../lib/paths.js";
import { run, type SpawnResult } from "../lib/spawn.js";
import {
  activeRuleRegistryDocument,
  type RuleCommandExecutionFacts,
  type RuleRegistryRecordV1,
} from "./registry/index.js";

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

/** Execute a rule's detect command and parse its output into diagnostics. */
export async function executeRule(rule: RuleCommandExecutionFacts): Promise<RuleRunResult> {
  const res = run(rule.detect, { cwd: repoRoot });
  const diagnostics = ruleDiagnosticsFromCommandResult(rule, res);
  return { exitCode: res.exitCode, diagnostics };
}
