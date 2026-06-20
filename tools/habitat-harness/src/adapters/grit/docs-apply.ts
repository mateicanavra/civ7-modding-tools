import { mkdirSync } from "node:fs";
import path from "node:path";
import { Effect, type Layer } from "effect";
import {
  type DiagnosticRunOutcome,
  diagnosticCatalogEntryFromNativeRule,
  renderDiagnosticScanRootRefusal,
} from "../../lib/diagnostic-catalog/index.js";
import { runHabitatEffect } from "../../lib/effect-runtime.js";
import { gritMachineOutputEnv } from "../../lib/grit-env.js";
import {
  type HabitatCommandResult,
  HabitatProcess,
  HabitatProcessLive,
  type HabitatProcessRequest,
} from "../../lib/habitat-process.js";
import { repoRoot } from "../../lib/paths.js";
import type { RuleRunResult } from "../../rules/architecture.js";
import type { RulePatternFacts } from "../../rules/registry/index.js";
import {
  defaultGritCommandTimeoutMs,
  docsLocalCheckoutPathsRewritePattern,
  gritBin,
} from "./constants.js";
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
    processLayer?: Layer.Layer<HabitatProcess>;
  }
): Promise<Map<string, RuleRunResult>> {
  const outcomes = await runDocsApplyBackedDiagnosticOutcomes(selectedRules, options);
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
    processLayer?: Layer.Layer<HabitatProcess>;
  }
): Promise<Map<string, DiagnosticRunOutcome>> {
  if (selectedRules.length === 0) return new Map();
  const scanRoots = selectedScanRootsForRules(selectedRules, options.scanRoots);
  const scanRootDecision = decidePatternScanRoots(scanRoots, {
    allowDocsRoot: true,
    approvedScanRoots: selectedRules.flatMap((rule) => rule.scanRoots),
  });
  if (scanRootDecision.kind === "refused") {
    return new Map(
      selectedRules.map((rule) => [
        rule.id,
        {
          kind: "scan-root-refused",
          entry: nativeDiagnosticEntry(rule),
          decision: scanRootDecision,
          detail: renderDiagnosticScanRootRefusal(scanRootDecision),
        },
      ])
    );
  }

  let commandResult: HabitatCommandResult;
  try {
    commandResult = await runHabitatEffect(
      docsApplyDryRunProgram(scanRoots).pipe(
        Effect.provide(options.processLayer ?? HabitatProcessLive)
      )
    );
  } catch (error) {
    return new Map(
      selectedRules.map((rule) => [
        rule.id,
        {
          kind: "adapter-failed",
          entry: nativeDiagnosticEntry(rule),
          failure: "GritToolUnavailable",
          detail: error instanceof Error ? error.message : "Grit executable unavailable.",
        },
      ])
    );
  }
  if (commandResult.exit.code !== 0 || commandResult.exit.interrupted) {
    return new Map(
      selectedRules.map((rule) => [
        rule.id,
        {
          kind: "adapter-failed",
          entry: nativeDiagnosticEntry(rule),
          failure: "GritCommandFailed",
          detail: `Grit docs rewrite dry-run exited ${commandResult.exit.code}.`,
        },
      ])
    );
  }

  const findingPaths = parseGritApplyDryRunPaths(commandResult.stdout.text);
  return new Map(
    selectedRules.map((rule) => [
      rule.id,
      findingPaths.length > 0
        ? {
            kind: "findings",
            entry: nativeDiagnosticEntry(rule),
            diagnostics: findingPaths.map((filePath) => ({
              kind: "diagnostic-finding",
              ruleId: rule.id,
              path: filePath,
              message: rule.message,
              severity: rule.lane === "advisory" ? ("advisory" as const) : ("error" as const),
              baselineState: "unbaselined",
            })),
          }
        : {
            kind: "clean",
            entry: nativeDiagnosticEntry(rule),
            diagnostics: [],
          },
    ])
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
      const process = yield* HabitatProcess;
      return yield* process.run(docsApplyDryRunRequest(scanRoots));
    })
  );
}

function docsApplyDryRunRequest(scanRoots: readonly string[]): HabitatProcessRequest {
  const cacheDir = path.join(repoRoot, ".habitat", "cache", "patterns");
  mkdirSync(cacheDir, { recursive: true });
  return {
    commandId: "docs-apply-dry-run",
    kind: "pattern-apply",
    executable: gritBin,
    argv: [
      "apply",
      docsLocalCheckoutPathsRewritePattern,
      ...scanRoots,
      "--dry-run",
      "--force",
      "--output",
      "standard",
    ],
    cwd: repoRoot,
    timeoutMs: defaultGritCommandTimeoutMs,
    env: {
      ...gritMachineOutputEnv,
      GRIT_CACHE_DIR: cacheDir,
      GRIT_TELEMETRY_DISABLED: "true",
    },
    scanRoots,
    cachePolicy: {
      mode: "isolated",
      cacheDir,
      observableStatus: "unknown",
    },
  };
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
