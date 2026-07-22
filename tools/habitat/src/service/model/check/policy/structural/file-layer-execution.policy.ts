import path from "node:path";
import type { HabitatCommandResult } from "@habitat/cli/resources/command/index";
import { renderHabitatError } from "@habitat/cli/resources/errors/index";
import type { CheckOptions, HabitatDiagnostic } from "@habitat/cli/service/model/check/index";
import {
  modifiedStagedPaths,
  runFileLayerProtectedMutationRule,
  type StagedMutationPath,
  stagedPathsFromNameStatus,
} from "@habitat/cli/service/model/host/index";
import type { RuleFileLayerFacts } from "@habitat/cli/service/model/rules/index";
import { Clock, Effect, Either, Match } from "effect";
import type {
  RuleExecutionRecord,
  StructuralExecutionContext,
  StructuralGitPort,
} from "./context.policy.js";

type FileLayerCheckOptions = Pick<CheckOptions, "staged" | "stagedPaths">;
type StagedPathActionReadResult = StagedMutationPath[] | { ok: false; message: string };

export const executeFileLayerRulesEffect = Effect.fn("habitat.check.executeFileLayerRules")(
  function* (
    fileLayerRules: readonly RuleFileLayerFacts[],
    results: Map<string, RuleExecutionRecord>,
    options: FileLayerCheckOptions,
    context: Pick<StructuralExecutionContext, "git" | "repoRoot">
  ) {
    const stagedPathsResult = yield* stagedPathActionsForOptionsEffect(options, context);
    const records = yield* Effect.forEach(fileLayerRules, (rule) =>
      executeFileLayerRuleEffect(rule, options, stagedPathsResult)
    );
    for (const [ruleId, record] of records) results.set(ruleId, record);
  }
);

const stagedPathActionsForOptionsEffect = Effect.fn("habitat.check.stagedPathActionsForOptions")(
  function* (
    options: FileLayerCheckOptions,
    context: Pick<StructuralExecutionContext, "git" | "repoRoot">
  ) {
    return yield* Match.value(options.staged === true).pipe(
      Match.when(false, () => Effect.succeed(undefined)),
      Match.when(true, () => stagedPathActionsForStagedCheckEffect(options, context)),
      Match.exhaustive
    );
  }
);

const stagedPathActionsForStagedCheckEffect = Effect.fn(
  "habitat.check.stagedPathActionsForStagedCheck"
)(function* (
  options: FileLayerCheckOptions,
  context: Pick<StructuralExecutionContext, "git" | "repoRoot">
) {
  return yield* Match.value(options.stagedPaths).pipe(
    Match.when(Match.undefined, () => currentStagedPathActionsEffect(context)),
    Match.orElse((stagedPaths) => Effect.succeed(modifiedStagedPaths(stagedPaths)))
  );
});

const executeFileLayerRuleEffect = Effect.fn("habitat.check.executeFileLayerRule")(function* (
  rule: RuleFileLayerFacts,
  options: FileLayerCheckOptions,
  stagedPathsResult: StagedPathActionReadResult | undefined
) {
  const started = yield* Clock.currentTimeMillis;
  return yield* Match.value(stagedPathsResult).pipe(
    Match.when(isStagedPathReadFailure, (failure) =>
      stagedPathReadFailureRecordEffect(rule, failure.message, started)
    ),
    Match.orElse((stagedPaths) => fileLayerRuleRecordEffect(rule, options, stagedPaths, started))
  );
});

const stagedPathReadFailureRecordEffect = Effect.fn("habitat.check.stagedPathReadFailureRecord")(
  function* (rule: RuleFileLayerFacts, message: string, started: number) {
    const durationMs = Math.max(0, (yield* Clock.currentTimeMillis) - started);
    const record: RuleExecutionRecord = {
      result: {
        exitCode: 1,
        diagnostics: [stagedPathReadFailureDiagnostic(rule, message)],
      },
      durationMs,
      disposition: { kind: "executed", durationMs },
    };
    return [rule.id, record] as const;
  }
);

