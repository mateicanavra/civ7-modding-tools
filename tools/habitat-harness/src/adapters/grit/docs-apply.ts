import { Effect, type Layer } from "effect";
import {
  type DiagnosticRunOutcome,
  diagnosticCatalogEntryFromNativeRule,
  renderDiagnosticScanRootRefusal,
} from "../../domains/diagnostic-pattern-catalog/index.js";
import type { RulePatternFacts } from "../../domains/rule-registry/index.js";
import { runHabitatEffect } from "../../lib/effect-runtime.js";
import { docsLocalCheckoutPathsRewritePattern } from "../../providers/grit/constants.js";
import { GritProvider, type GritProviderRequirements } from "../../providers/grit/index.js";
import type { RuleRunResult } from "../../rules/architecture.js";
import { infrastructureFailure } from "./failure.js";
import {
  decidePatternScanRoots,
  normalizeGritPath,
  selectedScanRootsForRules,
  sortedUnique,
} from "./scan-roots/index.js";

export async function runDocsApplyBackedGritRules(
  selectedRules: readonly RulePatternFacts[],
  options: {
    scanRoots?: readonly string[];
    providerLayer?: Layer.Layer<GritProvider>;
  }
): Promise<Map<string, RuleRunResult>> {
  const outcomes = await runHabitatEffect(
    options.providerLayer
      ? runDocsApplyBackedDiagnosticOutcomesEffect(selectedRules, options).pipe(
          Effect.provide(options.providerLayer)
        )
      : runDocsApplyBackedDiagnosticOutcomesEffect(selectedRules, options)
  );
  return new Map(
    selectedRules.map((rule) => {
      const outcome = outcomes.get(rule.id);
      if (!outcome) return [rule.id, infrastructureFailure(rule, "GritPatternMatchMissing")];
      switch (outcome.kind) {
        case "clean":
          return [rule.id, { exitCode: 0, diagnostics: [] }];
        case "findings":
          return [
            rule.id,
            {
              exitCode: 1,
              diagnostics: outcome.diagnostics.map((diagnostic) => ({
                ruleId: diagnostic.ruleId,
                path: diagnostic.path,
                line: diagnostic.line,
                message: diagnostic.message,
                severity: diagnostic.severity,
                baselined: diagnostic.baselineState !== "unbaselined",
              })),
            },
          ];
        case "scan-root-refused":
          return [rule.id, infrastructureFailure(rule, "GritEmptyScanRoots", outcome.detail)];
        case "adapter-failed":
          return [rule.id, infrastructureFailure(rule, outcome.failure, outcome.detail)];
        case "cache-observation-missing":
          return [rule.id, infrastructureFailure(rule, outcome.failure, outcome.detail)];
        case "identity-missing":
          return [rule.id, infrastructureFailure(rule, "GritPatternMatchMissing")];
        case "unexpected-diagnostic-identity":
          return [rule.id, infrastructureFailure(rule, "GritUnexpectedDiagnosticIdentity")];
      }
    })
  );
}

export async function runDocsApplyBackedDiagnosticOutcomes(
  selectedRules: readonly RulePatternFacts[],
  options: {
    scanRoots?: readonly string[];
    providerLayer?: Layer.Layer<GritProvider>;
  }
): Promise<Map<string, DiagnosticRunOutcome>> {
  return runHabitatEffect(
    options.providerLayer
      ? runDocsApplyBackedDiagnosticOutcomesEffect(selectedRules, options).pipe(
          Effect.provide(options.providerLayer)
        )
      : runDocsApplyBackedDiagnosticOutcomesEffect(selectedRules, options)
  );
}

export function runDocsApplyBackedDiagnosticOutcomesEffect(
  selectedRules: readonly RulePatternFacts[],
  options: {
    scanRoots?: readonly string[];
  } = {}
): Effect.Effect<
  Map<string, DiagnosticRunOutcome>,
  never,
  GritProvider | GritProviderRequirements
