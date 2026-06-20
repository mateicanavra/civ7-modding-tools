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
import { GritProvider, type GritProviderRequirements } from "../../providers/grit/index.js";
import type {
  GritCheckCacheMode,
  GritCheckOutputFormat,
  GritDiagnosticAcquisition,
  GritDiagnosticOptions,
} from "../../providers/grit/types.js";
import type { RuleRunResult } from "../../rules/architecture.js";
import type { RulePatternFacts } from "../../rules/registry/index.js";
import {
  gritDiagnosticOutcomesFromReport,
  ruleRunResultsFromDiagnosticOutcomes,
} from "./diagnostics.js";
import { runDocsApplyBackedDiagnosticOutcomesEffect } from "./docs-apply.js";
import { infrastructureFailure } from "./failure.js";
import { gritCheckProgram } from "./request.js";
import {
  decidePatternScanRoots,
  ruleHasDocsScanRoot,
  ruleUsesDocsApplyDryRun,
  selectedScanRootsForRules,
} from "./scan-roots/index.js";

interface GritRunOptions {
  scanRoots?: readonly string[];
  providerLayer?: Layer.Layer<GritProvider>;
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
  return runHabitatEffect(
    options.providerLayer
      ? runGritRulesEffect(selectedRules, options).pipe(Effect.provide(options.providerLayer))
      : runGritRulesEffect(selectedRules, options)
  );
}

export function runGritRulesEffect(
  selectedRules: readonly RulePatternFacts[],
  options: Omit<GritRunOptions, "providerLayer"> = {}
): Effect.Effect<Map<string, RuleRunResult>, never, GritProvider | GritProviderRequirements> {
  return runGritDiagnosticOutcomesEffect(selectedRules, options).pipe(
    Effect.map((outcomes) => ruleRunResultsFromDiagnosticOutcomes(selectedRules, outcomes))
  );
}

export async function runGritDiagnosticOutcomes(
  selectedRules: readonly RulePatternFacts[],
  options: GritRunOptions = {}
): Promise<Map<string, DiagnosticRunOutcome>> {
  return runHabitatEffect(
    options.providerLayer
      ? runGritDiagnosticOutcomesEffect(selectedRules, options).pipe(
          Effect.provide(options.providerLayer)
        )
      : runGritDiagnosticOutcomesEffect(selectedRules, options)
  );
}

export function runGritDiagnosticOutcomesEffect(
  selectedRules: readonly RulePatternFacts[],
  options: Omit<GritRunOptions, "providerLayer"> = {}
): Effect.Effect<
  Map<string, DiagnosticRunOutcome>,
  never,
  GritProvider | GritProviderRequirements
> {
  if (selectedRules.length === 0) return Effect.succeed(new Map<string, DiagnosticRunOutcome>());
  const docsRules = selectedRules.filter(ruleHasDocsScanRoot);
  const docsApplyBackedRules = docsRules.filter(ruleUsesDocsApplyDryRun);
  const docsCheckRules = docsRules.filter((rule) => !ruleUsesDocsApplyDryRun(rule));
  const sourceRules = selectedRules.filter((rule) => !ruleHasDocsScanRoot(rule));
  return Effect.all(
    [
      runGritRuleOutcomeGroupEffect(sourceRules, options, "json"),
      runDocsApplyBackedDiagnosticOutcomesEffect(docsApplyBackedRules, options),
      runGritRuleOutcomeGroupEffect(docsCheckRules, options, "text"),
    ],
    { concurrency: 1 }
  ).pipe(Effect.map((groups) => new Map(groups.flatMap((group) => [...group]))));
}

function runGritRuleOutcomeGroupEffect(
  selectedRules: readonly RulePatternFacts[],
  options: Omit<GritRunOptions, "providerLayer">,
  outputFormat: GritCheckOutputFormat
): Effect.Effect<
  Map<string, DiagnosticRunOutcome>,
  never,
  GritProvider | GritProviderRequirements
> {
  if (selectedRules.length === 0) return Effect.succeed(new Map<string, DiagnosticRunOutcome>());
  const requestedScanRoots = selectedScanRootsForRules(selectedRules, options.scanRoots);
  const scanRootDecision = decidePatternScanRoots(requestedScanRoots, {
    allowDocsRoot: selectedRules.some(ruleHasDocsScanRoot),
    approvedScanRoots: selectedRules.flatMap((rule) => rule.scanRoots),
  });
  if (scanRootDecision.kind === "refused") {
    return Effect.succeed(
      new Map(
        selectedRules.map((rule) => [
          rule.id,
          scanRootRefusedOutcome(
            rule,
            scanRootDecision,
            renderDiagnosticScanRootRefusal(scanRootDecision)
          ),
        ])
      )
    );
  }
  if (scanRootDecision.kind !== "accepted") {
    return Effect.succeed(
      new Map(
        selectedRules.map((rule) => [
          rule.id,
          adapterFailedOutcome(
            rule,
            "GritAdapterInternalContractViolation",
            "Unexpected scan-root expansion decision after ignored-test expansion removal."
          ),
        ])
      )
    );
  }
  const scanRoots = scanRootDecision.roots;
  const program = gritCheckProgram(scanRoots, {
    cacheMode: options.cacheMode,
    requireObservableCacheStatus: options.requireObservableCacheStatus,
    allowDocsRoot: selectedRules.some(ruleHasDocsScanRoot),
    outputFormat,
  });
  return program.pipe(
    Effect.match({
      onFailure: (error) =>
        new Map(
          selectedRules.map((rule) => [
            rule.id,
            adapterFailedOutcome(
              rule,
              "GritToolUnavailable",
              error instanceof Error ? error.message : "Grit cache or command resource unavailable."
            ),
          ])
        ),
      onSuccess: (acquisition) => outcomesFromAcquisition(selectedRules, acquisition, options),
    })
  );
}

function outcomesFromAcquisition(
  selectedRules: readonly RulePatternFacts[],
  acquisition: GritDiagnosticAcquisition,
  options: GritRunOptions
): Map<string, DiagnosticRunOutcome> {
  switch (acquisition.kind) {
    case "parsed":
      return gritDiagnosticOutcomesFromReport(
        selectedRules,
        acquisition.report,
        options.diagnostics
      );
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
