import {
  type DiagnosticFinding,
  type DiagnosticRunOutcome,
  diagnosticCatalogEntryFromRulePatternFacts,
  type ObservedGritDiagnosticIdentity,
  observedGritDiagnosticIdentity,
  observedGritIdentityMatches,
  renderUnexpectedObservedGritIdentity,
} from "../../domains/diagnostic-pattern-catalog/index.js";
import type { GritDiagnosticOptions, GritReport, GritResult } from "../../providers/grit/types.js";
import type { RuleRunResult } from "../../rules/architecture.js";
import type { RulePatternFacts } from "../../rules/registry/index.js";
import { infrastructureFailure } from "./failure.js";
import { normalizeGritPath } from "./scan-roots/index.js";

export function gritDiagnosticOutcomesFromReport(
  selectedRules: readonly RulePatternFacts[],
  report: GritReport,
  options: GritDiagnosticOptions = {}
): Map<string, DiagnosticRunOutcome> {
  const entries = new Map(
    selectedRules.map((rule) => [rule.id, diagnosticCatalogEntryFromRulePatternFacts(rule)])
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
          observed?.kind === "observed-pattern" &&
          !selectedPatterns.has(observed.observedPatternIdentity))
    );
  if (unexpected) {
    return new Map(
      selectedRules.map((rule) => [rule.id, unexpectedIdentityOutcome(rule, unexpected)])
    );
  }

  return new Map(
    selectedRules.map((rule) => {
      const outcome = gritRuleOutcomeFromReport(rule, report, options);
      return [rule.id, outcome];
    })
  );
}

export function gritRuleResultsFromReport(
  selectedRules: readonly RulePatternFacts[],
  report: GritReport,
  options: GritDiagnosticOptions = {}
): Map<string, RuleRunResult> {
  return ruleRunResultsFromDiagnosticOutcomes(
    selectedRules,
    gritDiagnosticOutcomesFromReport(selectedRules, report, options)
  );
}

export function ruleRunResultsFromDiagnosticOutcomes(
  selectedRules: readonly RulePatternFacts[],
  outcomes: ReadonlyMap<string, DiagnosticRunOutcome>
): Map<string, RuleRunResult> {
  return new Map(
    selectedRules.map((rule) => {
      const outcome = outcomes.get(rule.id);
      return [
        rule.id,
        outcome
          ? ruleRunResultFromDiagnosticOutcome(rule, outcome)
          : infrastructureFailure(rule, "GritPatternMatchMissing"),
      ];
    })
  );
}

export function ruleRunResultFromDiagnosticOutcome(
  rule: RulePatternFacts,
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
    case "identity-missing":
      return infrastructureFailure(
        rule,
        "GritPatternMatchMissing",
        `Expected diagnostic identity was not observed: ${renderExpectedIdentity(outcome.expectedIdentity)}.`
      );
    case "unexpected-diagnostic-identity":
      if (outcome.unexpectedIdentity.kind === "observed-native-rule") {
        return infrastructureFailure(
          rule,
          "GritUnexpectedDiagnosticIdentity",
          `Unexpected native diagnostic identity: ${outcome.unexpectedIdentity.observedNativeDiagnosticIdentity}.`
        );
      }
      return infrastructureFailure(
        rule,
        "GritUnexpectedDiagnosticIdentity",
        renderUnexpectedObservedGritIdentity(outcome.unexpectedIdentity)
      );
    case "scan-root-refused":
      return infrastructureFailure(rule, "GritEmptyScanRoots", outcome.detail);
    case "cache-observation-missing":
      return infrastructureFailure(rule, outcome.failure, outcome.detail);
    case "adapter-failed":
      return infrastructureFailure(rule, outcome.failure, outcome.detail);
  }
}

function renderExpectedIdentity(
  identity: DiagnosticRunOutcome["entry"]["diagnosticIdentity"]
): string {
  if (identity.kind === "pattern") return identity.patternIdentity;
  return identity.nativeDiagnosticIdentity;
}

function gritRuleOutcomeFromReport(
  rule: RulePatternFacts,
  report: GritReport,
  options: GritDiagnosticOptions
): DiagnosticRunOutcome {
  const entry = diagnosticCatalogEntryFromRulePatternFacts(rule);
  const diagnostics = report.results
    .filter((result) =>
      observedGritIdentityMatches(observedGritDiagnosticIdentity(result), entry.diagnosticIdentity)
    )
    .map((result) => diagnosticFindingFromGritResult(rule, entry, result));
  if (diagnostics.length > 0) {
    return {
      kind: "findings",
      entry,
      diagnostics: diagnostics as [DiagnosticFinding, ...DiagnosticFinding[]],
    };
  }
  if (options.requirePatternFinding) {
    return { kind: "identity-missing", entry, expectedIdentity: entry.diagnosticIdentity };
  }
  return { kind: "clean", entry, diagnostics: [] };
}

function diagnosticFindingFromGritResult(
  rule: RulePatternFacts,
  entry: ReturnType<typeof diagnosticCatalogEntryFromRulePatternFacts>,
  result: GritResult
): DiagnosticFinding {
  return {
    kind: "diagnostic-finding",
    ruleId: rule.id,
    path: normalizeGritPath(result.path),
    line: result.start?.line,
    message: result.extra?.message ?? rule.message,
    severity: rule.lane === "advisory" ? "advisory" : "error",
    baselineState: "unbaselined",
  };
}

function unexpectedIdentityOutcome(
  rule: RulePatternFacts,
  unexpectedIdentity: ObservedGritDiagnosticIdentity
): DiagnosticRunOutcome {
  return {
    kind: "unexpected-diagnostic-identity",
    entry: diagnosticCatalogEntryFromRulePatternFacts(rule),
    unexpectedIdentity,
  };
}
