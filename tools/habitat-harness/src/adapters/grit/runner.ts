import { Effect, Layer } from "effect";
import { CommandUnavailable } from "../../errors/index.js";
import {
  type DiagnosticAdapterFailureKind,
  type DiagnosticCacheObservation,
  type DiagnosticRunOutcome,
  type DiagnosticScanRootRefusal,
  diagnosticCatalogEntryFromRulePatternFacts,
  renderDiagnosticScanRootRefusal,
} from "../../lib/diagnostic-catalog/index.js";
import { runHabitatEffect } from "../../lib/effect-runtime.js";
import { HabitatProcess } from "../../lib/habitat-process.js";
import {
  GritProvider,
  type GritProviderService,
  gritCheckRequest,
} from "../../providers/grit/index.js";
import type { RuleRunResult } from "../../rules/architecture.js";
import type { RulePatternFacts } from "../../rules/registry/index.js";
import {
  gritDiagnosticOutcomesFromReport,
  ruleRunResultsFromDiagnosticOutcomes,
} from "./diagnostics.js";
import { runDocsApplyBackedDiagnosticOutcomes, runDocsApplyBackedGritRules } from "./docs-apply.js";
import { infrastructureFailure } from "./failure.js";
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
  providerLayer?: Layer.Layer<GritProvider>;
  cacheMode?: GritCheckCacheMode;
  requireObservableCacheStatus?: boolean;
  diagnostics?: GritDiagnosticOptions;
}

const LIVE_SOURCE_BATCH_RULE_LIMIT = 1;

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
  const schedulingFailure = liveSourceBatchSchedulingFailure(selectedRules, options, outputFormat);
  if (schedulingFailure) {
    return new Map(
      selectedRules.map((rule) => [
        rule.id,
        adapterFailedOutcome(rule, "GritAdapterInternalContractViolation", schedulingFailure),
      ])
    );
  }
  const program = gritCheckProgram(scanRoots, {
    cacheMode: options.cacheMode,
    requireObservableCacheStatus: options.requireObservableCacheStatus,
    allowDocsRoot: selectedRules.some(ruleHasDocsScanRoot),
    outputFormat,
  });
  const providerLayer = options.processLayer
    ? gritProviderLayerForOptions(options)
    : options.providerLayer;
  const acquisition = await runHabitatEffect(
    providerLayer ? program.pipe(Effect.provide(providerLayer)) : program
  );
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

function liveSourceBatchSchedulingFailure(
  selectedRules: readonly RulePatternFacts[],
  options: GritRunOptions,
  outputFormat: GritCheckOutputFormat
): string | null {
  if (options.processLayer) return null;
  if (outputFormat !== "json") return null;
  if (selectedRules.length <= LIVE_SOURCE_BATCH_RULE_LIMIT) return null;
  return [
    `Refusing to run ${selectedRules.length} source-backed Grit rules as one live batch.`,
    "This Habitat adapter cannot schedule broad source-wide Grit execution safely yet.",
    "Move this lane to GritProvider batching/resource scheduling before enabling aggregate execution.",
  ].join(" ");
}

function gritProviderLayerForOptions(options: GritRunOptions): Layer.Layer<GritProvider> {
  const processLayer = options.processLayer;
  if (!processLayer) throw new Error("processLayer is required for test-backed Grit provider");
  return Layer.effect(
    GritProvider,
    HabitatProcess.pipe(
      Effect.map(
        (process): GritProviderService => ({
          check: (request) =>
            process
              .run(
                gritCheckRequest(request.scanRoots, {
                  cacheDir: request.cacheDir,
                  observableCacheStatus: request.observableCacheStatus,
                  outputFormat: request.outputFormat,
                  timeoutMs: request.timeoutMs,
                })
              )
              .pipe(
                Effect.mapError((error) =>
                  error._tag === "GritToolUnavailable"
                    ? new CommandUnavailable({
                        commandId: error.commandId,
                        executable: error.executable,
                        argv: error.argv,
                        cwd: error.cwd,
                        cause: error.cause,
                      })
                    : error
                )
              ),
          checkRequest: (request) =>
            gritCheckRequest(request.scanRoots, {
              cacheDir: request.cacheDir,
              observableCacheStatus: request.observableCacheStatus,
              outputFormat: request.outputFormat,
              timeoutMs: request.timeoutMs,
            }),
        })
      )
    )
  ).pipe(Layer.provide(processLayer));
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
