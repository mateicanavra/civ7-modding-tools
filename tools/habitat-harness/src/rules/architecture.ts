import { Effect } from "effect";
import { type HabitatError, renderHabitatError } from "../errors/index.js";
import type { HabitatDiagnostic } from "../lib/diagnostics.js";
import { runHabitatEffect } from "../lib/effect-runtime.js";
import { repoRoot } from "../lib/paths.js";
import type { SpawnResult } from "../lib/spawn.js";
import { CommandRunner } from "../providers/command/index.js";
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
  try {
    const res = await runHabitatEffect(
      CommandRunner.pipe(
        Effect.flatMap((runner) =>
          runner.run({
            commandId: rule.id,
            kind: "workspace-tool",
            executable: rule.detect[0] ?? "",
            argv: rule.detect.slice(1),
            cwd: repoRoot,
            captureGitState: false,
          })
        )
      )
    );
    const diagnostics = ruleDiagnosticsFromCommandResult(rule, {
      exitCode: res.exit.code,
      stdout: res.stdout.text,
      stderr: res.stderr.text,
    });
    return { exitCode: res.exit.code, diagnostics };
  } catch (error) {
    const diagnostic: HabitatDiagnostic = {
      ruleId: rule.id,
      path: ".",
      message: `${rule.message}\n--- command provider failure ---\n${renderRuleExecutionError(error)}`,
      severity: rule.lane === "advisory" ? "advisory" : "error",
      baselined: false,
    };
    return { exitCode: 1, diagnostics: [diagnostic] };
  }
}

function renderRuleExecutionError(error: unknown): string {
  return isHabitatError(error)
    ? renderHabitatError(error)
    : error instanceof Error
      ? error.message
      : String(error);
}

function isHabitatError(error: unknown): error is HabitatError {
  return Boolean(error && typeof error === "object" && "_tag" in error);
}
