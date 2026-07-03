import { Effect, type Layer } from "effect";
import {
  type DiagnosticAdapterFailureKind,
  type DiagnosticCacheObservation,
  type DiagnosticRunOutcome,
  type DiagnosticScanRootRefusal,
  diagnosticCatalogEntryFromRulePatternFacts,
  renderDiagnosticScanRootRefusal,
} from "../../lib/diagnostic-catalog/index.js";
import { runHabitatEffect } from "../../lib/effect-runtime.js";
import { HabitatProcess, HabitatProcessLive } from "../../lib/habitat-process.js";
import type { RuleRunResult } from "../../rules/architecture.js";
import type { RulePatternFacts } from "../../rules/registry/index.js";
import { runDocsApplyBackedDiagnosticOutcomes, runDocsApplyBackedGritRules } from "./docs-apply.js";
import { infrastructureFailure } from "./failure.js";
import {
  gritDiagnosticOutcomesFromReport,
  ruleRunResultsFromDiagnosticOutcomes,
} from "./diagnostics.js";
import { gritCheckProgram } from "./request.js";
import {
  decideEffectivePatternScanRoots,
  ruleHasDocsScanRoot,
  ruleUsesDocsApplyDryRun,
  selectedScanRootsForRules,
} from "./scan-roots/index.js";
import type {
  GritCheckCacheMode,
  GritCheckOutputFormat,
  GritDiagnosticAcquisition,
  GritDiagnosticOptions,
} from "./types.js";

interface GritRunOptions {
  scanRoots?: readonly string[];
  processLayer?: Layer.Layer<HabitatProcess>;
  cacheMode?: GritCheckCacheMode;
  requireObservableCacheStatus?: boolean;
  diagnostics?: GritDiagnosticOptions;
}

export async function runGritRule(rule: RulePatternFacts): Promise<RuleRunResult> {
  const results = await runGritRules([rule]);
  return (
    results.get(rule.id) ?? infrastructureFailure(rule, "GritAdapterInternalContractViolation")
  );
}

export async function runGritRules(
  selectedRules: readonly RulePatternFacts[],
  options: GritRunOptions = {}
): Promise<Map<string, RuleRunResult>> {
  if (selectedRules.length === 0) return new Map();
  const docsRules = selectedRules.filter(ruleHasDocsScanRoot);
  const docsApplyBackedRules = docsRules.filter(ruleUsesDocsApplyDryRun);
  const docsCheckRules = docsRules.filter((rule) => !ruleUsesDocsApplyDryRun(rule));
  const sourceRules = selectedRules.filter((rule) => !ruleHasDocsScanRoot(rule));
  if (docsRules.length > 0 && sourceRules.length > 0) {
    return new Map([
      ...(await runGritRuleGroup(sourceRules, options, "json")),
      ...(await runDocsApplyBackedGritRules(docsApplyBackedRules, options)),
      ...(await runGritRuleGroup(docsCheckRules, options, "text")),
    ]);
  }
  if (docsApplyBackedRules.length > 0 && docsCheckRules.length > 0) {
    return new Map([
      ...(await runDocsApplyBackedGritRules(docsApplyBackedRules, options)),
      ...(await runGritRuleGroup(docsCheckRules, options, "text")),
    ]);
  }
  if (docsApplyBackedRules.length > 0) {
    return runDocsApplyBackedGritRules(docsApplyBackedRules, options);
  }
  return runGritRuleGroup(selectedRules, options, docsRules.length > 0 ? "text" : "json");
}

export async function runGritDiagnosticOutcomes(
  selectedRules: readonly RulePatternFacts[],
  options: GritRunOptions = {}
): Promise<Map<string, DiagnosticRunOutcome>> {
  if (selectedRules.length === 0) return new Map();
  const docsRules = selectedRules.filter(ruleHasDocsScanRoot);
  const docsApplyBackedRules = docsRules.filter(ruleUsesDocsApplyDryRun);
  const docsCheckRules = docsRules.filter((rule) => !ruleUsesDocsApplyDryRun(rule));
  const sourceRules = selectedRules.filter((rule) => !ruleHasDocsScanRoot(rule));
  return new Map([
    ...(await runDocsApplyBackedDiagnosticOutcomes(docsApplyBackedRules, options)),
    ...(await runGritRuleOutcomeGroup(sourceRules, options, "json")),
    ...(await runGritRuleOutcomeGroup(docsCheckRules, options, "text")),
  ]);
}

