import path from "node:path";
import {
  type SpawnResult,
  spawnResultFromCommandProviderError,
  spawnResultFromCommandResult,
} from "@habitat/cli/resources/command/index";
import {
  type CheckReport,
  checkCommandContext,
  hookCheckSummary,
  renderCheckReport,
} from "@habitat/cli/service/model/check/index";
import { factsForRuleIds } from "@habitat/cli/service/model/rules/policy/catalog.policy";
import {
  approvedSourceScanRootsForRules,
  stagedSourceCheckPaths,
} from "@habitat/cli/service/model/source-check/index";
import { Effect, Match, Option } from "effect";
import { correlateHookCheckReport, type HookCheckCommandResult } from "./check-command.policy.js";
import { finalizePreCommitEffect } from "./lifecycle.policy.js";
import type {
  HookBiomeCommandRequest,
  HookNxAffectedRequest,
  HookNxRunManyRequest,
  HookOutput,
  HookProcedureContext,
  PreCommitBiomeState,
  PreCommitSourceCheckState,
  PreCommitState,
  PreCommitStep,
  PrePushBaseDecision,
  PrePushChangedPathsResult,
  PrePushHookSourceCheckResult,
  StagedHookCheckPhase,
  StagedHookCheckResult,
} from "./procedure-context.policy.js";
import { renderLocalHookNotice } from "./procedure-context.policy.js";
import {
  renderResourceDecisionFailure,
  resourceDecisionToFacade,
} from "./resource-decision.policy.js";
import { classifyResourcePreCommitDecisionEffect } from "./resource-inspection.policy.js";
import { createHookOutput, type HookResourcePolicy, section } from "./runtime.policy.js";
import {
  biomeHookPaths,
  existingStagedPathsEffect,
  gitAddEffect,
  hookSourceCheckPaths,
  unstagedAmongEffect,
} from "./staged-worktree.policy.js";

export function hookResult(output: HookOutput, exitCode: number) {
  return output.flush().pipe(Effect.map(() => ({ exitCode, ...output.result() })));
}

export function beginPreCommit(context: HookProcedureContext, resourcePolicy?: HookResourcePolicy) {
  const output = createHookOutput(context.reporter);
  output.writeStdout("habitat hook pre-commit\n");
  output.writeStdout(renderLocalHookNotice());

  return classifyResourcePreCommitDecisionEffect(context, resourcePolicy).pipe(
    Effect.flatMap((resourceDecision) => {
      const resources = resourceDecisionToFacade(resourceDecision);
      output.writeStdout(`resources: ${resources.kind}\n`);
      return Effect.if(resources.allowPreCommit, {
        onFalse: () => {
          output.writeStderr(renderResourceDecisionFailure(resourceDecision));
          return Effect.map(hookResult(output, 1), (result) => ({
            kind: "done" as const,
            outcome: "resource-blocked" as const,
            result,
          }));
        },
        onTrue: () =>
          Effect.gen(function* () {
            const staged = yield* existingStagedPathsEffect(
              context.git,
              context.platform.repoRoot,
              context.platform.pathExists
            );
            return {
              kind: "continue" as const,
              state: { context, resourcePolicy, output, staged },
            };
          }),
      });
    })
  );
}

export const continuePreCommitAfterFileLayer = Effect.fn("hook.preCommit.continueAfterFileLayer")(
  function* (state: PreCommitState, fileLayer: StagedHookCheckResult) {
    const { output } = state;
    output.writeStdout(section("file-layer staged check", fileLayer.stdout));
    output.writeStderr(fileLayer.stderr);
    const fileLayerCheck = stagedHookCheckCommandResult(fileLayer);
    const parseFailureMessage = Match.value(fileLayerCheck.kind).pipe(
      Match.when("parsed", () => ""),
      Match.orElse(() => "habitat hook pre-commit: could not parse file-layer check JSON.\n")
    );
    const failedExitCode = Match.value(fileLayer.exitCode).pipe(
      Match.when(0, () => 1),
      Match.orElse((exitCode) => exitCode)
    );
    return yield* Effect.if(checkSummaryAllowsNextStage(fileLayerCheck), {
      onFalse: () => {
        output.writeStderr(parseFailureMessage);
        return Effect.map(hookResult(output, failedExitCode), (result) => ({
          kind: "done" as const,
          outcome: "file-layer-failed" as const,
          result,
        }));
      },
      onTrue: () => preparePreCommitBiomeState(state),
    });
  }
);