> {
  if (selectedRules.length === 0) return Effect.succeed(new Map<string, DiagnosticRunOutcome>());
  const scanRoots = selectedScanRootsForRules(selectedRules, options.scanRoots);
  const scanRootDecision = decidePatternScanRoots(scanRoots, {
    allowDocsRoot: true,
    approvedScanRoots: selectedRules.flatMap((rule) => rule.scanRoots),
  });
  if (scanRootDecision.kind === "refused") {
    return Effect.succeed(
      new Map(
        selectedRules.map((rule) => [
          rule.id,
          {
            kind: "scan-root-refused",
            entry: nativeDiagnosticEntry(rule),
            decision: scanRootDecision,
            detail: renderDiagnosticScanRootRefusal(scanRootDecision),
          },
        ])
      )
    );
  }

  return docsApplyDryRunProgram(scanRoots).pipe(
    Effect.match({
      onFailure: (error) =>
        adapterFailedOutcomes(
          selectedRules,
          "GritToolUnavailable",
          error instanceof Error ? error.message : "Grit executable unavailable."
        ),
      onSuccess: (commandResult) => {
        if (commandResult.exit.code !== 0 || commandResult.exit.interrupted) {
          return adapterFailedOutcomes(
            selectedRules,
            "GritCommandFailed",
            `Grit docs rewrite dry-run exited ${commandResult.exit.code}.`
          );
        }
        const findingPaths = parseGritApplyDryRunPaths(commandResult.stdout.text);
        return new Map(
          selectedRules.map((rule) => [
            rule.id,
            findingPaths.length > 0
              ? {
                  kind: "findings" as const,
                  entry: nativeDiagnosticEntry(rule),
                  diagnostics: findingPaths.map((filePath) => ({
                    kind: "diagnostic-finding" as const,
                    ruleId: rule.id,
                    path: filePath,
                    message: rule.message,
                    severity: rule.lane === "advisory" ? ("advisory" as const) : ("error" as const),
                    baselineState: "unbaselined" as const,
                  })),
                }
              : {
                  kind: "clean" as const,
                  entry: nativeDiagnosticEntry(rule),
                  diagnostics: [],
                },
          ])
        );
      },
    })
  );
}

function nativeDiagnosticEntry(rule: RulePatternFacts) {
  return diagnosticCatalogEntryFromNativeRule({
    ruleId: rule.id,
    nativeDiagnosticIdentity: "docs-local-checkout-paths",
  });
}

function docsApplyDryRunProgram(scanRoots: readonly string[]) {
  return Effect.scoped(
    Effect.gen(function* () {
      const grit = yield* GritProvider;
      return yield* grit.applyDryRun({
        commandId: "docs-apply-dry-run",
        patternPath: docsLocalCheckoutPathsRewritePattern,
        scanRoots,
        output: "standard",
        cacheMode: "isolated",
      });
    })
  );
}

function adapterFailedOutcomes(
  selectedRules: readonly RulePatternFacts[],
  failure: "GritToolUnavailable" | "GritCommandFailed",
  detail: string
): Map<string, DiagnosticRunOutcome> {
  return new Map(
    selectedRules.map((rule) => [
      rule.id,
      {
        kind: "adapter-failed",
        entry: nativeDiagnosticEntry(rule),
        failure,
        detail,
      },
    ])
  );
}

function parseGritApplyDryRunPaths(stdout: string): string[] {
  const changedPaths: string[] = [];
  let currentPath: string | null = null;
  let sawRewriteLine = false;

  for (const line of stdout.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith("Processed ") || trimmed.startsWith("Skipped ")) continue;
    if (trimmed.endsWith(".md") && !trimmed.includes(": ERROR ")) {
      if (currentPath && sawRewriteLine) changedPaths.push(normalizeGritPath(currentPath));
      currentPath = trimmed;
      sawRewriteLine = false;
      continue;
    }
    if (currentPath && (trimmed.startsWith("-") || trimmed.startsWith("+"))) {
      sawRewriteLine = true;
    }
  }
  if (currentPath && sawRewriteLine) changedPaths.push(normalizeGritPath(currentPath));
  return sortedUnique(changedPaths);
}
