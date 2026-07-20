import type { SpawnResult } from "@habitat/cli/resources/command/index";
import type {
  RuleFixPlanningResult,
  RuleFixPlanningRuleResult,
} from "@habitat/cli/resources/rule-fix-planning/index";
import { Match } from "effect";
import { module } from "./module.js";

export const fixRouter = {
  planPatterns: module.planPatterns.effect(function* ({ context, input }) {
    const demand = Match.value(input.rules).pipe(
      Match.when(undefined, () => ({})),
      Match.orElse(([firstRuleId, ...remainingRuleIds]) => ({
        ruleIds: [firstRuleId, ...remainingRuleIds] as const,
      }))
    );
    const result = yield* context.planRuleFixes(demand);
    return renderFixPlanning(result);
  }),
};

export const router = fixRouter;

function renderFixPlanning(result: RuleFixPlanningResult): SpawnResult {
  return Match.value(result).pipe(
    Match.when({ kind: "selection-refused" }, ({ unknownRuleIds, unadmittedRuleIds }) => ({
      exitCode: 1,
      stdout: "",
      stderr: [
        "habitat fix refused: invalid-rule-selection",
        ...renderSelectionLine("unknown rule ids", unknownRuleIds),
        ...renderSelectionLine("rules without fix admission", unadmittedRuleIds),
        "",
      ].join("\n"),
    })),
    Match.when({ kind: "completed" }, ({ results }) => renderCompleted(results)),
    Match.exhaustive
  );
}

function renderCompleted(results: readonly RuleFixPlanningRuleResult[]): SpawnResult {
  return Match.value(results.length).pipe(
    Match.when(0, () => ({
      exitCode: 0,
      stdout: "No registered rules admit fix planning.\n",
      stderr: "",
    })),
    Match.orElse(() => renderNonemptyResults(results))
  );
}

function renderNonemptyResults(results: readonly RuleFixPlanningRuleResult[]): SpawnResult {
  const rendered = results.map(renderRuleResult);
  const exitCode = Match.value(rendered.some((result) => result.exitCode !== 0)).pipe(
    Match.when(true, () => 1),
    Match.orElse(() => 0)
  );
  return {
    exitCode,
    stdout: rendered.map(({ stdout }) => stdout).join(""),
    stderr: rendered.map(({ stderr }) => stderr).join(""),
  };
}

function renderSelectionLine(label: string, ruleIds: readonly string[]): string[] {
  return Match.value(ruleIds.length).pipe(
    Match.when(0, () => []),
    Match.orElse(() => [`${label}: ${ruleIds.join(", ")}`])
  );
}

function renderRuleResult(result: RuleFixPlanningRuleResult): SpawnResult {
  return Match.value(result).pipe(
    Match.when({ kind: "observed" }, ({ ruleId, affectedPaths }) => ({
      exitCode: 0,
      stdout: renderAffectedPaths(ruleId, affectedPaths),
      stderr: "",
    })),
    Match.when({ kind: "not-applicable" }, ({ ruleId, reason }) => ({
      exitCode: 0,
      stdout: `[${ruleId}] not applicable: ${reason}\n`,
      stderr: "",
    })),
    Match.when({ kind: "provider-failed" }, ({ ruleId, failure, detail }) => ({
      exitCode: 1,
      stdout: "",
      stderr: `[${ruleId}] provider failed: ${failure}\n${detail}\n`,
    })),
    Match.when({ kind: "scope-refused" }, ({ ruleId, detail }) => ({
      exitCode: 1,
      stdout: "",
      stderr: `[${ruleId}] scope refused\n${detail}\n`,
    })),
    Match.exhaustive
  );
}

function renderAffectedPaths(ruleId: string, affectedPaths: readonly string[]): string {
  return Match.value(affectedPaths.length).pipe(
    Match.when(0, () => `[${ruleId}] no affected paths\n`),
    Match.orElse(() =>
      [`[${ruleId}] affected paths`, ...affectedPaths.map((path) => `- ${path}`), ""].join("\n")
    )
  );
}
