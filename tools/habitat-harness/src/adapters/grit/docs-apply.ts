import { mkdirSync } from "node:fs";
import path from "node:path";
import { Effect, type Layer } from "effect";
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
import type { RuleGritFacts } from "../../rules/registry/index.js";
import { docsLocalCheckoutPathsRewritePattern, gritBin } from "./constants.js";
import { infrastructureFailure } from "./failure.js";
import {
  normalizeGritPath,
  selectedScanRootsForRules,
  sortedUnique,
  validateScanRoots,
} from "./scan-roots/index.js";

export async function runDocsApplyBackedGritRules(
  selectedRules: readonly RuleGritFacts[],
  options: {
    scanRoots?: readonly string[];
    processLayer?: Layer.Layer<HabitatProcess>;
  }
): Promise<Map<string, RuleRunResult>> {
  if (selectedRules.length === 0) return new Map();
  const scanRoots = selectedScanRootsForRules(selectedRules, options.scanRoots);
  const emptyRootFailure = validateScanRoots(scanRoots, {
    allowDocsRoot: true,
    approvedScanRoots: selectedRules.flatMap((rule) => rule.scanRoots),
  });
  if (emptyRootFailure) {
    return new Map(
      selectedRules.map((rule) => [
        rule.id,
        infrastructureFailure(rule, "GritEmptyScanRoots", emptyRootFailure),
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
        infrastructureFailure(
          rule,
          "GritToolUnavailable",
          error instanceof Error ? error.message : "Grit executable unavailable."
        ),
      ])
    );
  }
  if (commandResult.exit.code !== 0 || commandResult.exit.interrupted) {
    return new Map(
      selectedRules.map((rule) => [
        rule.id,
        infrastructureFailure(
          rule,
          "GritCommandFailed",
          `Grit docs rewrite dry-run exited ${commandResult.exit.code}.`
        ),
      ])
    );
  }

  const findingPaths = parseGritApplyDryRunPaths(commandResult.stdout.text);
  return new Map(
    selectedRules.map((rule) => [
      rule.id,
      {
        exitCode: findingPaths.length > 0 ? 1 : 0,
        diagnostics: findingPaths.map((filePath) => ({
          ruleId: rule.id,
          path: filePath,
          message: rule.message,
          severity: rule.lane === "advisory" ? ("advisory" as const) : ("error" as const),
          baselined: false,
        })),
      },
    ])
  );
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
  const cacheDir = path.join(repoRoot, ".grit", "cache");
  mkdirSync(cacheDir, { recursive: true });
  return {
    commandId: "grit-docs-apply-dry-run",
    kind: "grit-apply",
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
    nonClaims: ["not-apply-transaction", "not-product-runtime"],
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
