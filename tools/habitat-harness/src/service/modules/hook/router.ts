import type { FileSystem } from "@effect/platform";
import type { CommandExecutor } from "@effect/platform/CommandExecutor";
import { Effect } from "effect";
import type { HabitatConfig } from "../../../config/index.js";
import type { BaselineAuthority } from "../../../domains/baseline-authority/index.js";
import { runHookCommand } from "../../../domains/hook-runtime/command-runner.js";
import {
  type HookCheckCommandResult,
  hookCheckCommandResult,
  renderResourceDecisionFailure,
  resourceDecisionToFacade,
} from "../../../domains/hook-runtime/index.js";
import { finalizePreCommit, finalizePrePush } from "../../../domains/hook-runtime/lifecycle.js";
import {
  type PrePushBaseDecision,
  resolveGraphiteParent,
  resolvePrePushBase,
} from "../../../domains/hook-runtime/pre-push-base.js";
import { captureRepoSnapshot } from "../../../domains/hook-runtime/repo-snapshot.js";
import { classifyResourcePreCommitDecision } from "../../../domains/hook-runtime/resource-inspection.js";
import {
  createHookOutput,
  type HookOptions,
  type HookRuntime,
  hookNow,
  section,
} from "../../../domains/hook-runtime/runtime.js";
import {
  biomeHookPaths,
  existingStagedPaths,
  fileHash,
  gitAdd,
  hookPatternScanRoots,
  unstagedAmong,
} from "../../../domains/hook-runtime/staged-worktree.js";
import type { SourceCheck } from "../../../domains/source-check/index.js";
import {
  type CheckReport,
  checkCommandContext,
  type HookCheckSummary,
  hookCheckSummary,
  renderCheckReport,
  StructuralCheck,
} from "../../../domains/structural-check/index.js";
import { repoRoot } from "../../../lib/paths.js";
import type { BiomeProvider } from "../../../providers/biome/index.js";
import type { CommandRunner, SpawnResult } from "../../../providers/command/index.js";
import { GitProvider, type GitProviderRequirements } from "../../../providers/git/index.js";
import type { NxProvider } from "../../../providers/nx/index.js";
import type { HookServiceOptions } from "./context.js";
import type { HookServiceRunInput } from "./contract.js";
import { module as hookModule } from "./module.js";

type HookName = "pre-commit" | "pre-push";
type StagedHookCheckTool = "file-layer" | "pattern-check";
type StagedHookCheckResult = SpawnResult & {
  readonly check?: {
    readonly report: CheckReport;
    readonly summary: HookCheckSummary;
  };
};
type HookCheckRequirements =
  | BaselineAuthority
  | BiomeProvider
  | CommandRunner
  | NxProvider
  | CommandExecutor
  | SourceCheck
  | HabitatConfig
  | FileSystem.FileSystem
  | GitProvider
  | GitProviderRequirements
  | StructuralCheck;
type HookOutput = ReturnType<typeof createHookOutput>;
interface PreCommitState {
  readonly runtime: HookRuntime;
  readonly output: HookOutput;
  readonly staged: readonly string[];
  readonly hashFile: (repoRelativePath: string) => string | null;
}

interface PreCommitPatternState extends PreCommitState {
  readonly gritPaths: readonly string[];
}

type PreCommitStep<T> =
  | { readonly kind: "done"; readonly result: SpawnResult }
  | { readonly kind: "continue"; readonly state: T };

const prePushTargets = [
  "biome:ci",
  "boundaries",
  "grit:check",
  "habitat:check",
  "test",
  "validate:boundary-taxonomy",
  "validate:grit-patterns",
];
const localHookNotice = "hook result: workstation check only; CI remains authoritative.\n";

export const hookRouter = {
  run: hookModule.run.effect(({ context, input }) => runHookService(input, context.hook)),
};

export const router = hookRouter;

export function runHookService(input: HookServiceRunInput = {}, options: HookServiceOptions = {}) {
  if (input.name === "pre-push" && !input.base) {
    return Effect.gen(function* () {
      const runtime = options.runtime ?? {};
      const baseDecision = yield* resolvePrePushBaseForService(runtime);
      return runPrePushWithBaseDecision(baseDecision, runtime);
    });
  }
  if (input.name === "pre-commit") return runPreCommitEffect(options.runtime ?? {});
  return Effect.sync(() => runHook(input.name, { base: input.base }, options.runtime));
}