const preparePreCommitBiomeState = Effect.fn("hook.preCommit.prepareBiomeState")(function* (
  state: PreCommitState
) {
  const { context, output, staged } = state;
  const biomePaths = biomeHookPaths(staged);
  const partials = yield* unstagedAmongEffect(context.git, context.platform.repoRoot, biomePaths);
  const beforeHashes = new Map(
    biomePaths.map((candidate) => [candidate, hashRepoRelativeFile(context, candidate)])
  );
  return yield* Effect.if(partials.length > 0, {
    onFalse: () =>
      Effect.succeed({
        kind: "continue" as const,
        state: { ...state, biomePaths, beforeHashes },
      }),
    onTrue: () => {
      output.writeStderr(
        [
          "habitat hook pre-commit: refusing to format partially staged files.",
          "Stage or unstage each whole file before committing; Habitat does not stash or rewrite unstaged hunks.",
          ...partials.map((file) => `- ${file}`),
          "",
        ].join("\n")
      );
      return Effect.map(hookResult(output, 1), (result) => ({
        kind: "done" as const,
        outcome: "partial-staging-refused" as const,
        result,
      }));
    },
  });
});

export const preCommitBiomeProviderStep = Effect.fn("hook.preCommit.runBiome")(function* (
  state: PreCommitBiomeState
) {
  return yield* Effect.if(state.biomePaths.length === 0, {
    onFalse: () => runPreCommitBiomeFormat(state),
    onTrue: () => {
      state.output.writeStdout("biome: no staged supported files\n");
      return Effect.succeed(continuePreCommitAfterBiome(state));
    },
  });
});

const runPreCommitBiomeFormat = Effect.fn("hook.preCommit.format")(function* (
  state: PreCommitBiomeState
) {
  const { biomePaths, context, output } = state;
  const request: HookBiomeCommandRequest = {
    kind: "format",
    write: true,
    noErrorsOnUnmatched: true,
    paths: biomePaths,
  };
  const format = yield* context.biome.run(request).pipe(
    Effect.match({
      onFailure: spawnResultFromCommandProviderError,
      onSuccess: spawnResultFromCommandResult,
    })
  );
  output.writeStdout(section("biome format", format.stdout));
  output.writeStderr(format.stderr);
  return yield* Effect.if(format.exitCode !== 0, {
    onFalse: () => prepareFormattedPreCommitPaths(state),
    onTrue: () =>
      Effect.map(hookResult(output, format.exitCode), (result) => ({
        kind: "done" as const,
        outcome: "biome-format-failed" as const,
        result,
      })),
  });
});

const prepareFormattedPreCommitPaths = Effect.fn("hook.preCommit.prepareFormattedPaths")(function* (
  state: PreCommitBiomeState
) {
  const { beforeHashes, biomePaths, context, output } = state;
  const touched = biomePaths.filter(
    (candidate) => beforeHashes.get(candidate) !== hashRepoRelativeFile(context, candidate)
  );
  return yield* Effect.if(touched.length > 0, {
    onFalse: () => {
      output.writeStdout("formatter restage: 0 paths\n");
      return runPreCommitBiomeCheck(state);
    },
    onTrue: () => restageFormattedPreCommitPaths(state, touched),
  });
});

const restageFormattedPreCommitPaths = Effect.fn("hook.preCommit.restageFormattedPaths")(function* (
  state: PreCommitBiomeState,
  touched: string[]
) {
  const { context, output } = state;
  const restage = yield* gitAddEffect(context.git, context.platform.repoRoot, touched);
  output.writeStdout(section("formatter restage", restage.stdout));
  output.writeStderr(restage.stderr);
  return yield* Effect.if(restage.exitCode !== 0, {
    onFalse: () => {
      output.writeStdout(`formatter restage: ${touched.length} path(s)\n`);
      return runPreCommitBiomeCheck(state);
    },
    onTrue: () =>
      Effect.map(hookResult(output, restage.exitCode), (result) => ({
        kind: "done" as const,
        outcome: "formatter-restage-failed" as const,
        result,
      })),
  });
});

