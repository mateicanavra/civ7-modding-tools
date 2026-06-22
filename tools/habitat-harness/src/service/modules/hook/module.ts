import path from "node:path";
import type { BiomeProviderService } from "@internal/habitat-harness/providers/biome/index";
import type { GitProviderService } from "@internal/habitat-harness/providers/git/index";
import type { GraphiteProviderService } from "@internal/habitat-harness/providers/graphite/index";
import type { NxProviderService } from "@internal/habitat-harness/providers/nx/index";
import {
  type SpawnResult,
  spawnResultFromCommandProviderError,
  spawnResultFromCommandResult,
} from "@internal/habitat-harness/resources/command/index";
import type { HabitatPlatformService } from "@internal/habitat-harness/resources/platform/index";
import type { HabitatReporterService } from "@internal/habitat-harness/resources/reporter/index";
import type { HabitatServiceDeps } from "@internal/habitat-harness/service/base";
import { service } from "@internal/habitat-harness/service/impl";
import {
  approvedScanRootsForRules,
  type CheckOptions,
  type CheckReport,
  checkCommandContext,
  type HookCheckSummary,
  hookCheckSummary,
  renderCheckReport,
  stagedSourceCheckPaths,
} from "@internal/habitat-harness/service/model/check/index";
import {
  createCheckReportEffect,
  type StructuralExecutionContext,
} from "@internal/habitat-harness/service/model/check/policy/structural/index";
import { prePushTargetPlanForChangedPaths } from "@internal/habitat-harness/service/model/graph/policy/validation-routing.policy";
import {
  factsForRuleIds,
  type RuleFactsCatalog,
} from "@internal/habitat-harness/service/model/rules/policy/catalog.policy";
import { workspaceGraphTargetNames } from "@internal/habitat-harness/service/model/workspace/index";
import { Effect } from "effect";
import type { HookServiceRunInput } from "./contract.js";
import {
  type HookCheckCommandResult,
  type PreCommitOutcome,
  renderResourceDecisionFailure,
  resourceDecisionToFacade,
} from "./model/index.js";
import { finalizePreCommitEffect, finalizePrePushEffect } from "./model/policy/lifecycle.policy.js";
import { classifyResourcePreCommitDecisionEffect } from "./model/policy/resource-inspection.policy.js";
import {
  createHookOutput,
  type HookResourcePolicy,
  hookNow,
  section,
} from "./model/policy/runtime.policy.js";
import {
  biomeHookPaths,
  existingStagedPathsEffect,
  gitAddEffect,
  hookSourceCheckPaths,
  unstagedAmongEffect,
} from "./model/policy/staged-worktree.policy.js";

type HookProcedureContext = {
  readonly biome: BiomeProviderService;
  readonly git: GitProviderService;
  readonly graphite: GraphiteProviderService;
  readonly nx: NxProviderService;
  readonly platform: HabitatPlatformService;
  readonly reporter: HabitatReporterService;
  readonly rules: RuleFactsCatalog;
  readonly createCheckReport: (options?: CheckOptions) => HookRouterEffect<CheckReport>;
  readonly workspaceGraphTargetNames: typeof workspaceGraphTargetNames;
};
type BiomeCommandRequest = Parameters<HookProcedureContext["biome"]["run"]>[0];
type StagedHookCheckTool = "file-layer" | "source-check";
type StagedHookCheckResult = SpawnResult & {
  readonly check: {
    readonly report: CheckReport;
    readonly summary: HookCheckSummary;
  };
};
type HookOutput = ReturnType<typeof createHookOutput>;
interface PreCommitState {
  readonly context: HookProcedureContext;
  readonly resourcePolicy?: HookResourcePolicy;
  readonly output: HookOutput;
  readonly staged: readonly string[];
}

interface PreCommitBiomeState extends PreCommitState {
  readonly biomePaths: readonly string[];
  readonly beforeHashes: ReadonlyMap<string, string | null>;
}

interface PreCommitSourceCheckState extends PreCommitState {
  readonly sourceCheckPaths: readonly string[];
}

type PreCommitStep<T> =
  | { readonly kind: "done"; readonly outcome: PreCommitOutcome; readonly result: SpawnResult }
  | { readonly kind: "continue"; readonly state: T };
type PrePushChangedPathsResult =
  | { readonly kind: "available"; readonly paths: readonly string[] }
  | { readonly kind: "unavailable"; readonly message: string };
type PrePushBaseDecision =
  | {
      readonly kind: "resolved";
      readonly base: string;
      readonly source: "explicit" | "graphite-parent" | "merge-base";
    }
  | {
      readonly kind: "refused";
      readonly message: string;
    };