export function runHook(
  name: string | undefined,
  options: HookOptions = {},
  runtime: HookRuntime = {}
): SpawnResult {
  if (!isHookName(name)) {
    return {
      exitCode: 2,
      stdout: "",
      stderr: `Unknown Habitat hook '${name ?? "(missing)"}'. Expected pre-commit or pre-push.\n`,
    };
  }
  return name === "pre-commit" ? runPreCommit(runtime) : runPrePush(options, runtime);
}

export function runPreCommit(runtime: HookRuntime = {}): SpawnResult {
  const begun = beginPreCommit(runtime);
  if (begun.kind === "done") return begun.result;

  const fileLayer = runStagedHookCheckCommand(begun.state.runtime, "file-layer");
  const afterFileLayer = continuePreCommitAfterFileLayer(begun.state, fileLayer);
  if (afterFileLayer.kind === "done") return afterFileLayer.result;

  const grit =
    afterFileLayer.state.gritPaths.length > 0
      ? runStagedHookCheckCommand(afterFileLayer.state.runtime, "pattern-check")
      : undefined;
  return finishPreCommit(afterFileLayer.state, grit);
}

function runPreCommitEffect(
  runtime: HookRuntime = {}
): Effect.Effect<SpawnResult, never, HookCheckRequirements> {
  const begun = beginPreCommit(runtime);
  if (begun.kind === "done") return Effect.succeed(begun.result);

  return Effect.gen(function* () {
    const fileLayer = yield* runStagedHookCheckServiceEffect(
      begun.state.runtime,
      "file-layer",
      begun.state.staged
    );
    const afterFileLayer = continuePreCommitAfterFileLayer(begun.state, fileLayer);
    if (afterFileLayer.kind === "done") return afterFileLayer.result;

    const grit =
      afterFileLayer.state.gritPaths.length > 0
        ? yield* runStagedHookCheckServiceEffect(
            afterFileLayer.state.runtime,
            "pattern-check",
            afterFileLayer.state.gritPaths
          )
        : undefined;
    return finishPreCommit(afterFileLayer.state, grit);
  });
}

function beginPreCommit(runtime: HookRuntime = {}): PreCommitStep<PreCommitState> {
  const startedAtMs = hookNow(runtime);
  const output = createHookOutput(runtime.reporter);
  output.writeStdout("habitat hook pre-commit\n");
  output.writeStdout(localHookNotice);

  const resourceDecision = classifyResourcePreCommitDecision(runtime);
  const resources = resourceDecisionToFacade(resourceDecision);
  if (runtime.trace) {
    runtime.trace.preCommit = {
      resourceState: resources.kind,
      stagedPaths: [],
      biomePaths: [],
      gritPaths: [],
      partialPaths: [],
      formatterTouchedPaths: [],
      restagedPaths: [],
      outcome: "started",
      startedAtMs,
    };
    runtime.trace.preCommit.preState = captureRepoSnapshot(runtime, resources.kind);
  }
  output.writeStdout(`resources: ${resources.kind}\n`);
  if (!resources.allowPreCommit) {
    output.writeStderr(renderResourceDecisionFailure(resourceDecision));
    return {
      kind: "done",
      result: finalizePreCommit(runtime, "resource-blocked", {
        exitCode: 1,
        ...output.result(),
      }),
    };
  }

  const hashFile = runtime.fileHash ?? fileHash;
  const staged = existingStagedPaths(runtime);
  if (runtime.trace?.preCommit) runtime.trace.preCommit.stagedPaths = staged;

  return { kind: "continue", state: { runtime, output, staged, hashFile } };
}

