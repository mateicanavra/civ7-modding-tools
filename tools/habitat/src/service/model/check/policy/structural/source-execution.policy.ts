import {
  type CheckOptions,
  notApplicableDiagnostic,
} from "@habitat/cli/service/model/check/index";
import type { RuleSourceFacts } from "@habitat/cli/service/model/rules/index";
import {
  approvedSourceScanRootsForRules,
  runSourceRulesEffect,
  stagedSourceScanRoots,
} from "@habitat/cli/service/model/source-check/index";
import { Clock, Effect } from "effect";
import type { RuleExecutionRecord, StructuralExecutionContext } from "./context.policy.js";

export function stagedSourceCheckNotApplicableRecords(
  sourceRules: readonly RuleSourceFacts[],
  scanRoots: readonly string[]
): Map<string, RuleExecutionRecord> | undefined {
  if (scanRoots.length > 0) return undefined;
  return new Map(
    sourceRules.map((rule) => [
      rule.id,
      {
        result: {
          exitCode: 1,
          diagnostics: [notApplicableDiagnostic(rule, "staged-scope-no-approved-roots")],
        },
        durationMs: 0,
        disposition: { kind: "not-applicable", reason: "staged-scope-no-approved-roots" },
      },
    ])
  );
}

export function executeNativeSourceRulesEffect(
  sourceRules: readonly RuleSourceFacts[],
  results: Map<string, RuleExecutionRecord>,
  options: Pick<CheckOptions, "staged" | "stagedPaths">,
  context: StructuralExecutionContext,
  currentStagedPaths: () => Effect.Effect<readonly string[], never, any>
): Effect.Effect<void, never, any> {
  if (sourceRules.length === 0) return Effect.void;
  return Effect.gen(function* () {
    const scanRoots = options.staged
      ? stagedSourceScanRoots(
          options.stagedPaths ?? (yield* currentStagedPaths()),
          approvedSourceScanRootsForRules(sourceRules),
          sourceScopeContext(context)
        )
      : undefined;
    const stagedNotApplicable =
      options.staged && scanRoots
        ? stagedSourceCheckNotApplicableRecords(sourceRules, scanRoots)
        : undefined;
    if (stagedNotApplicable) {
      for (const [ruleId, record] of stagedNotApplicable) results.set(ruleId, record);
      return;
    }

    const started = yield* Clock.currentTimeMillis;
    const sourceResults = yield* runSourceRulesEffect(sourceRules, {
      fileSystem: context.sourceFileSystem,
      repoRoot: context.repoRoot,
      ...(scanRoots ? { scanRoots } : {}),
    });
    const durationMs = Math.max(0, (yield* Clock.currentTimeMillis) - started);
    for (const rule of sourceRules) {
      const result = sourceResults.get(rule.id);
      if (result) {
        results.set(rule.id, {
          result,
          durationMs,
          timing: sharedExecutionTiming("source-check:source-rules", durationMs, sourceRules),
          disposition: { kind: "executed", durationMs },
        });
      }
    }
  });
}

export function executeGritSourceRulesEffect(
  gritRules: readonly RuleSourceFacts[],
  results: Map<string, RuleExecutionRecord>,
  options: Pick<CheckOptions, "staged" | "stagedPaths">,
  context: StructuralExecutionContext,
  currentStagedPaths: () => Effect.Effect<readonly string[], never, any>
): Effect.Effect<void, never, any> {
  if (gritRules.length === 0) return Effect.void;
  return Effect.gen(function* () {
    const scanRoots = options.staged
      ? stagedSourceScanRoots(
          options.stagedPaths ?? (yield* currentStagedPaths()),
          approvedSourceScanRootsForRules(gritRules),
          sourceScopeContext(context)
        )
      : undefined;
    const stagedNotApplicable =
      options.staged && scanRoots
        ? stagedSourceCheckNotApplicableRecords(gritRules, scanRoots)
        : undefined;
    if (stagedNotApplicable) {
      for (const [ruleId, record] of stagedNotApplicable) results.set(ruleId, record);
      return;
    }

    const started = yield* Clock.currentTimeMillis;
    const gritResults = yield* context.grit.runRules(gritRules, {
      repoRoot: context.repoRoot,
      ...(scanRoots ? { scanRoots } : {}),
    });
    const durationMs = Math.max(0, (yield* Clock.currentTimeMillis) - started);
    for (const rule of gritRules) {
      const result = gritResults.get(rule.id);
      if (result) {
        results.set(rule.id, {
          result,
          durationMs,
          timing: sharedExecutionTiming("grit-check:rules", durationMs, gritRules),
          disposition: { kind: "executed", durationMs },
        });
      }
    }
  });
}

function sourceScopeContext(context: StructuralExecutionContext): {
  readonly repoRoot: string;
} {
  return { repoRoot: context.repoRoot };
}

function sharedExecutionTiming(
  groupId: string,
  durationMs: number,
  rules: readonly { id: string }[]
): RuleExecutionRecord["timing"] | undefined {
  if (rules.length < 2) return undefined;
  return {
    kind: "shared",
    groupId,
    durationMs,
    ruleCount: rules.length,
  };
}
