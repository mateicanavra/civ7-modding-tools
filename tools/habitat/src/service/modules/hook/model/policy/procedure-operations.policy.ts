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
  approvedScanRootsForRules,
  stagedSourceCheckPaths,
} from "@habitat/cli/service/model/source-check/index";
import { Effect } from "effect";
import type { HookCheckCommandResult } from "./check-command.policy.js";
import { finalizePreCommitEffect } from "./lifecycle.policy.js";
import type {
  HookBiomeCommandRequest,
  HookCommandRecordPhase,
  HookNxAffectedRequest,
  HookNxRunTargetRequest,
  HookOutput,
  HookProcedureContext,
  HookRouterEffect,
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
import { localHookNotice } from "./procedure-context.policy.js";
import {
  renderResourceDecisionFailure,
  resourceDecisionToFacade,
} from "./resource-decision.policy.js";
import { classifyResourcePreCommitDecisionEffect } from "./resource-inspection.policy.js";
import { createHookOutput, type HookResourcePolicy, hookNow, section } from "./runtime.policy.js";
import {
  biomeHookPaths,
  existingStagedPathsEffect,
  gitAddEffect,
  hookSourceCheckPaths,
  unstagedAmongEffect,
} from "./staged-worktree.policy.js";

export function hookResult(output: HookOutput, exitCode: number): HookRouterEffect<SpawnResult> {
  return output.flush().pipe(Effect.as({ exitCode, ...output.result() }));
}

export function beginPreCommit(
  context: HookProcedureContext,
  resourcePolicy?: HookResourcePolicy
): HookRouterEffect<PreCommitStep<PreCommitState>> {
  const output = createHookOutput(context.reporter);
  output.writeStdout("habitat hook pre-commit\n");
  output.writeStdout(localHookNotice);

  return Effect.gen(function* () {
    const resourceDecision = yield* classifyResourcePreCommitDecisionEffect(
      context,
      resourcePolicy
    );
    const resources = resourceDecisionToFacade(resourceDecision);
    output.writeStdout(`resources: ${resources.kind}\n`);
    if (!resources.allowPreCommit) {
      output.writeStderr(renderResourceDecisionFailure(resourceDecision));
      return {
        kind: "done",
        outcome: "resource-blocked",
        result: yield* hookResult(output, 1),
      };
    }

    const stagedStartedAtMs = yield* hookNow();
    const staged = yield* existingStagedPathsEffect(
      context.git,
      context.platform.repoRoot,
      context.platform.pathExists
    );
    yield* recordHookCommand(
      context,
      "staged-paths",
      ["git", "diff", "--cached", "--name-status", "-z"],
      stagedStartedAtMs,
      0
    );
    return {
      kind: "continue",
      state: { context, resourcePolicy, output, staged },
    };
  });
}

export function continuePreCommitAfterFileLayer(
  state: PreCommitState,
  fileLayer: StagedHookCheckResult
): HookRouterEffect<PreCommitStep<PreCommitBiomeState>> {
  return Effect.gen(function* () {
    const { context, output, staged } = state;
    output.writeStdout(section("file-layer staged check", fileLayer.stdout));
    output.writeStderr(fileLayer.stderr);
    const fileLayerCheck = stagedHookCheckCommandResult(fileLayer);
    if (!checkSummaryAllowsNextStage(fileLayerCheck)) {
      if (fileLayerCheck.kind !== "parsed") {
        output.writeStderr("habitat hook pre-commit: could not parse file-layer check JSON.\n");
      }
      return {
        kind: "done",
        outcome: "file-layer-failed",
        result: yield* hookResult(output, fileLayer.exitCode === 0 ? 1 : fileLayer.exitCode),
      };
    }

    const biomePaths = biomeHookPaths(staged);
    const partialStartedAtMs = yield* hookNow();
    const partials = yield* unstagedAmongEffect(context.git, context.platform.repoRoot, biomePaths);
    yield* recordHookCommand(
      context,
      "partial-staging",
      ["git", "diff", "--name-only", "-z", "--", ...biomePaths],
      partialStartedAtMs,
      0
    );
    if (partials.length > 0) {
      output.writeStderr(
        [
          "habitat hook pre-commit: refusing to format partially staged files.",
          "Stage or unstage each whole file before committing; Habitat does not stash or rewrite unstaged hunks.",
          ...partials.map((file) => `- ${file}`),
          "",
        ].join("\n")
      );
      return {
        kind: "done",
        outcome: "partial-staging-refused",
        result: yield* hookResult(output, 1),
      } satisfies PreCommitStep<PreCommitBiomeState>;
    }
    const beforeHashes = new Map(
      biomePaths.map((candidate) => [candidate, hashRepoRelativeFile(context, candidate)])
    );
    return {
      kind: "continue",
      state: { ...state, biomePaths, beforeHashes },
    } satisfies PreCommitStep<PreCommitBiomeState>;
  });
}

export function preCommitBiomeProviderStep(
  state: PreCommitBiomeState
): HookRouterEffect<PreCommitStep<PreCommitSourceCheckState>> {
  const { beforeHashes, biomePaths, context, output } = state;
  if (biomePaths.length === 0) {
    output.writeStdout("biome: no staged supported files\n");
    return Effect.succeed(continuePreCommitAfterBiome(state));
  }

  return Effect.gen(function* () {
    const formatRequest: HookBiomeCommandRequest = {
      kind: "format",
      write: true,
      noErrorsOnUnmatched: true,
      paths: biomePaths,
    };
    const formatArgv = context.biome.argv(formatRequest);
    const formatStartedAtMs = yield* hookNow();
    const format = yield* context.biome.run(formatRequest).pipe(
      Effect.match({
        onFailure: spawnResultFromCommandProviderError,
        onSuccess: spawnResultFromCommandResult,
      })
    );
    yield* recordHookCommand(
      context,
      "biome-format",
      formatArgv,
      formatStartedAtMs,
      format.exitCode
    );
    output.writeStdout(section("biome format", format.stdout));
    output.writeStderr(format.stderr);
    if (format.exitCode !== 0) {
      return {
        kind: "done",
        outcome: "biome-format-failed",
        result: yield* hookResult(output, format.exitCode),
      };
    }

    const touched = biomePaths.filter(
      (candidate) => beforeHashes.get(candidate) !== hashRepoRelativeFile(context, candidate)
    );
    if (touched.length > 0) {
      const restageStartedAtMs = yield* hookNow();
      const restage = yield* gitAddEffect(context.git, context.platform.repoRoot, touched);
      yield* recordHookCommand(
        context,
        "formatter-restage",
        ["git", "add", "--", ...touched],
        restageStartedAtMs,
        restage.exitCode
      );
      output.writeStdout(section("formatter restage", restage.stdout));
      output.writeStderr(restage.stderr);
      if (restage.exitCode !== 0) {
        return {
          kind: "done",
          outcome: "formatter-restage-failed",
          result: yield* hookResult(output, restage.exitCode),
        };
      }
      output.writeStdout(`formatter restage: ${touched.length} path(s)\n`);
    } else {
      output.writeStdout("formatter restage: 0 paths\n");
    }

    const checkRequest: HookBiomeCommandRequest = {
      kind: "check",
      noErrorsOnUnmatched: true,
      paths: biomePaths,
    };
    const checkArgv = context.biome.argv(checkRequest);
    const checkStartedAtMs = yield* hookNow();
    const check = yield* context.biome.run(checkRequest).pipe(
      Effect.match({
        onFailure: spawnResultFromCommandProviderError,
        onSuccess: spawnResultFromCommandResult,
      })
    );
    yield* recordHookCommand(context, "biome-check", checkArgv, checkStartedAtMs, check.exitCode);
    output.writeStdout(section("biome check", check.stdout));
    output.writeStderr(check.stderr);
    if (check.exitCode !== 0) {
      return {
        kind: "done",
        outcome: "biome-check-failed",
        result: yield* hookResult(output, check.exitCode),
      };
    }

    return continuePreCommitAfterBiome(state);
  });
}

export function finishPreCommit(
  state: PreCommitSourceCheckState,
  sourceCheckResult: StagedHookCheckResult | undefined
): HookRouterEffect<SpawnResult> {
  return Effect.gen(function* () {
    const { output } = state;
    if (state.sourceCheckPaths.length > 0) {
      if (!sourceCheckResult) {
        return yield* finalizePreCommitEffect("command-failed", yield* hookResult(output, 1));
      }
      output.writeStdout(section("source check", sourceCheckResult.stdout));
      output.writeStderr(sourceCheckResult.stderr);
      const sourceCheck = stagedHookCheckCommandResult(sourceCheckResult);
      if (sourceCheck.kind !== "parsed") {
        if (sourceCheckResult.exitCode !== 0 && sourceCheck.kind === "missing-json") {
          return yield* finalizePreCommitEffect(
            "command-failed",
            yield* hookResult(output, sourceCheckResult.exitCode)
          );
        }
        output.writeStderr("habitat hook pre-commit: could not parse Habitat source check JSON.\n");
        return yield* finalizePreCommitEffect("parse-failed", yield* hookResult(output, 1));
      }
      if (!checkSummaryAllowsNextStage(sourceCheck)) {
        if (sourceCheck.summary.kind === "diagnostic-unavailable") {
          output.writeStderr(
            "habitat hook pre-commit: could not parse source check JSON output.\n"
          );
          return yield* finalizePreCommitEffect("parse-failed", yield* hookResult(output, 1));
        }
        return yield* finalizePreCommitEffect("finding", yield* hookResult(output, 1));
      }
    } else {
      output.writeStdout(
        "source checks: no staged TypeScript/JavaScript files in approved source-check roots\n"
      );
    }

    output.writeStdout("habitat hook pre-commit: PASS\n");
    return yield* finalizePreCommitEffect("pass", yield* hookResult(output, 0));
  });
}

export function prePushChangedPaths(
  context: HookProcedureContext,
  base: string
): HookRouterEffect<PrePushChangedPathsResult> {
  return Effect.gen(function* () {
    const result = yield* context.git
      .command(["diff", "--name-only", "-z", base, "HEAD"], { cwd: context.platform.repoRoot })
      .pipe(Effect.catchAll(() => Effect.succeed(undefined)));
    if (!result || result.exit.code !== 0) {
      return {
        kind: "unavailable",
        message: `could not read changed paths for base ${base}; refusing to skip hook source checks.`,
      };
    }
    return { kind: "available", paths: result.stdout.text.split("\0").filter(Boolean) };
  });
}

export function prePushHookSourceCheckPaths(
  context: HookProcedureContext,
  changedPaths: readonly string[]
): readonly string[] {
  if (!hookSourceCheckEnabled(context)) return [];
  return stagedSourceCheckPaths(changedPaths, hookSourceCheckApprovedRoots(context), {
    repoRoot: context.platform.repoRoot,
  });
}

export function prePushHookSourceCheck(
  context: HookProcedureContext,
  changedPaths: readonly string[]
): HookRouterEffect<PrePushHookSourceCheckResult> {
  return Effect.gen(function* () {
    const argv = ["--hook-check", "--runner", "grit", "--json"];
    const startedAtMs = yield* hookNow();
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
    const exitCode = checkSummaryAllowsNextStage(result) ? 0 : 1;
    yield* recordInProcessHookCheck(context, "source-check", argv, startedAtMs, exitCode);
    return { ...result, exitCode };
  });
}

export function runPrePushTarget(
  context: HookProcedureContext,
  target: HookNxRunTargetRequest
): HookRouterEffect<SpawnResult> {
  return context.nx.runTarget(target).pipe(
    Effect.match({
      onFailure: spawnResultFromCommandProviderError,
      onSuccess: spawnResultFromCommandResult,
    })
  );
}

export function runPrePushAffected(
  context: HookProcedureContext,
  request: HookNxAffectedRequest
): HookRouterEffect<SpawnResult> {
  return context.nx.affected(request).pipe(
    Effect.match({
      onFailure: spawnResultFromCommandProviderError,
      onSuccess: spawnResultFromCommandResult,
    })
  );
}

export function resolvePrePushBase(
  context: HookProcedureContext
): HookRouterEffect<PrePushBaseDecision> {
  return Effect.gen(function* () {
    const startedAtMs = yield* hookNow();
    const parent = yield* context.graphite.parent({ cwd: context.platform.repoRoot });
    yield* recordHookCommand(
      context,
      "pre-push-base",
      context.graphite.parentArgv(),
      startedAtMs,
      parent ? 0 : 1
    );
    if (parent) return { kind: "resolved" as const, base: parent, source: "graphite-parent" };

    const defaultBranch = yield* context.git.remoteDefaultBranch({
      cwd: context.platform.repoRoot,
    });
    const base = defaultBranch
      ? yield* context.git.mergeBase(defaultBranch, { cwd: context.platform.repoRoot })
      : null;
    if (base) return { kind: "resolved" as const, base, source: "merge-base" };
    return {
      kind: "refused" as const,
      message:
        "could not resolve an affected base from Graphite parent or the remote default branch; pass --base explicitly.",
    };
  });
}

export function stagedHookCheck(
  context: HookProcedureContext,
  phase: StagedHookCheckPhase,
  stagedPaths: readonly string[]
): HookRouterEffect<StagedHookCheckResult> {
  return Effect.gen(function* () {
    const runner = runnerForStagedHookCheckPhase(phase);
    const argv = ["--staged", "--runner", runner, "--json"];
    const startedAtMs = yield* hookNow();
    const report = yield* context.createCheckReport({
      runner,
      staged: true,
      stagedPaths,
      command: checkCommandContext(argv),
    });
    const result = {
      ...spawnResultFromCheckReport(report),
      check: { report, summary: hookCheckSummary(report) },
    };
    yield* recordInProcessHookCheck(context, phase, argv, startedAtMs, result.exitCode);
    return result;
  });
}

function runnerForStagedHookCheckPhase(phase: StagedHookCheckPhase): "grit" | "habitat" {
  return phase === "source-check" ? "grit" : "habitat";
}

export function recordHookCommand(
  context: HookProcedureContext,
  phase: HookCommandRecordPhase,
  argv: readonly string[],
  startedAtMs: number,
  exitCode: number
): Effect.Effect<void> {
  void context;
  void phase;
  void argv;
  void startedAtMs;
  void exitCode;
  return Effect.void;
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
  const sourceCheckPaths = hookSourceCheckEnabled(context)
    ? hookSourceCheckPaths(staged, context.platform.repoRoot, hookSourceCheckApprovedRoots(context))
    : [];
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
  return approvedScanRootsForRules(factsForRuleIds(context.rules.grit, hookRuleIds));
}

function hookSourceCheckEnabled(context: HookProcedureContext): boolean {
  return context.rules.hookCheck.length > 0;
}

function spawnResultFromCheckReport(report: CheckReport): SpawnResult {
  return {
    exitCode: report.ok ? 0 : 1,
    stdout: `${renderCheckReport(report, { json: true })}\n`,
    stderr: "",
  };
}

function stagedHookCheckCommandResult(result: StagedHookCheckResult): HookCheckCommandResult {
  return {
    kind: "parsed",
    report: result.check.report,
    summary: result.check.summary,
  };
}

function recordInProcessHookCheck(
  context: HookProcedureContext,
  phase: StagedHookCheckPhase,
  argv: readonly string[],
  startedAtMs: number,
  exitCode: number
): Effect.Effect<void> {
  void context;
  void phase;
  void argv;
  void startedAtMs;
  void exitCode;
  return Effect.void;
}
