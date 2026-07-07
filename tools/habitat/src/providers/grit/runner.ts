import {
  type DiagnosticCacheObservation,
  type DiagnosticFinding,
  type DiagnosticProviderFailureKind,
  type DiagnosticRunOutcome,
  type DiagnosticScanRootRefusal,
  diagnosticCatalogEntryFromRuleSourceFacts,
  renderDiagnosticScanRootRefusal,
} from "@habitat/cli/service/model/diagnostics/index";
import type { RuleRunResult } from "@habitat/cli/service/model/diagnostics/policy/rule-runtime/architecture.policy";
import type { RuleSourceFacts } from "@habitat/cli/service/model/rules/index";
import { Effect } from "effect";
import {
  gritDiagnosticOutcomesFromReport,
  ruleRunResultsFromDiagnosticOutcomes,
} from "./diagnostics.js";
import { runDocsApplyBackedDiagnosticOutcomesEffect } from "./docs-apply.js";
import { infrastructureFailure } from "./failure.js";
import type { GritDiagnosticAcquisition } from "./output.js";
import { gritCheckProgram } from "./request.js";
import type { GritProviderRequirements, GritProviderService } from "./resource.js";
import {
  decidePatternScanRoots,
  ruleHasDocsScanRoot,
  ruleUsesDocsApplyDryRun,
  scanRootIsWithinDeclaredRoot,
  scanRootMatchesDeclaredRoot,
  selectedScanRootsForRules,
} from "./scan-roots/index.js";
import { runSourcePatternCheckOutcomesEffect } from "./source-check.js";
import type { GritCheckCacheMode, GritCheckOutputFormat, GritDiagnosticOptions } from "./types.js";

interface GritRunOptions {
  repoRoot: string;
  grit: GritProviderService;
  scanRoots?: readonly string[];
  cacheMode?: GritCheckCacheMode;
  requireObservableCacheStatus?: boolean;
  diagnostics?: GritDiagnosticOptions;
}

export function runGritRulesEffect(
  selectedRules: readonly RuleSourceFacts[],
  options: GritRunOptions
): Effect.Effect<Map<string, RuleRunResult>, never, GritProviderRequirements> {
  return runGritDiagnosticOutcomesEffect(selectedRules, options).pipe(
    Effect.map((outcomes) => ruleRunResultsFromDiagnosticOutcomes(selectedRules, outcomes))
  );
}

export function runGritDiagnosticOutcomesEffect(
  selectedRules: readonly RuleSourceFacts[],
  options: GritRunOptions
): Effect.Effect<Map<string, DiagnosticRunOutcome>, never, GritProviderRequirements> {
  if (selectedRules.length === 0) return Effect.succeed(new Map<string, DiagnosticRunOutcome>());
  const docsRules = selectedRules.filter(ruleHasDocsScanRoot);
  const docsApplyBackedRules = docsRules.filter(ruleUsesDocsApplyDryRun);
  const docsCheckRules = docsRules.filter((rule) => !ruleUsesDocsApplyDryRun(rule));
  const sourceRules = selectedRules.filter((rule) => !ruleHasDocsScanRoot(rule));
  return Effect.all(
    [
      runSourcePatternCheckOutcomesEffect(sourceRules, options),
      runDocsApplyBackedDiagnosticOutcomesEffect(docsApplyBackedRules, options),
      runGritRuleOutcomeGroupEffect(docsCheckRules, options, "text"),
    ],
    { concurrency: 1 }
  ).pipe(Effect.map((groups) => new Map(groups.flatMap((group) => [...group]))));
}

function runGritRuleOutcomeGroupEffect(
  selectedRules: readonly RuleSourceFacts[],
  options: GritRunOptions,
  outputFormat: GritCheckOutputFormat
): Effect.Effect<Map<string, DiagnosticRunOutcome>, never, GritProviderRequirements> {
  if (selectedRules.length === 0) return Effect.succeed(new Map<string, DiagnosticRunOutcome>());
  const requestedScanRoots = selectedScanRootsForRules(selectedRules, options.scanRoots, {
    repoRoot: options.repoRoot,
  });
  if (requestedScanRoots.length === 0) {
    return runGritScanRootBatchEffect(selectedRules, [], options, outputFormat);
  }
  const batches = scanRootBatchesForRules(selectedRules, requestedScanRoots, options);
  return Effect.all(
    batches.map((batch) =>
      runGritScanRootBatchEffect(batch.rules, batch.scanRoots, options, outputFormat)
    ),
    { concurrency: outputFormat === "json" ? 2 : 1 }
  ).pipe(Effect.map((batchOutcomes) => mergeBatchOutcomes(selectedRules, batchOutcomes)));
}

interface GritScanRootBatch {
  readonly scanRoots: readonly string[];
  readonly rules: readonly RuleSourceFacts[];
}