const runPreCommitBiomeCheck = Effect.fn("hook.preCommit.checkBiome")(function* (
  state: PreCommitBiomeState
) {
  const { biomePaths, context, output } = state;
  const request: HookBiomeCommandRequest = {
    kind: "check",
    noErrorsOnUnmatched: true,
    paths: biomePaths,
  };
  const check = yield* context.biome.run(request).pipe(
    Effect.match({
      onFailure: spawnResultFromCommandProviderError,
      onSuccess: spawnResultFromCommandResult,
    })
  );
  output.writeStdout(section("biome check", check.stdout));
  output.writeStderr(check.stderr);
  return yield* Effect.if(check.exitCode !== 0, {
    onFalse: () => Effect.succeed(continuePreCommitAfterBiome(state)),
    onTrue: () =>
      Effect.map(hookResult(output, check.exitCode), (result) => ({
        kind: "done" as const,
        outcome: "biome-check-failed" as const,
        result,
      })),
  });
});

export const finishPreCommit = Effect.fn("hook.preCommit.finish")(function* (
  state: PreCommitSourceCheckState,
  sourceCheckResult: StagedHookCheckResult | undefined
) {
  const decision = preCommitCompletionDecision(state, sourceCheckResult);
  decision.stdout.forEach(state.output.writeStdout);
  decision.stderr.forEach(state.output.writeStderr);
  const result = yield* hookResult(state.output, decision.exitCode);
  return yield* finalizePreCommitEffect(decision.outcome, result);
});

type PreCommitCompletionDecision = {
  readonly outcome: Parameters<typeof finalizePreCommitEffect>[0];
  readonly exitCode: number;
  readonly stdout: readonly string[];
  readonly stderr: readonly string[];
};

function preCommitCompletionDecision(
  state: PreCommitSourceCheckState,
  sourceCheckResult: StagedHookCheckResult | undefined
): PreCommitCompletionDecision {
  return Match.value(state.sourceCheckPaths.length > 0).pipe(
    Match.when(false, () => ({
      outcome: "pass" as const,
      exitCode: 0,
      stdout: [
        "source checks: no staged TypeScript/JavaScript files in approved source-check roots\n",
        "habitat hook pre-commit: PASS\n",
      ],
      stderr: [],
    })),
    Match.orElse(() =>
      Option.match(Option.fromNullable(sourceCheckResult), {
        onNone: () => ({
          outcome: "command-failed" as const,
          exitCode: 1,
          stdout: [],
          stderr: [],
        }),
        onSome: preCommitSourceCheckDecision,
      })
    )
  );
}

function preCommitSourceCheckDecision(
  sourceCheckResult: StagedHookCheckResult
): PreCommitCompletionDecision {
  const sourceCheck = stagedHookCheckCommandResult(sourceCheckResult);
  const stdout = [section("source check", sourceCheckResult.stdout)];
  const stderr = [sourceCheckResult.stderr];
  return Match.value(sourceCheck).pipe(
    Match.when({ kind: "parsed" }, (parsed) =>
      parsedPreCommitSourceCheckDecision(parsed, stdout, stderr)
    ),
    Match.orElse((unparsed) =>
      unparsedPreCommitSourceCheckDecision(unparsed, sourceCheckResult.exitCode, stdout, stderr)
    )
  );
}

function unparsedPreCommitSourceCheckDecision(
  unparsed: Exclude<HookCheckCommandResult, { readonly kind: "parsed" }>,
  commandExitCode: number,
  stdout: readonly string[],
  stderr: readonly string[]
): PreCommitCompletionDecision {
  return Match.value({
    commandFailed: unparsed.kind === "missing-json" && commandExitCode !== 0,
  }).pipe(
    Match.when({ commandFailed: true }, () => ({
      outcome: "command-failed" as const,
      exitCode: commandExitCode,
      stdout,
      stderr,
    })),
    Match.orElse(() => ({
      outcome: "parse-failed" as const,
      exitCode: 1,
      stdout,
      stderr: [...stderr, "habitat hook pre-commit: could not parse Habitat source check JSON.\n"],
    }))
  );
}

