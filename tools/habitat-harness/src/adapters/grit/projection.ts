import {
  type DiagnosticFindingProjection,
  type DiagnosticRunOutcome,
  diagnosticCatalogEntryFromRuleGritFacts,
  type ObservedGritDiagnosticIdentity,
  observedGritDiagnosticIdentity,
  observedGritIdentityMatches,
  renderUnexpectedObservedGritIdentity,
} from "../../lib/diagnostic-catalog/index.js";
import type { RuleRunResult } from "../../rules/architecture.js";
import type { RuleGritFacts } from "../../rules/registry/index.js";
import { infrastructureFailure } from "./failure.js";
import { normalizeGritPath } from "./scan-roots/index.js";
import type { GritProjectionOptions, GritReport, GritResult } from "./types.js";

export function projectGritDiagnosticOutcomes(
  selectedRules: readonly RuleGritFacts[],
  report: GritReport,
  options: GritProjectionOptions = {}
): Map<string, DiagnosticRunOutcome> {
  const entries = new Map(
    selectedRules.map((rule) => [rule.id, diagnosticCatalogEntryFromRuleGritFacts(rule)])
  );
  const selectedPatterns = new Set(
    [...entries.values()].map((entry) => entry.diagnosticIdentity.patternIdentity)
  );
  const unexpected = report.results
    .map(observedGritDiagnosticIdentity)
    .find(
      (observed) =>
        observed?.kind === "observed-identity-mismatch" ||
        (options.rejectUnexpectedPatternIdentity &&
          observed?.kind === "observed-grit-pattern" &&
          !selectedPatterns.has(observed.observedPatternIdentity))
    );
  if (unexpected) {
    return new Map(
      selectedRules.map((rule) => [rule.id, unexpectedIdentityOutcome(rule, unexpected)])
    );
  }

  return new Map(
    selectedRules.map((rule) => {
      const outcome = projectGritRuleOutcome(rule, report, options);
      return [rule.id, outcome];
    })
  );
}

export function projectGritResults(
  selectedRules: readonly RuleGritFacts[],
  report: GritReport,
  options: GritProjectionOptions = {}
): Map<string, RuleRunResult> {
  return ruleRunResultsFromDiagnosticOutcomes(
    selectedRules,
    projectGritDiagnosticOutcomes(selectedRules, report, options)
  );
}

export function ruleRunResultsFromDiagnosticOutcomes(
  selectedRules: readonly RuleGritFacts[],
  outcomes: ReadonlyMap<string, DiagnosticRunOutcome>
): Map<string, RuleRunResult> {
  return new Map(
    selectedRules.map((rule) => {
      const outcome = outcomes.get(rule.id);
      return [
        rule.id,
        outcome
          ? ruleRunResultFromDiagnosticOutcome(rule, outcome)
          : infrastructureFailure(rule, "GritPatternProjectionMiss"),
      ];
    })
  );
}

export function ruleRunResultFromDiagnosticOutcome(
  rule: RuleGritFacts,
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
    case "projection-missed":
      return infrastructureFailure(
        rule,
        "GritPatternProjectionMiss",
        `Expected Grit pattern identity was not projected: ${outcome.expectedIdentity.patternIdentity}.`
      );
    case "unexpected-diagnostic-identity":
      return infrastructureFailure(
        rule,
        "GritUnexpectedDiagnosticIdentity",
        renderUnexpectedObservedGritIdentity(outcome.unexpectedIdentity)
      );
    case "adapter-failed":
      return infrastructureFailure(rule, outcome.failure, outcome.detail);
  }
}

function projectGritRuleOutcome(
  rule: RuleGritFacts,
  report: GritReport,
  options: GritProjectionOptions
): DiagnosticRunOutcome {
  const entry = diagnosticCatalogEntryFromRuleGritFacts(rule);
  const diagnostics = report.results
    .filter((result) =>
      observedGritIdentityMatches(observedGritDiagnosticIdentity(result), entry.diagnosticIdentity)
    )
    .map((result) => diagnosticFindingProjection(rule, entry, result));
  if (diagnostics.length > 0) {
    return {
      kind: "findings",
      entry,
      diagnostics: diagnostics as [DiagnosticFindingProjection, ...DiagnosticFindingProjection[]],
    };
  }
  if (options.requirePatternFinding) {
    return { kind: "projection-missed", entry, expectedIdentity: entry.diagnosticIdentity };
  }
  return { kind: "clean", entry, diagnostics: [] };
}

function diagnosticFindingProjection(
  rule: RuleGritFacts,
  entry: ReturnType<typeof diagnosticCatalogEntryFromRuleGritFacts>,
  result: GritResult
): DiagnosticFindingProjection {
  return {
    kind: "diagnostic-finding",
    ruleId: rule.id,
    diagnosticCatalogEntryId: entry.diagnosticCatalogEntryId,
    diagnosticIdentity: entry.diagnosticIdentity,
    path: normalizeGritPath(result.path),
    line: result.start?.line,
    message: result.extra?.message ?? rule.message,
    severity: rule.lane === "advisory" ? "advisory" : "error",
    baselineState: "unbaselined",
  };
}

function unexpectedIdentityOutcome(
  rule: RuleGritFacts,
  unexpectedIdentity: ObservedGritDiagnosticIdentity
): DiagnosticRunOutcome {
  return {
    kind: "unexpected-diagnostic-identity",
    entry: diagnosticCatalogEntryFromRuleGritFacts(rule),
    unexpectedIdentity,
  };
}
