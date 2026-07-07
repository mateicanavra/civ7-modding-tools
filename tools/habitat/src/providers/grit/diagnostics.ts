import path from "node:path";
import {
  type DiagnosticFinding,
  type DiagnosticRunOutcome,
  diagnosticCatalogEntryFromRuleSourceFacts,
  type ObservedGritDiagnosticIdentity,
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
  const entries = new Map(
    selectedRules.map((rule) => [rule.id, diagnosticCatalogEntryFromRuleSourceFacts(rule)])
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
  selectedRules: readonly RuleSourceFacts[],
  report: GritReport,
  options: GritDiagnosticOptions = {}
): Map<string, RuleRunResult> {
  return ruleRunResultsFromDiagnosticOutcomes(
    selectedRules,
    gritDiagnosticOutcomesFromReport(selectedRules, report, options)
  );
}

export function ruleRunResultsFromDiagnosticOutcomes(
  selectedRules: readonly RuleSourceFacts[],
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
    case "provider-failed":
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
  rule: RuleSourceFacts,
  report: GritReport,
  options: GritDiagnosticOptions
): DiagnosticRunOutcome {
  const entry = diagnosticCatalogEntryFromRuleSourceFacts(rule);
  const diagnostics = report.results
    .filter((result) =>
      observedGritIdentityMatches(observedGritDiagnosticIdentity(result), entry.diagnosticIdentity)
    )
    .map((result) => diagnosticFindingFromGritResult(rule, entry, result, options));
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
  rule: RuleSourceFacts,
  entry: ReturnType<typeof diagnosticCatalogEntryFromRuleSourceFacts>,
  result: GritResult,
  options: GritDiagnosticOptions = {}
): DiagnosticFinding {
  return {
    kind: "diagnostic-finding",
    ruleId: rule.id,
    path: normalizeDiagnosticPath(result.path, options.repoRoot),
    line: result.start?.line,
    message: result.extra?.message ?? rule.message,
    severity: rule.lane === "advisory" ? "advisory" : "error",
    baselineState: "unbaselined",
  };
}

function normalizeDiagnosticPath(gritPath: string | undefined, repoRoot: string | undefined) {
  if (!repoRoot || !gritPath || !path.isAbsolute(gritPath)) return normalizeGritPath(gritPath);
  return normalizeGritPath(path.relative(repoRoot, gritPath));
}

function unexpectedIdentityOutcome(
  rule: RuleSourceFacts,
  unexpectedIdentity: ObservedGritDiagnosticIdentity
): DiagnosticRunOutcome {
  return {
    kind: "unexpected-diagnostic-identity",
    entry: diagnosticCatalogEntryFromRuleSourceFacts(rule),
    unexpectedIdentity,
  };
}