type ParsedHookCheckResult = Extract<HookCheckCommandResult, { readonly kind: "parsed" }>;
type PrePushHookSourceCheckResult = SpawnResult & ParsedHookCheckResult;
type HookRouterEffect<T> = Effect.Effect<T, never, any>;
const localHookNotice = "hook result: workstation check only; CI remains authoritative.\n";

interface HookModuleContext {
  readonly runHook: (input?: HookServiceRunInput) => HookRouterEffect<SpawnResult>;
}

export const module = service.hook.use(({ context, next }) => {
  const hookContext = {
    biome: context.deps.biome,
    git: context.deps.git,
    graphite: context.deps.graphite,
    nx: context.deps.nx,
    platform: context.deps.platform,
    reporter: context.deps.reporter,
    rules: context.deps.rules,
    createCheckReport: (options) =>
      createCheckReport(
        { ...options, repoRoot: context.deps.platform.repoRoot },
        structuralExecutionContext(context.deps)
      ),
    workspaceGraphTargetNames,
  } satisfies HookProcedureContext;

  return next({
    context: {
      runHook: (input) => runHook(hookContext, input),
    } satisfies HookModuleContext,
  });
});

function createCheckReport(options: CheckOptions, context: StructuralExecutionContext) {
  return createCheckReportEffect(options, context);
}

function structuralExecutionContext(deps: HabitatServiceDeps): StructuralExecutionContext {
  return {
    biome: deps.biome,
    commandRunner: deps.commandRunner,
    git: deps.git,
    grit: deps.grit,
    nx: deps.nx,
    repoRoot: deps.platform.repoRoot,
    rules: deps.rules,
    sourceFileSystem: {
      isDirectory: deps.platform.isDirectory,
      isFile: deps.platform.isFileEffect,
      readDirectory: deps.platform.readDirectory,
      readText: deps.platform.readText,
    },
  };
}

function runHook(context: HookProcedureContext, input: HookServiceRunInput = {}) {
  return Effect.gen(function* () {
    if (input.name === "pre-push") {
      const baseDecision = input.base
        ? ({
            kind: "resolved",
            base: input.base,
            source: "explicit",
          } satisfies PrePushBaseDecision)
        : yield* resolvePrePushBase(context);
      const output = createHookOutput(context.reporter);
      output.writeStdout(localHookNotice);

      if (baseDecision.kind === "refused") {
        output.writeStderr(`habitat hook pre-push: ${baseDecision.message}\n`);
        return yield* finalizePrePushEffect("base-refused", {
          exitCode: 1,
          ...output.result(),
        });
      }
      const base = baseDecision.base;
      const changedPaths = yield* prePushChangedPaths(context, base);
      if (changedPaths.kind === "unavailable") {
        output.writeStderr(`habitat hook pre-push: ${changedPaths.message}\n`);
        return yield* finalizePrePushEffect("affected-failed", {
          exitCode: 1,
          ...output.result(),
        });
      }
      const hookSourcePaths = prePushHookSourceCheckPaths(context, changedPaths.paths);
      if (hookSourcePaths.length > 0) {
        const hookSourceCheck = yield* prePushHookSourceCheck(context, hookSourcePaths);
        output.writeStdout(
          section("source-check changed-path hook check", renderCheckReport(hookSourceCheck.report))
        );
        if (!checkSummaryAllowsNextStage(hookSourceCheck)) {
          return yield* finalizePrePushEffect("affected-failed", {
            exitCode: hookSourceCheck.exitCode,
            ...output.result(),
          });
        }
      } else {
        output.writeStdout(
          "source checks: no changed TypeScript/JavaScript/docs files in hook source-check roots\n"
        );
      }
      const targetPlan = prePushTargetPlanForChangedPaths(
        changedPaths.paths,
        context.workspaceGraphTargetNames(),
        context.rules.artifactPath
      );
      for (const target of targetPlan.runTargets) {
        const argv = context.nx.runTargetArgv(target);
        const startedAtMs = yield* hookNow();
        const targetResult = yield* context.nx.runTarget(target).pipe(
          Effect.match({
            onFailure: spawnResultFromCommandProviderError,
            onSuccess: spawnResultFromCommandResult,
          })
        );
        yield* recordHookCommand(
          context,
          "pre-push-target",
          argv,
          startedAtMs,
          targetResult.exitCode
        );
        output.writeStdout(
          `habitat hook pre-push: repo Nx target ${target.project}:${target.target}\n${targetResult.stdout}`
        );
        output.writeStderr(targetResult.stderr);
        if (targetResult.exitCode !== 0) {
          return yield* finalizePrePushEffect("affected-failed", {
            exitCode: targetResult.exitCode,
            ...output.result(),
          });
        }
      }
      if (targetPlan.affectedTargets.length === 0) {
        output.writeStdout("habitat hook pre-push: no repo Nx affected targets selected\n");
        return yield* finalizePrePushEffect("pass", {
          exitCode: 0,
          ...output.result(),
        });
      }
      const request = {
        base,
        targets: targetPlan.affectedTargets,
        head: "HEAD",
        excludeTaskDependencies: true,
      };
      const argv = context.nx.affectedArgv(request);
      const startedAtMs = yield* hookNow();
      const result = yield* context.nx.affected(request).pipe(
        Effect.match({
          onFailure: spawnResultFromCommandProviderError,
          onSuccess: spawnResultFromCommandResult,
        })
      );
      yield* recordHookCommand(context, "pre-push-affected", argv, startedAtMs, result.exitCode);
      output.writeStdout(`habitat hook pre-push: repo Nx affected base=${base}\n${result.stdout}`);
      output.writeStderr(result.stderr);
      return yield* finalizePrePushEffect(
        result.exitCode === 0 ? "pass" : "affected-failed",
        {
          exitCode: result.exitCode,
          ...output.result(),
        }
      );
    }

    if (input.name === "pre-commit") {
      const begun = yield* beginPreCommit(context, input.resourcePolicy);
      if (begun.kind === "done") {
        return yield* finalizePreCommitEffect(begun.outcome, begun.result);
      }
      const fileLayer = yield* stagedHookCheck(context, "file-layer", begun.state.staged);
      const afterFileLayer = yield* continuePreCommitAfterFileLayer(begun.state, fileLayer);
      if (afterFileLayer.kind === "done") {
        return yield* finalizePreCommitEffect(afterFileLayer.outcome, afterFileLayer.result);
      }
      const afterBiome = yield* preCommitBiomeProviderStep(afterFileLayer.state);
      if (afterBiome.kind === "done") {
        return yield* finalizePreCommitEffect(afterBiome.outcome, afterBiome.result);
      }

      const sourceCheckResult =
        afterBiome.state.sourceCheckPaths.length > 0
          ? yield* stagedHookCheck(context, "source-check", afterBiome.state.sourceCheckPaths)
          : undefined;
      return yield* finishPreCommit(afterBiome.state, sourceCheckResult);
    }

    return unknownHookResult(input.name);
  });
}