const fileLayerRuleRecordEffect = Effect.fn("habitat.check.fileLayerRuleRecord")(function* (
  rule: RuleFileLayerFacts,
  options: FileLayerCheckOptions,
  stagedPaths: StagedMutationPath[] | undefined,
  started: number
) {
  const input = Match.value(stagedPaths).pipe(
    Match.when(Match.undefined, () => ({ staged: options.staged })),
    Match.orElse((paths) => ({ staged: options.staged, stagedPaths: paths }))
  );
  const result = runFileLayerProtectedMutationRule(rule, input);
  const durationMs = Math.max(0, (yield* Clock.currentTimeMillis) - started);
  const record: RuleExecutionRecord = {
    result,
    durationMs,
    disposition: { kind: "executed", durationMs },
  };
  return [rule.id, record] as const;
});

export const currentStagedPathsEffect = Effect.fn("habitat.check.currentStagedPaths")(
  function* (context: { readonly repoRoot: string; readonly git: StructuralGitPort }) {
    const result = yield* context.git
      .diffNameOnly({ cached: true, cwd: context.repoRoot })
      .pipe(Effect.either);
    return Either.match(result, {
      onLeft: () => [],
      onRight: (commandResult) => stagedPathsFromCommandResult(context, commandResult),
    });
  }
);

function stagedPathsFromCommandResult(
  context: { readonly repoRoot: string },
  result: HabitatCommandResult
): string[] {
  const failed = result.exit.code !== 0 || result.stdout.text.length === 0;
  return Match.value(failed).pipe(
    Match.when(true, () => []),
    Match.when(false, () =>
      result.stdout.text
        .split("\0")
        .filter(Boolean)
        .map((candidate) => toRepoRelative(context, candidate))
    ),
    Match.exhaustive
  );
}

function isStagedPathReadFailure(
  result: StagedPathActionReadResult | undefined
): result is { ok: false; message: string } {
  return Boolean(result && "ok" in result && !result.ok);
}

const currentStagedPathActionsEffect = Effect.fn("habitat.check.currentStagedPathActions")(
  function* (context: { readonly repoRoot: string; readonly git: StructuralGitPort }) {
    const result = yield* context.git
      .diffNameStatus({ cached: true, cwd: context.repoRoot })
      .pipe(Effect.either);
    return Either.match(result, {
      onLeft: (error) => ({ ok: false as const, message: renderHabitatError(error) }),
      onRight: stagedPathActionsFromCommandResult,
    });
  }
);

function stagedPathActionsFromCommandResult(
  result: HabitatCommandResult
): StagedPathActionReadResult {
  return Match.value(result.exit.code === 0).pipe(
    Match.when(false, () => ({
      ok: false as const,
      message:
        result.stderr.text.trim() ||
        `Unable to read staged path actions with git diff --cached --name-status -z (exit ${result.exit.code}).`,
    })),
    Match.when(true, () => successfulStagedPathActions(result.stdout.text)),
    Match.exhaustive
  );
}

function successfulStagedPathActions(stdout: string): StagedMutationPath[] {
  return Match.value(stdout.length === 0).pipe(
    Match.when(true, () => []),
    Match.when(false, () => stagedPathsFromNameStatus(stdout)),
    Match.exhaustive
  );
}

function stagedPathReadFailureDiagnostic(
  rule: RuleFileLayerFacts,
  detail: string
): HabitatDiagnostic {
  return {
    ruleId: rule.id,
    path: ".",
    message: `Unable to read staged path actions for protected-zone checks. ${detail}`,
    severity: "error",
    baselined: false,
  };
}

function toRepoRelative(context: { readonly repoRoot: string }, candidate: string): string {
  return path
    .relative(context.repoRoot, path.resolve(context.repoRoot, candidate))
    .split(path.sep)
    .join("/");
}
