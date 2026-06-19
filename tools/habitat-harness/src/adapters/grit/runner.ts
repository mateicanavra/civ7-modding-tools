import { Effect, type Layer } from "effect";
import {
  type DiagnosticAdapterFailureKind,
  type DiagnosticCacheObservation,
  type DiagnosticRunOutcome,
  type DiagnosticScanRootRefusal,
  diagnosticCatalogEntryFromRuleGritFacts,
  renderDiagnosticScanRootRefusal,
} from "../../lib/diagnostic-catalog/index.js";
import { runHabitatEffect } from "../../lib/effect-runtime.js";
import { HabitatProcess, HabitatProcessLive } from "../../lib/habitat-process.js";
import type { RuleRunResult } from "../../rules/architecture.js";
import type { RuleGritFacts } from "../../rules/registry/index.js";
import { runDocsApplyBackedDiagnosticOutcomes, runDocsApplyBackedGritRules } from "./docs-apply.js";
import { infrastructureFailure } from "./failure.js";
import {
  projectGritDiagnosticOutcomes,
  ruleRunResultsFromDiagnosticOutcomes,
} from "./projection.js";
import { gritCheckProgram } from "./request.js";
import {
  decideEffectiveGritScanRoots,
  ruleHasDocsScanRoot,
  ruleUsesDocsApplyDryRun,
  selectedScanRootsForRules,
} from "./scan-roots/index.js";
import type {
  GritCheckCacheMode,
  GritCheckOutputFormat,
  GritDiagnosticAcquisition,
  GritProjectionOptions,
} from "./types.js";

interface GritRunOptions {
  scanRoots?: readonly string[];
  processLayer?: Layer.Layer<HabitatProcess>;
  cacheMode?: GritCheckCacheMode;
  requireObservableCacheStatus?: boolean;
  allowInjectedProbeRoot?: boolean;
  projection?: GritProjectionOptions;
}

export async function runGritRule(rule: RuleGritFacts): Promise<RuleRunResult> {
  const results = await runGritRules([rule]);
  return (
    results.get(rule.id) ?? infrastructureFailure(rule, "GritAdapterInternalContractViolation")
  );
}

export async function runGritRules(
  selectedRules: readonly RuleGritFacts[],
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
  selectedRules: readonly RuleGritFacts[],
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
  selectedRules: readonly RuleGritFacts[],
  options: GritRunOptions,
  outputFormat: GritCheckOutputFormat
): Promise<Map<string, RuleRunResult>> {
  return ruleRunResultsFromDiagnosticOutcomes(
    selectedRules,
    await runGritRuleOutcomeGroup(selectedRules, options, outputFormat)
  );
}

async function runGritRuleOutcomeGroup(
  selectedRules: readonly RuleGritFacts[],
  options: GritRunOptions,
  outputFormat: GritCheckOutputFormat
): Promise<Map<string, DiagnosticRunOutcome>> {
  const requestedScanRoots = selectedScanRootsForRules(selectedRules, options.scanRoots);
  const scanRootDecision = decideEffectiveGritScanRoots(selectedRules, requestedScanRoots, {
    allowInjectedProbeRoot: options.allowInjectedProbeRoot,
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
      allowInjectedProbeRoot: options.allowInjectedProbeRoot,
      allowDocsRoot: selectedRules.some(ruleHasDocsScanRoot),
      outputFormat,
    }).pipe(Effect.provide(options.processLayer ?? HabitatProcessLive))
  );
  switch (acquisition.kind) {
    case "parsed":
      return projectGritDiagnosticOutcomes(selectedRules, acquisition.report, options.projection);
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
  rule: RuleGritFacts,
  failure: DiagnosticAdapterFailureKind,
  detail: string
): DiagnosticRunOutcome {
  return {
    kind: "adapter-failed",
    entry: diagnosticCatalogEntryFromRuleGritFacts(rule),
    failure,
    detail,
  };
}

function scanRootRefusedOutcome(
  rule: RuleGritFacts,
  decision: DiagnosticScanRootRefusal,
  detail: string
): DiagnosticRunOutcome {
  return {
    kind: "scan-root-refused",
    entry: diagnosticCatalogEntryFromRuleGritFacts(rule),
    decision,
    detail,
  };
}

function cacheObservationMissingOutcome(
  rule: RuleGritFacts,
  cache: DiagnosticCacheObservation,
  detail: string
): DiagnosticRunOutcome {
  return {
    kind: "cache-observation-missing",
    entry: diagnosticCatalogEntryFromRuleGritFacts(rule),
    cache,
    failure: "GritCacheProvenanceMissing",
    detail,
  };
}