function continuePreCommitAfterFileLayer(
  state: PreCommitState,
  fileLayer: StagedHookCheckResult
): PreCommitStep<PreCommitPatternState> {
  const { hashFile, output, runtime, staged } = state;
  output.writeStdout(section("file-layer staged check", fileLayer.stdout));
  output.writeStderr(fileLayer.stderr);
  const fileLayerCheck = stagedHookCheckCommandResult(fileLayer);
  if (!checkSummaryAllowsNextStage(fileLayerCheck)) {
    if (fileLayerCheck.kind !== "parsed") {
      output.writeStderr("habitat hook pre-commit: could not parse file-layer check JSON.\n");
    }
    return {
      kind: "done",
      result: finalizePreCommit(runtime, "file-layer-failed", {
        exitCode: fileLayer.exitCode === 0 ? 1 : fileLayer.exitCode,
        ...output.result(),
      }),
    };
  }

  const biomePaths = biomeHookPaths(staged);
  if (runtime.trace?.preCommit) runtime.trace.preCommit.biomePaths = biomePaths;
  const partials = unstagedAmong(biomePaths, runtime);
  if (runtime.trace?.preCommit) runtime.trace.preCommit.partialPaths = partials;
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
      result: finalizePreCommit(runtime, "partial-staging-refused", {
        exitCode: 1,
        ...output.result(),
      }),
    };
  }
  const beforeHashes = new Map(biomePaths.map((candidate) => [candidate, hashFile(candidate)]));
  if (biomePaths.length > 0) {
    const format = runHookCommand(
      runtime,
      "biome-format",
      ["biome", "format", "--write", "--no-errors-on-unmatched", ...biomePaths],
      {
        cwd: repoRoot,
      }
    );
    output.writeStdout(section("biome format", format.stdout));
    output.writeStderr(format.stderr);
    if (format.exitCode !== 0) {
      return {
        kind: "done",
        result: finalizePreCommit(runtime, "biome-format-failed", {
          exitCode: format.exitCode,
          ...output.result(),
        }),
      };
    }

    const touched = biomePaths.filter(
      (candidate) => beforeHashes.get(candidate) !== hashFile(candidate)
    );
    if (runtime.trace?.preCommit) runtime.trace.preCommit.formatterTouchedPaths = touched;
    if (touched.length > 0) {
      const restage = gitAdd(touched, runtime);
      output.writeStdout(section("formatter restage", restage.stdout));
      output.writeStderr(restage.stderr);
      if (restage.exitCode !== 0) {
        return {
          kind: "done",
          result: finalizePreCommit(runtime, "formatter-restage-failed", {
            exitCode: restage.exitCode,
            ...output.result(),
          }),
        };
      }
      if (runtime.trace?.preCommit) runtime.trace.preCommit.restagedPaths = touched;
      output.writeStdout(`formatter restage: ${touched.length} path(s)\n`);
    } else {
      output.writeStdout("formatter restage: 0 paths\n");
    }

    const check = runHookCommand(
      runtime,
      "biome-check",
      ["biome", "check", "--no-errors-on-unmatched", ...biomePaths],
      {
        cwd: repoRoot,
      }
    );
    output.writeStdout(section("biome check", check.stdout));
    output.writeStderr(check.stderr);
    if (check.exitCode !== 0) {
      return {
        kind: "done",
        result: finalizePreCommit(runtime, "biome-check-failed", {
          exitCode: check.exitCode,
          ...output.result(),
        }),
      };
    }
  } else {
    output.writeStdout("biome: no staged supported files\n");
  }

  const gritPaths = hookPatternScanRoots(staged);
  if (runtime.trace?.preCommit) runtime.trace.preCommit.gritPaths = gritPaths;
  return { kind: "continue", state: { ...state, gritPaths } };
}

function finishPreCommit(
  state: PreCommitPatternState,
  grit: StagedHookCheckResult | undefined
): SpawnResult {
  const { output, runtime } = state;
  if (state.gritPaths.length > 0) {
    if (!grit) {
      return finalizePreCommit(runtime, "command-failed", {
        exitCode: 1,
        ...output.result(),
      });
    }
    output.writeStdout(section("pattern check", grit.stdout));
    output.writeStderr(grit.stderr);
    const gritCheck = stagedHookCheckCommandResult(grit);
    if (gritCheck.kind !== "parsed") {
      if (grit.exitCode !== 0 && gritCheck.kind === "missing-json") {
        return finalizePreCommit(runtime, "command-failed", {
          exitCode: grit.exitCode,
          ...output.result(),
        });
      }
      output.writeStderr("habitat hook pre-commit: could not parse Habitat pattern check JSON.\n");
      return finalizePreCommit(runtime, "parse-failed", {
        exitCode: 1,
        ...output.result(),
      });
    }
    if (!checkSummaryAllowsNextStage(gritCheck)) {
      if (gritCheck.summary.kind === "diagnostic-unavailable") {
        output.writeStderr("habitat hook pre-commit: could not parse pattern check JSON output.\n");
        return finalizePreCommit(runtime, "parse-failed", {
          exitCode: 1,
          ...output.result(),
        });
      }
      return finalizePreCommit(runtime, "finding", { exitCode: 1, ...output.result() });
    }
  } else {
    output.writeStdout("patterns: no staged TypeScript/JavaScript files in approved scan roots\n");
  }

  output.writeStdout("habitat hook pre-commit: PASS\n");
  return finalizePreCommit(runtime, "pass", { exitCode: 0, ...output.result() });
}

export function runPrePush(options: HookOptions = {}, runtime: HookRuntime = {}): SpawnResult {
  const baseDecision = options.base
    ? { kind: "resolved" as const, base: options.base, source: "explicit" as const }
    : resolvePrePushBase(runtime);
  return runPrePushWithBaseDecision(baseDecision, runtime);
}

