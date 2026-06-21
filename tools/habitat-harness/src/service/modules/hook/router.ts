import { Effect } from "effect";
import { runHookCommand } from "../../../domains/hook-runtime/command-runner.js";
import {
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
import { repoRoot } from "../../../lib/paths.js";
import type { SpawnResult } from "../../../providers/command/index.js";
import { GitProvider, type GitProviderRequirements } from "../../../providers/git/index.js";
import type { HookServiceOptions } from "./context.js";
import type { HookServiceRunInput } from "./contract.js";
import { module as hookModule } from "./module.js";

type HookName = "pre-commit" | "pre-push";

const prePushTargets = [
  "biome:ci",
  "boundaries",
  "grit:check",
  "habitat:check",
  "test",
  "validate:boundary-taxonomy",
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
  const fileLayerCheck = hookCheckCommandResult(fileLayer);
  if (!checkSummaryAllowsNextStage(fileLayerCheck)) {
    if (fileLayerCheck.kind !== "parsed") {
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

  const gritPaths = hookPatternScanRoots(staged);
  if (runtime.trace?.preCommit) runtime.trace.preCommit.gritPaths = gritPaths;
  if (gritPaths.length > 0) {
    const grit = runHookCommand(
      runtime,
      "pattern-check",
      [
        "bun",
        "tools/habitat-harness/bin/dev.ts",
        "check",
        "--staged",
        "--tool",
        "pattern-check",
        "--json",
      ],
      {
        cwd: repoRoot,
      }
    );
    output.writeStdout(section("pattern check", grit.stdout));
    output.writeStderr(grit.stderr);
    const gritCheck = hookCheckCommandResult(grit);
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

function checkSummaryAllowsNextStage(result: ReturnType<typeof hookCheckCommandResult>): boolean {
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
