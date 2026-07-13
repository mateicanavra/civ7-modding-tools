import {
  type CheckOptions,
  dependencyRefusalDiagnostic,
} from "@habitat/cli/service/model/check/index";
import type { RuleDiagnosticExecutionResult } from "@habitat/cli/service/model/diagnostics/policy/rule-runtime/architecture.policy";
import type { RuleSourceFacts } from "@habitat/cli/service/model/rules/index";
import {
  approvedSourceScanRootsForRules,
  runSourceRulesEffect,
  stagedSourceScanRoots,
} from "@habitat/cli/service/model/source-check/index";
import { Clock, Effect, Match } from "effect";
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
          exitCode: 0,
          diagnostics: [],
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

    const gritResults = yield* context.ruleDiagnostics.runRules(gritRules, {
      repoRoot: context.repoRoot,
      ...(scanRoots ? { scanRoots } : {}),
    });
    for (const rule of gritRules) {
      const execution = gritResults.get(rule.id);
      if (execution) {
        results.set(rule.id, ruleDiagnosticExecutionRecord(rule, execution));
      }
    }
  });
}

export function ruleDiagnosticExecutionRecord(
  rule: RuleSourceFacts,
  execution: RuleDiagnosticExecutionResult
): RuleExecutionRecord {
  const result = Match.value(execution.disposition).pipe(
    Match.when({ kind: "refused" }, ({ detail }) => ({
      exitCode: 1,
      diagnostics: [dependencyRefusalDiagnostic(rule, detail)],
    })),
    Match.orElse(() => execution.result)
  );
  return {
    result,
    durationMs: execution.durationMs,
    disposition: ruleDiagnosticDisposition(execution),
  };
}

function ruleDiagnosticDisposition(
  execution: RuleDiagnosticExecutionResult
): RuleExecutionRecord["disposition"] {
  return Match.value(execution.disposition).pipe(
    Match.when({ kind: "executed" }, () => ({
      kind: "executed" as const,
      durationMs: execution.durationMs,
    })),
    Match.when({ kind: "not-applicable" }, ({ reason }) => ({
      kind: "not-applicable" as const,
      reason,
    })),
    Match.when({ kind: "refused" }, ({ decision, detail }) => ({
      kind: "dependency-refused" as const,
      source: "diagnostic-scan-root" as const,
      decision,
      detail,
    })),
    Match.when({ kind: "failed" }, ({ failure, detail }) => ({
      kind: "execution-failed" as const,
      source: "diagnostic-provider" as const,
      failure,
      detail,
    })),
    Match.exhaustive
  );
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