function scanRootBatchesForRules(
  selectedRules: readonly RuleSourceFacts[],
  requestedScanRoots: readonly string[],
  options: Pick<GritRunOptions, "scanRoots"> = {}
): GritScanRootBatch[] {
  const matchesDeclaredRoot = options.scanRoots
    ? scanRootIsWithinDeclaredRoot
    : scanRootMatchesDeclaredRoot;
  return requestedScanRoots.flatMap((scanRoot) =>
    selectedRules
      .filter((rule) =>
        rule.scanRoots.some((declaredRoot) => matchesDeclaredRoot(scanRoot, declaredRoot))
      )
      .map((rule) => ({ scanRoots: [scanRoot], rules: [rule] }))
  );
}

function runGritScanRootBatchEffect(
  selectedRules: readonly RuleSourceFacts[],
  scanRoots: readonly string[],
  options: GritRunOptions,
  outputFormat: GritCheckOutputFormat
): Effect.Effect<Map<string, DiagnosticRunOutcome>, never, GritProviderRequirements> {
  if (selectedRules.length === 0) return Effect.succeed(new Map<string, DiagnosticRunOutcome>());
  const scanRootDecision = decidePatternScanRoots(scanRoots, {
    repoRoot: options.repoRoot,
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
          providerFailedOutcome(
            rule,
            "GritProviderInternalContractViolation",
            "Unexpected scan-root expansion decision after ignored-test expansion removal."
          ),
        ])
      )
    );
  }
  const program = gritCheckProgram(scanRoots, {
    repoRoot: options.repoRoot,
    grit: options.grit,
    cacheMode: options.cacheMode,
    requireObservableCacheStatus: options.requireObservableCacheStatus,
    allowDocsRoot: selectedRules.some(ruleHasDocsScanRoot),
    outputFormat,
  });
  return program.pipe(
    Effect.match({
      onFailure: () =>
        new Map(
          selectedRules.map((rule) => [
            rule.id,
            providerFailedOutcome(
              rule,
              "GritToolUnavailable",
              "Grit cache or command resource unavailable."
            ),
          ])
        ),
      onSuccess: (acquisition) => outcomesFromAcquisition(selectedRules, acquisition, options),
    })
  );
}

function mergeBatchOutcomes(
  selectedRules: readonly RuleSourceFacts[],
  batchOutcomes: readonly ReadonlyMap<string, DiagnosticRunOutcome>[]
): Map<string, DiagnosticRunOutcome> {
  return new Map(
    selectedRules.map((rule) => [
      rule.id,
      mergeRuleBatchOutcomes(
        rule,
        batchOutcomes.flatMap((outcomes) => {
          const outcome = outcomes.get(rule.id);
          return outcome ? [outcome] : [];
        })
      ),
    ])
  );
}

function mergeRuleBatchOutcomes(
  rule: RuleSourceFacts,
  outcomes: readonly DiagnosticRunOutcome[]
): DiagnosticRunOutcome {
  const blocking = outcomes.find(
    (outcome) => outcome.kind !== "clean" && outcome.kind !== "findings"
  );
  if (blocking) return blocking;
  const findings = outcomes.flatMap((outcome) =>
    outcome.kind === "findings" ? [...outcome.diagnostics] : []
  );
  if (findings.length > 0) {
    return {
      kind: "findings",
      entry: diagnosticCatalogEntryFromRuleSourceFacts(rule),
      diagnostics: findings as [DiagnosticFinding, ...DiagnosticFinding[]],
    };
  }
  return {
    kind: "clean",
    entry: diagnosticCatalogEntryFromRuleSourceFacts(rule),
    diagnostics: [],
  };
}

function outcomesFromAcquisition(
  selectedRules: readonly RuleSourceFacts[],
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
    case "provider-failed":
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
          providerFailedOutcome(rule, acquisition.failure, acquisition.message),
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
  acquisition: Extract<GritDiagnosticAcquisition, { kind: "provider-failed" }>
): DiagnosticCacheObservation | null {
  if (
    (acquisition.command.kind === "completed" || acquisition.command.kind === "interrupted") &&
    acquisition.command.cache.kind === "missing-required-observation"
  ) {
    return acquisition.command.cache;
  }
  return null;
}

function providerFailedOutcome(
  rule: RuleSourceFacts,
  failure: DiagnosticProviderFailureKind,
  detail: string
): DiagnosticRunOutcome {
  return {
    kind: "provider-failed",
    entry: diagnosticCatalogEntryFromRuleSourceFacts(rule),
    failure,
    detail,
  };
}

function scanRootRefusedOutcome(
  rule: RuleSourceFacts,
  decision: DiagnosticScanRootRefusal,
  detail: string
): DiagnosticRunOutcome {
  return {
    kind: "scan-root-refused",
    entry: diagnosticCatalogEntryFromRuleSourceFacts(rule),
    decision,
    detail,
  };
}

function cacheObservationMissingOutcome(
  rule: RuleSourceFacts,
  cache: DiagnosticCacheObservation,
  detail: string
): DiagnosticRunOutcome {
  return {
    kind: "cache-observation-missing",
    entry: diagnosticCatalogEntryFromRuleSourceFacts(rule),
    cache,
    failure: "GritCacheProvenanceMissing",
    detail,
  };
}