async function runGritRuleGroup(
  selectedRules: readonly RulePatternFacts[],
  options: GritRunOptions,
  outputFormat: GritCheckOutputFormat
): Promise<Map<string, RuleRunResult>> {
  return ruleRunResultsFromDiagnosticOutcomes(
    selectedRules,
    await runGritRuleOutcomeGroup(selectedRules, options, outputFormat)
  );
}

async function runGritRuleOutcomeGroup(
  selectedRules: readonly RulePatternFacts[],
  options: GritRunOptions,
  outputFormat: GritCheckOutputFormat
): Promise<Map<string, DiagnosticRunOutcome>> {
  const requestedScanRoots = selectedScanRootsForRules(selectedRules, options.scanRoots);
  const scanRootDecision = decideEffectivePatternScanRoots(selectedRules, requestedScanRoots, {
    allowDocsRoot: selectedRules.some(ruleHasDocsScanRoot),
    approvedScanRoots: selectedRules.flatMap((rule) => rule.scanRoots),
  });
  if (scanRootDecision.kind === "refused") {
    return new Map(
      selectedRules.map((rule) => [
        rule.id,
        scanRootRefusedOutcome(
          rule,
          scanRootDecision,
          renderDiagnosticScanRootRefusal(scanRootDecision)
        ),
      ])
    );
  }
  const scanRoots =
    scanRootDecision.kind === "expanded-test-files"
      ? scanRootDecision.effectiveRoots
      : scanRootDecision.roots;

  const acquisition = await runHabitatEffect(
    gritCheckProgram(scanRoots, {
      cacheMode: options.cacheMode,
      requireObservableCacheStatus: options.requireObservableCacheStatus,
      allowDocsRoot: selectedRules.some(ruleHasDocsScanRoot),
      outputFormat,
    }).pipe(Effect.provide(options.processLayer ?? HabitatProcessLive))
  );
  switch (acquisition.kind) {
    case "parsed":
      return gritDiagnosticOutcomesFromReport(selectedRules, acquisition.report, options.diagnostics);
    case "adapter-failed":
      if (acquisition.failure === "GritCacheProvenanceMissing") {
        const cache = missingCacheObservation(acquisition);
        if (cache) {
          return new Map(
            selectedRules.map((rule) => [
              rule.id,
              cacheObservationMissingOutcome(rule, cache, acquisition.message),
            ])
          );
        }
      }
      return new Map(
        selectedRules.map((rule) => [
          rule.id,
          adapterFailedOutcome(rule, acquisition.failure, acquisition.message),
        ])
      );
    case "scan-root-refused":
      return new Map(
        selectedRules.map((rule) => [
          rule.id,
          scanRootRefusedOutcome(rule, acquisition.decision, acquisition.message),
        ])
      );
  }
}

function missingCacheObservation(
  acquisition: Extract<GritDiagnosticAcquisition, { kind: "adapter-failed" }>
): DiagnosticCacheObservation | null {
  if (
    (acquisition.command.kind === "completed" || acquisition.command.kind === "interrupted") &&
    acquisition.command.cache.kind === "missing-required-observation"
  ) {
    return acquisition.command.cache;
  }
  return null;
}

function adapterFailedOutcome(
  rule: RulePatternFacts,
  failure: DiagnosticAdapterFailureKind,
  detail: string
): DiagnosticRunOutcome {
  return {
    kind: "adapter-failed",
    entry: diagnosticCatalogEntryFromRulePatternFacts(rule),
    failure,
    detail,
  };
}

function scanRootRefusedOutcome(
  rule: RulePatternFacts,
  decision: DiagnosticScanRootRefusal,
  detail: string
): DiagnosticRunOutcome {
  return {
    kind: "scan-root-refused",
    entry: diagnosticCatalogEntryFromRulePatternFacts(rule),
    decision,
    detail,
  };
}

function cacheObservationMissingOutcome(
  rule: RulePatternFacts,
  cache: DiagnosticCacheObservation,
  detail: string
): DiagnosticRunOutcome {
  return {
    kind: "cache-observation-missing",
    entry: diagnosticCatalogEntryFromRulePatternFacts(rule),
    cache,
    failure: "GritCacheProvenanceMissing",
    detail,
  };
}
