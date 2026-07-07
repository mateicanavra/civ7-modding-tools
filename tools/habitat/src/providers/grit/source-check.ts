import {
  type DiagnosticCacheObservation,
  type DiagnosticFinding,
  type DiagnosticProviderFailureKind,
  type DiagnosticRunOutcome,
  diagnosticCatalogEntryFromRuleSourceFacts,
  renderDiagnosticScanRootRefusal,
} from "@habitat/cli/service/model/diagnostics/index";
import type { RuleSourceFacts } from "@habitat/cli/service/model/rules/index";
import { Effect } from "effect";
import { gritDiagnosticOutcomesFromReport } from "./diagnostics.js";
import type { GritDiagnosticAcquisition } from "./output.js";
import type { GritProviderRequirements, GritProviderService } from "./resource.js";
import {
  decidePatternScanRoots,
  pathsOverlap,
  ruleHasDocsScanRoot,
  scanRootMatchesDeclaredRoot,
  selectedScanRootsForRules,
} from "./scan-roots/index.js";
import { runGritCheckWithScopedConfigEffect } from "./scoped-config.js";
import type { GritCheckCacheMode, GritDiagnosticOptions } from "./types.js";

export function runSourcePatternCheckOutcomesEffect(
  selectedRules: readonly RuleSourceFacts[],
  options: {
    repoRoot: string;
    grit: GritProviderService;
    scanRoots?: readonly string[];
    cacheMode?: GritCheckCacheMode;
    requireObservableCacheStatus?: boolean;
    diagnostics?: GritDiagnosticOptions;
  }
): Effect.Effect<Map<string, DiagnosticRunOutcome>, never, GritProviderRequirements> {
  if (selectedRules.length === 0) return Effect.succeed(new Map<string, DiagnosticRunOutcome>());
  const requestedScanRoots = selectedScanRootsForRules(selectedRules, options.scanRoots, {
    repoRoot: options.repoRoot,
  });
  if (requestedScanRoots.length === 0) {
    return runSourcePatternCheckBatchEffect(selectedRules, [], options);
  }
  const matchesDeclaredRoot = options.scanRoots ? pathsOverlap : scanRootMatchesDeclaredRoot;
  const matchedBatches = requestedScanRoots.flatMap((scanRoot) =>
    selectedRules
      .filter((rule) =>
        rule.scanRoots.some((declaredRoot) => matchesDeclaredRoot(scanRoot, declaredRoot))
      )
      .map((rule) => ({ scanRoots: [scanRoot], rules: [rule] }))
  );
  const matchedRuleIds = new Set(
    matchedBatches.flatMap((batch) => batch.rules.map((rule) => rule.id))
  );
  const fallbackBatches = selectedRules
    .filter((rule) => !matchedRuleIds.has(rule.id))
    .map((rule) => ({ scanRoots: requestedScanRoots, rules: [rule] }));
  const batches = [...matchedBatches, ...fallbackBatches];
  return Effect.all(
    batches.map((batch) => runSourcePatternCheckBatchEffect(batch.rules, batch.scanRoots, options)),
    { concurrency: 2 }
  ).pipe(Effect.map((batchOutcomes) => mergeBatchOutcomes(selectedRules, batchOutcomes)));
}

function runSourcePatternCheckBatchEffect(
  selectedRules: readonly RuleSourceFacts[],
  scanRoots: readonly string[],
  options: {
    repoRoot: string;
    grit: GritProviderService;
    cacheMode?: GritCheckCacheMode;
    requireObservableCacheStatus?: boolean;
    diagnostics?: GritDiagnosticOptions;
  }
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
          {
            kind: "scan-root-refused" as const,
            entry: diagnosticCatalogEntryFromRuleSourceFacts(rule),
            decision: scanRootDecision,
            detail: renderDiagnosticScanRootRefusal(scanRootDecision),
          },
        ])
      )
    );
  }

  return runGritCheckWithScopedConfigEffect(selectedRules, scanRoots, {
    ...options,
    outputFormat: "json",
  }).pipe(
    Effect.match({
      onFailure: () =>
        providerFailedOutcomes(
          selectedRules,
          "GritToolUnavailable",
          "Grit scoped configuration or execution failed."
        ),
      onSuccess: (acquisition) => {
        if (acquisition.kind === "parsed") {
          return gritDiagnosticOutcomesFromReport(
            selectedRules,
            acquisition.report,
            options.diagnostics
          );
        }
        if (acquisition.kind === "scan-root-refused") {
          return new Map(
            selectedRules.map((rule) => [
              rule.id,
              {
                kind: "scan-root-refused" as const,
                entry: diagnosticCatalogEntryFromRuleSourceFacts(rule),
                decision: acquisition.decision,
                detail: acquisition.message,
              },
            ])
          );
        }
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
        return providerFailedOutcomes(selectedRules, acquisition.failure, acquisition.message);
      },
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
  const diagnostics = outcomes.flatMap((outcome) =>
    outcome.kind === "findings" ? [...outcome.diagnostics] : []
  );
  const entry = diagnosticCatalogEntryFromRuleSourceFacts(rule);
  return diagnostics.length > 0
    ? {
        kind: "findings",
        entry,
        diagnostics: diagnostics as [DiagnosticFinding, ...DiagnosticFinding[]],
      }
    : { kind: "clean", entry, diagnostics: [] };
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

function providerFailedOutcomes(
  selectedRules: readonly RuleSourceFacts[],
  failure: DiagnosticProviderFailureKind,
  detail: string
): Map<string, DiagnosticRunOutcome> {
  return new Map(
    selectedRules.map((rule) => [
      rule.id,
      {
        kind: "provider-failed" as const,
        entry: diagnosticCatalogEntryFromRuleSourceFacts(rule),
        failure,
        detail,
      },
    ])
  );
}