function parsedPreCommitSourceCheckDecision(
  parsed: Extract<HookCheckCommandResult, { readonly kind: "parsed" }>,
  stdout: readonly string[],
  stderr: readonly string[]
): PreCommitCompletionDecision {
  return Match.value({
    allowed: checkSummaryAllowsNextStage(parsed),
    summaryKind: parsed.summary.kind,
  }).pipe(
    Match.when({ summaryKind: "diagnostic-unavailable" }, () => ({
      outcome: "parse-failed" as const,
      exitCode: 1,
      stdout,
      stderr: [...stderr, "habitat hook pre-commit: could not parse source check JSON output.\n"],
    })),
    Match.when({ allowed: true }, () => ({
      outcome: "pass" as const,
      exitCode: 0,
      stdout: [...stdout, "habitat hook pre-commit: PASS\n"],
      stderr,
    })),
    Match.orElse(() => ({
      outcome: "finding" as const,
      exitCode: 1,
      stdout,
      stderr,
    }))
  );
}

export const prePushChangedPaths = Effect.fn("hook.prePush.changedPaths")(function* (
  context: HookProcedureContext,
  base: string
) {
  const result = yield* context.git
    .command(["diff", "--name-only", "-z", base, "HEAD"], { cwd: context.platform.repoRoot })
    .pipe(Effect.catchAll(() => Effect.succeed(undefined)));
  return Option.match(
    Option.fromNullable(result).pipe(Option.filter((command) => command.exit.code === 0)),
    {
      onNone: () => ({
        kind: "unavailable" as const,
        message: `could not read changed paths for base ${base}; refusing to skip hook source checks.`,
      }),
      onSome: (command) => ({
        kind: "available" as const,
        paths: command.stdout.text.split("\0").filter(Boolean),
      }),
    }
  );
});

export function prePushHookSourceCheckPaths(
  context: HookProcedureContext,
  changedPaths: readonly string[]
): readonly string[] {
  return Match.value(hookSourceCheckEnabled(context)).pipe(
    Match.when(false, () => []),
    Match.orElse(() => {
      const existingPaths = changedPaths.filter((candidate) =>
        context.platform.pathExists(path.resolve(context.platform.repoRoot, candidate))
      );
      return stagedSourceCheckPaths(existingPaths, hookSourceCheckApprovedRoots(context), {
        repoRoot: context.platform.repoRoot,
      });
    })
  );
}

export const prePushHookSourceCheck = Effect.fn("hook.prePush.sourceCheck")(function* (
  context: HookProcedureContext,
  changedPaths: readonly string[]
) {
  const argv = ["--hook-check", "--runner", "grit", "--json"];
  const report = yield* context.createCheckReport({
    runner: "grit",
    hookCheck: true,
    staged: true,
    stagedPaths: changedPaths,
    command: checkCommandContext(argv),
  });
  const summary = hookCheckSummary(report);
  const result = {
    ...spawnResultFromCheckReport(report),
    kind: "parsed" as const,
    report,
    summary,
  };
  return result;
});

export function runPrePushRunMany(context: HookProcedureContext, request: HookNxRunManyRequest) {
  return context.nx.runMany(request).pipe(
    Effect.match({
      onFailure: spawnResultFromCommandProviderError,
      onSuccess: spawnResultFromCommandResult,
    })
  );
}

export function runPrePushAffected(context: HookProcedureContext, request: HookNxAffectedRequest) {
  return context.nx.affected(request).pipe(
    Effect.match({
      onFailure: spawnResultFromCommandProviderError,
      onSuccess: spawnResultFromCommandResult,
    })
  );
}

export const resolvePrePushBase = Effect.fn("hook.prePush.resolveBase")(function* (
  context: HookProcedureContext
) {
  const parent = yield* context.graphite.parent({ cwd: context.platform.repoRoot });
  return yield* Option.match(Option.fromNullable(parent), {
    onNone: () => resolveRemotePrePushBase(context),
    onSome: (base) =>
      Effect.succeed({ kind: "resolved" as const, base, source: "graphite-parent" as const }),
  });
});

