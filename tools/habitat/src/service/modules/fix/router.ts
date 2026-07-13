import type { SpawnResult } from "@habitat/cli/resources/command/index";
import type {
  RuleFixPreviewResult,
  RuleFixPreviewRuleResult,
} from "@habitat/cli/resources/rule-fix-preview/index";
import { Match } from "effect";
import { module } from "./module.js";

export const fixRouter = {
  previewPatterns: module.previewPatterns.effect(function* ({ context, input }) {
    const demand = Match.value(input.rules).pipe(
      Match.when(undefined, () => ({})),
      Match.orElse(([firstRuleId, ...remainingRuleIds]) => ({
        ruleIds: [firstRuleId, ...remainingRuleIds] as const,
      }))
    );
    const result = yield* context.previewRuleFixes(demand);
    return renderFixPreview(result);
  }),
};

export const router = fixRouter;

function renderFixPreview(result: RuleFixPreviewResult): SpawnResult {
  return Match.value(result).pipe(
    Match.when({ kind: "selection-refused" }, ({ refusals }) => renderSelectionRefusal(refusals)),
    Match.when({ kind: "completed" }, ({ results }) => renderCompleted(results)),
    Match.exhaustive
  );
}

function renderCompleted(results: readonly RuleFixPreviewRuleResult[]): SpawnResult {
  return Match.value(results.length).pipe(
    Match.when(0, () => ({
      exitCode: 0,
      stdout: "No registered rules admit fix preview.\n",
      stderr: "",
    })),
    Match.orElse(() => renderNonemptyResults(results))
  );
}

function renderNonemptyResults(results: readonly RuleFixPreviewRuleResult[]): SpawnResult {
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

function renderSelectionRefusal(
  refusals: Extract<RuleFixPreviewResult, { kind: "selection-refused" }>["refusals"]
): SpawnResult {
  const unknownRuleIds = refusals
    .filter(({ reason }) => reason === "unknown")
    .map(({ ruleId }) => ruleId);
  const unadmittedRuleIds = refusals
    .filter(({ reason }) => reason === "fix-not-admitted")
    .map(({ ruleId }) => ruleId);
  return {
    exitCode: 1,
    stdout: "",
    stderr: [
      "habitat fix refused: invalid-rule-selection",
      ...renderSelectionLine("unknown rule ids", unknownRuleIds),
      ...renderSelectionLine("rules without fix admission", unadmittedRuleIds),
      "",
    ].join("\n"),
  };
}

function renderSelectionLine(label: string, ruleIds: readonly string[]): string[] {
  return Match.value(ruleIds.length).pipe(
    Match.when(0, () => []),
    Match.orElse(() => [`${label}: ${ruleIds.join(", ")}`])
  );
}

function renderRuleResult(result: RuleFixPreviewRuleResult): SpawnResult {
  return Match.value(result).pipe(
    Match.when({ kind: "previewed" }, ({ ruleId, impacts }) => ({
      exitCode: 0,
      stdout: renderImpacts(ruleId, impacts),
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
    Match.when({ kind: "authority-refused" }, ({ ruleId, undeclaredEffects }) => ({
      exitCode: 1,
      stdout: "",
      stderr: `[${ruleId}] authority refused: undeclared effects ${undeclaredEffects.join(", ")}\n`,
    })),
    Match.exhaustive
  );
}

function renderImpacts(
  ruleId: string,
  impacts: Extract<RuleFixPreviewRuleResult, { kind: "previewed" }>["impacts"]
): string {
  if (impacts.length === 0) return `[${ruleId}] no file impacts\n`;
  return [`[${ruleId}] file impacts`, ...impacts.map(renderImpact), ""].join("\n");
}

function renderImpact(
  impact: Extract<RuleFixPreviewRuleResult, { kind: "previewed" }>["impacts"][number]
): string {
  return Match.value(impact).pipe(
    Match.when({ kind: "rename" }, ({ from, to }) => `- rename ${from} -> ${to}`),
    Match.orElse(({ kind, path }) => `- ${kind} ${path}`)
  );
}
