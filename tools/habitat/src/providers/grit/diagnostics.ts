import path from "node:path";
import {
  type DiagnosticFinding,
  type DiagnosticRunOutcome,
  diagnosticCatalogEntryFromRuleSourceFacts,
  observedGritDiagnosticIdentity,
  observedGritIdentityMatches,
  renderUnexpectedObservedGritIdentity,
} from "@habitat/cli/service/model/diagnostics/index";
import type { RuleRunResult } from "@habitat/cli/service/model/diagnostics/policy/rule-runtime/architecture.policy";
import type { RuleSourceFacts } from "@habitat/cli/service/model/rules/index";
import { infrastructureFailure } from "./failure.js";
import { normalizeGritPath } from "./scan-roots/index.js";
import type { GritDiagnosticOptions, GritReport, GritResult } from "./types.js";

export function gritDiagnosticOutcomesFromReport(
  selectedRules: readonly RuleSourceFacts[],
  report: GritReport,
  options: GritDiagnosticOptions = {}
): Map<string, DiagnosticRunOutcome> {
  const expectedPatterns = new Set(selectedRules.map((rule) => rule.patternName));
  for (const result of report.results) {
    const observed = observedGritDiagnosticIdentity(result);
    if (
      observed.kind === "observed-identity-mismatch" ||
      !expectedPatterns.has(observed.observedPatternIdentity)
    ) {
      return new Map(
        selectedRules.map((rule) => [
          rule.id,
          {
            kind: "unexpected-diagnostic-identity" as const,
            entry: diagnosticCatalogEntryFromRuleSourceFacts(rule),
            unexpectedIdentity: observed,
          },
        ])
      );
    }
  }

  return new Map(
    selectedRules.map((rule) => {
      const entry = diagnosticCatalogEntryFromRuleSourceFacts(rule);
      const diagnostics = report.results
        .filter((result) =>
          observedGritIdentityMatches(
            observedGritDiagnosticIdentity(result),
            entry.diagnosticIdentity
          )
        )
        .map((result) => diagnosticFindingFromGritResult(rule, result, options));
      const [first, ...rest] = diagnostics;
      return [
        rule.id,
        first
          ? ({ kind: "findings", entry, diagnostics: [first, ...rest] } as const)
          : ({ kind: "clean", entry, diagnostics: [] } as const),
      ];
    })
  );
}

export function ruleRunResultFromDiagnosticOutcome(
  rule: RuleSourceFacts,
  outcome: DiagnosticRunOutcome
): RuleRunResult {
  switch (outcome.kind) {
    case "clean":
      return { exitCode: 0, diagnostics: [] };
    case "findings":
      return {
        exitCode: 1,
        diagnostics: outcome.diagnostics.map((diagnostic) => ({
          ruleId: diagnostic.ruleId,
          path: diagnostic.path,
          line: diagnostic.line,
          message: diagnostic.message,
          severity: diagnostic.severity,
          baselined: diagnostic.baselineState !== "unbaselined",
        })),
      };
    case "provider-failed":
      return infrastructureFailure(rule, outcome.failure, outcome.detail);
    case "scan-root-refused":
      return { exitCode: 1, diagnostics: [] };
    case "not-applicable":
      return { exitCode: 0, diagnostics: [] };
    case "unexpected-diagnostic-identity":
      return infrastructureFailure(
        rule,
        "GritUnexpectedDiagnosticIdentity",
        renderUnexpectedObservedGritIdentity(outcome.unexpectedIdentity)
      );
    default:
      return assertNeverOutcome(outcome);
  }
}

function diagnosticFindingFromGritResult(
  rule: RuleSourceFacts,
  result: GritResult,
  options: GritDiagnosticOptions
): DiagnosticFinding {
  return {
    kind: "diagnostic-finding",
    ruleId: rule.id,
    path: normalizeDiagnosticPath(result.path, options.repoRoot),
    line: result.start.line,
    message:
      result.extra.message === null || result.extra.message.trim().length === 0
        ? rule.message
        : result.extra.message,
    severity: rule.lane === "advisory" ? "advisory" : "error",
    baselineState: "unbaselined",
  };
}

function normalizeDiagnosticPath(gritPath: string, repoRoot: string | undefined): string {
  if (!repoRoot || !path.isAbsolute(gritPath)) return normalizeGritPath(gritPath);
  return normalizeGritPath(path.relative(repoRoot, gritPath));
}

function assertNeverOutcome(outcome: never): never {
  throw new Error(`Unhandled Grit diagnostic outcome: ${JSON.stringify(outcome)}`);
}