function runPrePushWithBaseDecision(
  baseDecision: PrePushBaseDecision,
  runtime: HookRuntime = {}
): SpawnResult {
  const output = createHookOutput(runtime.reporter);
  output.writeStdout(localHookNotice);
  if (runtime.trace) {
    runtime.trace.prePush = {
      outcome: "started",
      startedAtMs: hookNow(runtime),
    };
    runtime.trace.prePush.preState = captureRepoSnapshot(runtime);
  }
  if (baseDecision.kind === "refused") {
    output.writeStderr(`habitat hook pre-push: ${baseDecision.message}\n`);
    return finalizePrePush(runtime, "base-refused", { exitCode: 1, ...output.result() });
  }
  const base = baseDecision.base;
  if (runtime.trace?.prePush) runtime.trace.prePush.base = base;
  if (runtime.trace?.prePush) runtime.trace.prePush.baseSource = baseDecision.source;
  const result = runHookCommand(
    runtime,
    "pre-push-affected",
    [
      "nx",
      "affected",
      "-t",
      prePushTargets.join(","),
      "--base",
      base,
      "--head",
      "HEAD",
      "--outputStyle=static",
    ],
    { cwd: repoRoot }
  );
  output.writeStdout(`habitat hook pre-push: repo Nx affected base=${base}\n${result.stdout}`);
  output.writeStderr(result.stderr);
  return finalizePrePush(runtime, result.exitCode === 0 ? "pass" : "affected-failed", {
    exitCode: result.exitCode,
    ...output.result(),
  });
}

function resolvePrePushBaseForService(
  runtime: HookRuntime
): Effect.Effect<PrePushBaseDecision, never, GitProvider | GitProviderRequirements> {
  return Effect.gen(function* () {
    const parent = resolveGraphiteParent(runtime);
    if (parent) return { kind: "resolved" as const, base: parent, source: "graphite-parent" };

    const git = yield* GitProvider;
    const defaultBranch = yield* git.remoteDefaultBranch({ cwd: repoRoot });
    const base = defaultBranch ? yield* git.mergeBase(defaultBranch, { cwd: repoRoot }) : null;
    if (base) return { kind: "resolved" as const, base, source: "merge-base" };
    return {
      kind: "refused" as const,
      message:
        "could not resolve an affected base from Graphite parent or the remote default branch; pass --base explicitly.",
    };
  });
}

function runStagedHookCheckCommand(
  runtime: HookRuntime,
  tool: StagedHookCheckTool
): StagedHookCheckResult {
  return runHookCommand(
    runtime,
    tool,
    ["bun", "tools/habitat-harness/bin/dev.ts", "check", "--staged", "--tool", tool, "--json"],
    { cwd: repoRoot }
  );
}

function runStagedHookCheckServiceEffect(
  runtime: HookRuntime,
  tool: StagedHookCheckTool,
  stagedPaths: readonly string[]
): Effect.Effect<StagedHookCheckResult, never, HookCheckRequirements> {
  return Effect.gen(function* () {
    const structuralCheck = yield* StructuralCheck;
    const argv = ["--staged", "--tool", tool, "--json"];
    const startedAtMs = hookNow(runtime);
    const report = yield* structuralCheck.createReport({
      tool,
      staged: true,
      stagedPaths,
      command: checkCommandContext(argv),
    });
    const result = {
      ...spawnResultFromCheckReport(report),
      check: { report, summary: hookCheckSummary(report) },
    };
    recordInProcessHookCheck(runtime, tool, argv, startedAtMs, result.exitCode);
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
  if (result.check) {
    return {
      kind: "parsed",
      report: result.check.report,
      summary: result.check.summary,
    };
  }
  return hookCheckCommandResult(result);
}

function recordInProcessHookCheck(
  runtime: HookRuntime,
  phase: StagedHookCheckTool,
  argv: readonly string[],
  startedAtMs: number,
  exitCode: number
) {
  const endedAtMs = hookNow(runtime);
  runtime.trace?.commands.push({
    phase,
    argv: ["habitat", "check", ...argv],
    cwd: repoRoot,
    env: undefined,
    exitCode,
    startedAtMs,
    endedAtMs,
    durationMs: Math.max(0, endedAtMs - startedAtMs),
  });
}

function checkSummaryAllowsNextStage(result: HookCheckCommandResult): boolean {
  return (
    result.kind === "parsed" &&
    (result.summary.kind === "pass" ||
      result.summary.kind === "advisory-only" ||
      result.summary.kind === "not-applicable")
  );
}

function isHookName(name: string | undefined): name is HookName {
  return name === "pre-commit" || name === "pre-push";
}