const resolveRemotePrePushBase = Effect.fn("hook.prePush.resolveRemoteBase")(function* (
  context: HookProcedureContext
) {
  const defaultBranch = yield* context.git.remoteDefaultBranch({
    cwd: context.platform.repoRoot,
  });
  const base = yield* Option.match(Option.fromNullable(defaultBranch), {
    onNone: () => Effect.succeed(null),
    onSome: (remote) =>
      context.git.mergeBase(remote, {
        cwd: context.platform.repoRoot,
      }),
  });
  return Option.match(Option.fromNullable(base), {
    onNone: () => ({
      kind: "refused" as const,
      message:
        "could not resolve an affected base from Graphite parent or the remote default branch; pass --base explicitly.",
    }),
    onSome: (resolved) => ({ kind: "resolved" as const, base: resolved, source: "merge-base" }),
  });
});

export const stagedHookCheck = Effect.fn("hook.preCommit.stagedCheck")(function* (
  context: HookProcedureContext,
  phase: StagedHookCheckPhase,
  stagedPaths: readonly string[]
) {
  const { argv, ...options } = stagedHookCheckDemand(phase);
  const report = yield* context.createCheckReport({
    ...options,
    staged: true,
    stagedPaths,
    command: checkCommandContext(argv),
  });
  const result = {
    ...spawnResultFromCheckReport(report),
    check: { report, summary: hookCheckSummary(report) },
  };
  return result;
});

function stagedHookCheckDemand(
  phase: StagedHookCheckPhase
):
  | { readonly argv: readonly string[]; readonly runner: "grit"; readonly hookCheck: true }
  | { readonly argv: readonly string[]; readonly runner: "habitat" } {
  return Match.value(phase).pipe(
    Match.when("source-check", () => ({
      argv: ["--staged", "--hook-check", "--runner", "grit", "--json"],
      runner: "grit" as const,
      hookCheck: true as const,
    })),
    Match.orElse(() => ({
      argv: ["--staged", "--runner", "habitat", "--json"],
      runner: "habitat" as const,
    }))
  );
}

export function checkSummaryAllowsNextStage(result: HookCheckCommandResult): boolean {
  return (
    result.kind === "parsed" &&
    (result.summary.kind === "pass" ||
      result.summary.kind === "advisory-only" ||
      result.summary.kind === "not-applicable")
  );
}

function continuePreCommitAfterBiome(
  state: PreCommitBiomeState
): PreCommitStep<PreCommitSourceCheckState> {
  const { context, staged } = state;
  const sourceCheckPaths = Match.value(hookSourceCheckEnabled(context)).pipe(
    Match.when(false, () => []),
    Match.orElse(() =>
      hookSourceCheckPaths(staged, context.platform.repoRoot, hookSourceCheckApprovedRoots(context))
    )
  );
  return { kind: "continue", state: { ...state, sourceCheckPaths } };
}

function hashRepoRelativeFile(
  context: HookProcedureContext,
  repoRelativePath: string
): string | null {
  return context.platform.hashFile(path.join(context.platform.repoRoot, repoRelativePath));
}

function hookSourceCheckApprovedRoots(context: HookProcedureContext): string[] {
  const hookRuleIds = context.rules.hookCheck.map((rule) => rule.id);
  return approvedSourceScanRootsForRules(factsForRuleIds(context.rules.diagnostic, hookRuleIds));
}

function hookSourceCheckEnabled(context: HookProcedureContext): boolean {
  return context.rules.hookCheck.length > 0;
}

function spawnResultFromCheckReport(report: CheckReport): SpawnResult {
  const exitCode = Match.value(report.ok).pipe(
    Match.when(true, () => 0),
    Match.orElse(() => 1)
  );
  return {
    exitCode,
    stdout: `${renderCheckReport(report, { json: true })}\n`,
    stderr: "",
  };
}

function stagedHookCheckCommandResult(result: StagedHookCheckResult): HookCheckCommandResult {
  return correlateHookCheckReport(result.exitCode, result.check.report);
}
