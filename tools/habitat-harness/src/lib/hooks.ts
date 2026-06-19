import {
  hookCheckCommandProjection,
  renderResourceDecisionFailure,
  resourceDecisionToFacade,
} from "./local-feedback/index.js";
import { runHookCommand } from "./local-feedback/command-runner.js";
import { finalizePreCommit, finalizePrePush } from "./local-feedback/lifecycle.js";
import { resolvePrePushBase } from "./local-feedback/pre-push-base.js";
import { captureRepoSnapshot } from "./local-feedback/repo-snapshot.js";
import {
  classifyResourcePreCommitDecision,
  classifyResourcesState,
} from "./local-feedback/resource-inspection.js";
import {
  createHookOutput,
  createHookTrace,
  hookNow,
  section,
  type HookOptions,
  type HookReportEvent,
  type HookReporter,
  type HookResourcePolicy,
  type HookRuntime,
  type ResourceRecoveryCommands,
} from "./local-feedback/runtime.js";
import {
  biomeHookPaths,
  existingStagedPaths,
  fileHash,
  gitAdd,
  hookGritScanRoots,
  unstagedAmong,
} from "./local-feedback/staged-worktree.js";
import { repoRoot } from "./paths.js";
import type { SpawnResult } from "./spawn.js";

type HookName = "pre-commit" | "pre-push";

export type {
  HookCommandPhase,
  HookCommandRecord,
  HookRepoSnapshot,
  HookTrace,
  PreCommitOutcome,
  PreCommitTrace,
  PrePushTrace,
  ResourcePreCommitDecision,
  ResourceStateFacade as ResourceState,
  ResourceStateKind,
} from "./local-feedback/index.js";
export { classifyResourcePreCommitDecision, classifyResourcesState, createHookTrace };
export type {
  HookOptions,
  HookReportEvent,
  HookReporter,
  HookResourcePolicy,
  HookRuntime,
  ResourceRecoveryCommands,
};

const prePushTargets = ["biome:ci", "boundaries", "grit:check", "habitat:check", "test"];
const localHookNotice = "hook result: local feedback only; CI remains authoritative.\n";

export function runHook(name: string | undefined, options: HookOptions = {}): SpawnResult {
  if (!isHookName(name)) {
    return {
      exitCode: 2,
      stdout: "",
      stderr: `Unknown Habitat hook '${name ?? "(missing)"}'. Expected pre-commit or pre-push.\n`,
    };
  }
  return name === "pre-commit" ? runPreCommit() : runPrePush(options);
}

export function runPreCommit(runtime: HookRuntime = {}): SpawnResult {
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
    return finalizePreCommit(runtime, "resource-blocked", {
      exitCode: 1,
      ...output.result(),
    });
  }

  const hashFile = runtime.fileHash ?? fileHash;
  const staged = existingStagedPaths(runtime);
  if (runtime.trace?.preCommit) runtime.trace.preCommit.stagedPaths = staged;

  const fileLayer = runHookCommand(
    runtime,
    "file-layer",
    [
      "bun",
      "tools/habitat-harness/bin/dev.ts",
      "check",
      "--staged",
      "--tool",
      "file-layer",
      "--json",
    ],
    { cwd: repoRoot }
  );
  output.writeStdout(section("file-layer staged check", fileLayer.stdout));
  output.writeStderr(fileLayer.stderr);
  const fileLayerProjection = hookCheckCommandProjection(fileLayer);
  if (!checkProjectionAllowsNextStage(fileLayerProjection)) {
    if (fileLayerProjection.kind !== "projected") {
      output.writeStderr("habitat hook pre-commit: could not parse file-layer check JSON.\n");
    }
    return finalizePreCommit(runtime, "file-layer-failed", {
      exitCode: fileLayer.exitCode === 0 ? 1 : fileLayer.exitCode,
      ...output.result(),
    });
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
    return finalizePreCommit(runtime, "partial-staging-refused", {
      exitCode: 1,
      ...output.result(),
    });
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
      return finalizePreCommit(runtime, "biome-format-failed", {
        exitCode: format.exitCode,
        ...output.result(),
      });
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
        return finalizePreCommit(runtime, "formatter-restage-failed", {
          exitCode: restage.exitCode,
          ...output.result(),
        });
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
      return finalizePreCommit(runtime, "biome-check-failed", {
        exitCode: check.exitCode,
        ...output.result(),
      });
    }
  } else {
    output.writeStdout("biome: no staged supported files\n");
  }

  const gritPaths = hookGritScanRoots(staged);
  if (runtime.trace?.preCommit) runtime.trace.preCommit.gritPaths = gritPaths;
  if (gritPaths.length > 0) {
    const grit = runHookCommand(
      runtime,
      "grit-check",
      [
        "bun",
        "tools/habitat-harness/bin/dev.ts",
        "check",
        "--staged",
        "--tool",
        "grit-check",
        "--json",
      ],
      {
        cwd: repoRoot,
      }
    );
    output.writeStdout(section("grit check", grit.stdout));
    output.writeStderr(grit.stderr);
    const gritProjection = hookCheckCommandProjection(grit);
    if (gritProjection.kind !== "projected") {
      if (grit.exitCode !== 0 && gritProjection.kind === "missing-json") {
        return finalizePreCommit(runtime, "grit-command-failed", {
          exitCode: grit.exitCode,
          ...output.result(),
        });
      }
      output.writeStderr("habitat hook pre-commit: could not parse Habitat Grit check JSON.\n");
      return finalizePreCommit(runtime, "grit-parse-failed", {
        exitCode: 1,
        ...output.result(),
      });
    }
    if (!checkProjectionAllowsNextStage(gritProjection)) {
      if (gritProjection.projection.kind === "diagnostic-unavailable") {
        output.writeStderr("habitat hook pre-commit: could not parse Grit JSON output.\n");
        return finalizePreCommit(runtime, "grit-parse-failed", {
          exitCode: 1,
          ...output.result(),
        });
      }
      return finalizePreCommit(runtime, "grit-finding", { exitCode: 1, ...output.result() });
    }
  } else {
    output.writeStdout("grit: no staged TypeScript/JavaScript files in approved scan roots\n");
  }

  output.writeStdout("habitat hook pre-commit: PASS\n");
  return finalizePreCommit(runtime, "pass", { exitCode: 0, ...output.result() });
}

export function runPrePush(options: HookOptions = {}, runtime: HookRuntime = {}): SpawnResult {
  const output = createHookOutput(runtime.reporter);
  output.writeStdout(localHookNotice);
  if (runtime.trace) {
    runtime.trace.prePush = {
      outcome: "started",
      startedAtMs: hookNow(runtime),
    };
    runtime.trace.prePush.preState = captureRepoSnapshot(runtime);
  }
  const baseDecision = options.base
    ? { kind: "resolved" as const, base: options.base, source: "explicit" as const }
    : resolvePrePushBase(runtime);
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

function checkProjectionAllowsNextStage(
  result: ReturnType<typeof hookCheckCommandProjection>
): boolean {
  return (
    result.kind === "projected" &&
    (result.projection.kind === "pass" ||
      result.projection.kind === "advisory-only" ||
      result.projection.kind === "not-applicable")
  );
}

function isHookName(name: string | undefined): name is HookName {
  return name === "pre-commit" || name === "pre-push";
}