function unknownHookResult(name: string | undefined): SpawnResult {
  return {
    exitCode: 2,
    stdout: "",
    stderr: `Unknown Habitat hook '${name ?? "(missing)"}'. Expected pre-commit or pre-push.\n`,
  };
}

function hashRepoRelativeFile(
  context: HookProcedureContext,
  repoRelativePath: string
): string | null {
  return context.platform.hashFile(path.join(context.platform.repoRoot, repoRelativePath));
}

function beginPreCommit(
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
        result: {
          exitCode: 1,
          ...output.result(),
        },
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

function continuePreCommitAfterFileLayer(
  state: PreCommitState,
  fileLayer: StagedHookCheckResult
): HookRouterEffect<PreCommitStep<PreCommitBiomeState>> {
  const { context, output, staged } = state;
  output.writeStdout(section("file-layer staged check", fileLayer.stdout));
  output.writeStderr(fileLayer.stderr);
  const fileLayerCheck = stagedHookCheckCommandResult(fileLayer);
  if (!checkSummaryAllowsNextStage(fileLayerCheck)) {
    if (fileLayerCheck.kind !== "parsed") {
      output.writeStderr("habitat hook pre-commit: could not parse file-layer check JSON.\n");
    }
    return Effect.succeed({
      kind: "done",
      outcome: "file-layer-failed",
      result: {
        exitCode: fileLayer.exitCode === 0 ? 1 : fileLayer.exitCode,
        ...output.result(),
      },
    });
  }

  const biomePaths = biomeHookPaths(staged);
  return Effect.gen(function* () {
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
        result: {
          exitCode: 1,
          ...output.result(),
        },
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

function preCommitBiomeProviderStep(
  state: PreCommitBiomeState
): HookRouterEffect<PreCommitStep<PreCommitSourceCheckState>> {
  const { beforeHashes, biomePaths, context, output } = state;
  if (biomePaths.length === 0) {
    output.writeStdout("biome: no staged supported files\n");
    return Effect.succeed(continuePreCommitAfterBiome(state));
  }

  return Effect.gen(function* () {
    const formatRequest: BiomeCommandRequest = {
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
        result: {
          exitCode: format.exitCode,
          ...output.result(),
        },
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
          result: {
            exitCode: restage.exitCode,
            ...output.result(),
          },
        };
      }
      output.writeStdout(`formatter restage: ${touched.length} path(s)\n`);
    } else {
      output.writeStdout("formatter restage: 0 paths\n");
    }

    const checkRequest: BiomeCommandRequest = {
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
        result: {
          exitCode: check.exitCode,
          ...output.result(),
        },
      };
    }

    return continuePreCommitAfterBiome(state);
  });
}

function continuePreCommitAfterBiome(
  state: PreCommitBiomeState
): PreCommitStep<PreCommitSourceCheckState> {
  const { context, staged } = state;
  const sourceCheckPaths = hookSourceCheckPaths(
    staged,
    context.platform.repoRoot,
    hookSourceCheckApprovedRoots(context)
  );
  return { kind: "continue", state: { ...state, sourceCheckPaths } };
}

function finishPreCommit(
  state: PreCommitSourceCheckState,
  sourceCheckResult: StagedHookCheckResult | undefined
): HookRouterEffect<SpawnResult> {
  const { context, output } = state;
  if (state.sourceCheckPaths.length > 0) {
    if (!sourceCheckResult) {
      return finalizePreCommitEffect("command-failed", {
        exitCode: 1,
        ...output.result(),
      });
    }
    output.writeStdout(section("source check", sourceCheckResult.stdout));
    output.writeStderr(sourceCheckResult.stderr);
    const sourceCheck = stagedHookCheckCommandResult(sourceCheckResult);
    if (sourceCheck.kind !== "parsed") {
      if (sourceCheckResult.exitCode !== 0 && sourceCheck.kind === "missing-json") {
        return finalizePreCommitEffect("command-failed", {
          exitCode: sourceCheckResult.exitCode,
          ...output.result(),
        });
      }
      output.writeStderr("habitat hook pre-commit: could not parse Habitat source check JSON.\n");
      return finalizePreCommitEffect("parse-failed", {
        exitCode: 1,
        ...output.result(),
      });
    }
    if (!checkSummaryAllowsNextStage(sourceCheck)) {
      if (sourceCheck.summary.kind === "diagnostic-unavailable") {
        output.writeStderr("habitat hook pre-commit: could not parse source check JSON output.\n");
        return finalizePreCommitEffect("parse-failed", {
          exitCode: 1,
          ...output.result(),
        });
      }
      return finalizePreCommitEffect("finding", {
        exitCode: 1,
        ...output.result(),
      });
    }
  } else {
    output.writeStdout(
      "source checks: no staged TypeScript/JavaScript files in approved source-check roots\n"
    );
  }

  output.writeStdout("habitat hook pre-commit: PASS\n");
  return finalizePreCommitEffect("pass", { exitCode: 0, ...output.result() });
}

function prePushChangedPaths(
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

function prePushHookSourceCheckPaths(
  context: HookProcedureContext,
  changedPaths: readonly string[]
): readonly string[] {
  return stagedSourceCheckPaths(changedPaths, hookSourceCheckApprovedRoots(context), {
    repoRoot: context.platform.repoRoot,
  });
}

function hookSourceCheckApprovedRoots(context: HookProcedureContext): string[] {
  const hookRuleIds = context.rules.hookCheck.map((rule) => rule.id);
  return approvedScanRootsForRules(factsForRuleIds(context.rules.source, hookRuleIds));
}

function prePushHookSourceCheck(
  context: HookProcedureContext,
  changedPaths: readonly string[]
): HookRouterEffect<PrePushHookSourceCheckResult> {
  return Effect.gen(function* () {
    const argv = ["--hook-check", "--tool", "source-check", "--json"];
    const startedAtMs = yield* hookNow();
    const report = yield* context.createCheckReport({
      tool: "source-check",
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

function resolvePrePushBase(context: HookProcedureContext): HookRouterEffect<PrePushBaseDecision> {
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

function stagedHookCheck(
  context: HookProcedureContext,
  tool: StagedHookCheckTool,
  stagedPaths: readonly string[]
): HookRouterEffect<StagedHookCheckResult> {
  return Effect.gen(function* () {
    const argv = ["--staged", "--tool", tool, "--json"];
    const startedAtMs = yield* hookNow();
    const report = yield* context.createCheckReport({
      tool,
      staged: true,
      stagedPaths,
      command: checkCommandContext(argv),
    });
    const result = {
      ...spawnResultFromCheckReport(report),
      check: { report, summary: hookCheckSummary(report) },
    };
    yield* recordInProcessHookCheck(context, tool, argv, startedAtMs, result.exitCode);
    return result;
  });
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
  phase: StagedHookCheckTool,
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

function recordHookCommand(
  context: HookProcedureContext,
  phase:
    | "partial-staging"
    | "staged-paths"
    | "formatter-restage"
    | "biome-format"
    | "biome-check"
    | "pre-push-base"
    | "pre-push-target"
    | "pre-push-affected",
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

function checkSummaryAllowsNextStage(result: HookCheckCommandResult): boolean {
  return (
    result.kind === "parsed" &&
    (result.summary.kind === "pass" ||
      result.summary.kind === "advisory-only" ||
      result.summary.kind === "not-applicable")
  );
}
