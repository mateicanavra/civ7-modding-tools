import {
  type DiagnosticRunOutcome,
  diagnosticCatalogEntryFromNativeRule,
  renderDiagnosticScanRootRefusal,
} from "@internal/habitat-harness/service/model/check/index";
import type { RuleSourceFacts } from "@internal/habitat-harness/service/model/rules/registry/index";
import { Effect } from "effect";
import { docsLocalCheckoutPathsRewritePattern } from "./constants.js";
import { GritProvider, type GritProviderRequirements } from "./resource.js";
import {
  decidePatternScanRoots,
  normalizeGritPath,
  selectedScanRootsForRules,
  sortedUnique,
} from "./scan-roots/index.js";

export function runDocsApplyBackedDiagnosticOutcomesEffect(
  selectedRules: readonly RuleSourceFacts[],
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
        providerFailedOutcomes(
          selectedRules,
          "GritToolUnavailable",
          error instanceof Error ? error.message : "Grit executable unavailable."
        ),
      onSuccess: (commandResult) => {
        if (commandResult.exit.code !== 0 || commandResult.exit.interrupted) {
          return providerFailedOutcomes(
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

function nativeDiagnosticEntry(rule: RuleSourceFacts) {
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

function providerFailedOutcomes(
  selectedRules: readonly RuleSourceFacts[],
  failure: "GritToolUnavailable" | "GritCommandFailed",
  detail: string
): Map<string, DiagnosticRunOutcome> {
  return new Map(
    selectedRules.map((rule) => [
      rule.id,
      {
        kind: "provider-failed",
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
