import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { mergeBase } from "./baseline.js";
import {
  isDiagnosticUnavailableProjection,
  localFeedbackCheckProjection,
  stagedGritScanRoots,
} from "./check-report.js";
import type { CheckReport } from "./diagnostics.js";
import { validateCheckReport } from "./diagnostics.js";
import { baselinesDir, repoRoot, toRepoRelative } from "./paths.js";
import { run, type SpawnResult } from "./spawn.js";

type HookName = "pre-commit" | "pre-push";

interface HookOptions {
  base?: string;
}

type RunCommand = typeof run;

interface HookRuntime {
  runCommand?: RunCommand;
  pathExists?: (target: string) => boolean;
  fileHash?: (repoRelativePath: string) => string | null;
  nowMs?: () => number;
  reporter?: HookReporter;
  resourcePublisher?: ResourcePublisher;
  trace?: HookTrace;
}

type ResourceStateKind =
  | "clean"
  | "not-configured"
  | "uninitialized"
  | "locked"
  | "dirty-submodule"
  | "unstaged-gitlink"
  | "staged-gitlink";

interface ResourceState {
  kind: ResourceStateKind;
  allowPreCommit: boolean;
  detail: string;
  remediation: string[];
}

export type HookCommandPhase =
  | "repo-state"
  | "resource-state"
  | "resource-publish"
  | "staged-paths"
  | "file-layer"
  | "partial-staging"
  | "biome-format"
  | "formatter-restage"
  | "biome-check"
  | "grit-check"
  | "pre-push-base"
  | "pre-push-affected";

export type PreCommitOutcome =
  | "started"
  | "resource-blocked"
  | "file-layer-failed"
  | "partial-staging-refused"
  | "biome-format-failed"
  | "formatter-restage-failed"
  | "biome-check-failed"
  | "grit-command-failed"
  | "grit-parse-failed"
  | "grit-finding"
  | "pass";

export interface HookCommandRecord {
  phase: HookCommandPhase;
  argv: string[];
  cwd: string;
  env?: Record<string, string>;
  exitCode: number;
  startedAtMs: number;
  endedAtMs: number;
  durationMs: number;
}

export interface HookRepoSnapshot {
  branch: string | null;
  head: string | null;
  stagedPaths: string[];
  unstagedPaths: string[];
  resourceState: ResourceStateKind;
}

export interface PreCommitTrace {
  startedAtMs: number;
  endedAtMs?: number;
  durationMs?: number;
  preState?: HookRepoSnapshot;
  postState?: HookRepoSnapshot;
  resourceState: ResourceStateKind;
  stagedPaths: string[];
  biomePaths: string[];
  gritPaths: string[];
  partialPaths: string[];
  formatterTouchedPaths: string[];
  restagedPaths: string[];
  outcome: PreCommitOutcome;
  exitCode?: number;
}

export interface PrePushTrace {
  startedAtMs: number;
  endedAtMs?: number;
  durationMs?: number;
  preState?: HookRepoSnapshot;
  postState?: HookRepoSnapshot;
  base?: string;
  outcome: "started" | "affected-failed" | "pass";
  exitCode?: number;
}

export interface HookTrace {
  commands: HookCommandRecord[];
  preCommit?: PreCommitTrace;
  prePush?: PrePushTrace;
}

export type HookReportChannel = "stdout" | "stderr";

export interface HookReportEvent {
  channel: HookReportChannel;
  text: string;
}

export interface HookReporter {
  write(event: HookReportEvent): void;
}

export interface ResourcePublishCommands {
  publish: string;
  status: string;
  init: string;
  unlock: string;
}

export interface ResourcePublisher {
  commands(): ResourcePublishCommands;
  publish(): SpawnResult;
}

export function createHookTrace(): HookTrace {
  return { commands: [] };
}

const prePushTargets = ["biome:ci", "boundaries", "grit:check", "habitat:check", "test"];
const resourcesSubmodulePath = ".civ7/outputs/resources";
const localHookNotice = "hook result: local feedback only; CI remains authoritative.\n";
const defaultResourcePublishCommands: ResourcePublishCommands = {
  publish: "bun run resources:publish",
  status: "bun run resources:status",
  init: "bun run resources:init",
  unlock: "bun run resources:unlock",
};

export function createResourcePublisher(runtime: HookRuntime = {}): ResourcePublisher {
  return {
    commands: () => ({ ...defaultResourcePublishCommands }),
    publish: () =>
      runHookCommand(runtime, "resource-publish", ["bun", "run", "resources:publish"], {
        cwd: repoRoot,
      }),
  };
}

const biomeCandidateExtensions = new Set([
  ".cjs",
  ".css",
  ".cts",
  ".graphql",
  ".html",
  ".js",
  ".json",
  ".jsonc",
  ".jsx",
  ".mjs",
  ".mts",
  ".ts",
  ".tsx",
]);

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

  const resources = classifyResourcesState(runtime);
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
    output.writeStderr(renderResourceStateFailure(resources));
    return finalizePreCommit(runtime, "resource-blocked", {
      exitCode: 1,
      ...output.result(),
    });
  }

  const pathExists = runtime.pathExists ?? existsSync;
  const hashFile = runtime.fileHash ?? fileHash;
  const staged = stagedPaths(runtime).filter((candidate) =>
    pathExists(path.join(repoRoot, candidate))
  );
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
  if (fileLayer.exitCode !== 0) {
    return finalizePreCommit(runtime, "file-layer-failed", {
      exitCode: fileLayer.exitCode,
      ...output.result(),
    });
  }

  const biomePaths = staged.filter((candidate) =>
    biomeCandidateExtensions.has(path.extname(candidate))
  );
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
    const report = parseCheckReportJson(grit.stdout) ?? parseCheckReportJson(grit.stderr);
    if (!report) {
      if (grit.exitCode !== 0) {
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
    const projection = localFeedbackCheckProjection(report);
    if (projection.kind !== "pass" && projection.kind !== "advisory-only") {
      if (isDiagnosticUnavailableProjection(projection)) {
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
    runtime.trace.prePush = { outcome: "started", startedAtMs: hookNow(runtime) };
    runtime.trace.prePush.preState = captureRepoSnapshot(runtime);
  }
  const base = options.base ?? resolvePrePushBase(runtime);
  if (runtime.trace?.prePush) runtime.trace.prePush.base = base;
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

export function classifyResourcesState(runtime: HookRuntime = {}): ResourceState {
  const pathExists = runtime.pathExists ?? existsSync;
  const resourceCommands = (
    runtime.resourcePublisher ?? createResourcePublisher(runtime)
  ).commands();
  const gitmodulesPath = path.join(repoRoot, ".gitmodules");
  if (!pathExists(gitmodulesPath)) {
    return {
      kind: "not-configured",
      allowPreCommit: true,
      detail: "No .gitmodules file is present.",
      remediation: [],
    };
  }

  const configured = runHookCommand(
    runtime,
    "resource-state",
    ["git", "config", "-f", ".gitmodules", "--get", `submodule.${resourcesSubmodulePath}.path`],
    { cwd: repoRoot }
  );
  if (configured.exitCode !== 0) {
    return {
      kind: "not-configured",
      allowPreCommit: true,
      detail: `No ${resourcesSubmodulePath} submodule entry is configured.`,
      remediation: [],
    };
  }

  const resourcesRoot = path.join(repoRoot, resourcesSubmodulePath);
  if (!pathExists(resourcesRoot)) {
    return resourceFailure(
      "uninitialized",
      `The resources submodule is configured but ${resourcesSubmodulePath} is absent.`,
      [resourceCommands.init, resourceCommands.status]
    );
  }

  const insideWorktree = runHookCommand(
    runtime,
    "resource-state",
    ["git", "-C", resourcesRoot, "rev-parse", "--is-inside-work-tree"],
    { cwd: repoRoot }
  );
  if (insideWorktree.exitCode !== 0) {
    return resourceFailure(
      "uninitialized",
      `${resourcesSubmodulePath} is not an initialized Git worktree.`,
      [resourceCommands.init, resourceCommands.status]
    );
  }

  const submoduleTopLevel = runHookCommand(
    runtime,
    "resource-state",
    ["git", "-C", resourcesRoot, "rev-parse", "--show-toplevel"],
    {
      cwd: repoRoot,
    }
  );
  if (
    submoduleTopLevel.exitCode !== 0 ||
    path.resolve(submoduleTopLevel.stdout.trim()) !== path.resolve(resourcesRoot)
  ) {
    return resourceFailure(
      "uninitialized",
      `${resourcesSubmodulePath} exists but is not an initialized submodule Git worktree.`,
      [resourceCommands.init, resourceCommands.status]
    );
  }

  const gitDir = runHookCommand(
    runtime,
    "resource-state",
    ["git", "-C", resourcesRoot, "rev-parse", "--git-dir"],
    {
      cwd: repoRoot,
    }
  );
  if (gitDir.exitCode !== 0) {
    return resourceFailure(
      "uninitialized",
      `Could not inspect the ${resourcesSubmodulePath} Git directory.`,
      [resourceCommands.init, resourceCommands.status]
    );
  }

  const gitDirPath = gitDir.stdout.trim();
  const gitDirAbsolute = path.isAbsolute(gitDirPath)
    ? gitDirPath
    : path.join(resourcesRoot, gitDirPath);
  if (pathExists(path.join(gitDirAbsolute, "index.lock"))) {
    return resourceFailure(
      "locked",
      `The resources submodule Git index is locked: ${path.join(gitDirAbsolute, "index.lock")}.`,
      [resourceCommands.unlock, resourceCommands.status]
    );
  }

  const submoduleStatus = runHookCommand(
    runtime,
    "resource-state",
    ["git", "-C", resourcesRoot, "status", "--porcelain"],
    {
      cwd: repoRoot,
    }
  );
  if (submoduleStatus.exitCode !== 0) {
    return resourceFailure("uninitialized", `Could not inspect ${resourcesSubmodulePath} status.`, [
      resourceCommands.init,
      resourceCommands.status,
    ]);
  }
  if (submoduleStatus.stdout.trim()) {
    return resourceFailure(
      "dirty-submodule",
      `${resourcesSubmodulePath} has uncommitted resource changes.`,
      [resourceCommands.publish, resourceCommands.status]
    );
  }

  const unstagedGitlink = runHookCommand(
    runtime,
    "resource-state",
    ["git", "diff", "--quiet", "--", resourcesSubmodulePath],
    {
      cwd: repoRoot,
    }
  );
  if (unstagedGitlink.exitCode === 1) {
    return resourceFailure(
      "unstaged-gitlink",
      `The ${resourcesSubmodulePath} gitlink changed but is not staged.`,
      [`git add ${resourcesSubmodulePath}`, resourceCommands.status]
    );
  }
  if (unstagedGitlink.exitCode !== 0) {
    return resourceFailure(
      "uninitialized",
      `Could not inspect the unstaged ${resourcesSubmodulePath} gitlink state.`,
      [resourceCommands.init, resourceCommands.status]
    );
  }

  const stagedGitlink = runHookCommand(
    runtime,
    "resource-state",
    ["git", "diff", "--cached", "--quiet", "--", resourcesSubmodulePath],
    {
      cwd: repoRoot,
    }
  );
  if (stagedGitlink.exitCode === 1) {
    return {
      kind: "staged-gitlink",
      allowPreCommit: true,
      detail: `The ${resourcesSubmodulePath} gitlink is staged and the submodule is clean.`,
      remediation: [],
    };
  }
  if (stagedGitlink.exitCode !== 0) {
    return resourceFailure(
      "uninitialized",
      `Could not inspect the staged ${resourcesSubmodulePath} gitlink state.`,
      [resourceCommands.init, resourceCommands.status]
    );
  }

  return {
    kind: "clean",
    allowPreCommit: true,
    detail: `${resourcesSubmodulePath} is initialized, clean, and has no gitlink delta.`,
    remediation: [],
  };
}

function resolvePrePushBase(runtime: HookRuntime = {}): string {
  const parent = graphiteParent(runtime);
  if (parent) return parent;
  return (
    mergeBase("main", {
      repoRoot,
      baselinesDir,
      registry: [],
      externalSources: {},
      ruleIntroductionManifests: [],
      runCommand: (argv, options) =>
        runHookCommand(runtime, "pre-push-base", argv, { cwd: options?.cwd ?? repoRoot }),
    }) ?? "main"
  );
}

function graphiteParent(runtime: HookRuntime = {}): string | null {
  const info = runHookCommand(
    runtime,
    "pre-push-base",
    ["gt", "branch", "info", "--no-interactive"],
    {
      cwd: repoRoot,
    }
  );
  if (info.exitCode !== 0) return null;
  return info.stdout.match(/Parent:\s*([^\s]+)/)?.[1] ?? null;
}

function stagedPaths(runtime: HookRuntime = {}): string[] {
  const result = runHookCommand(
    runtime,
    "staged-paths",
    ["git", "diff", "--cached", "--name-status", "-z"],
    {
      cwd: repoRoot,
    }
  );
  if (result.exitCode !== 0 || !result.stdout) return [];
  const tokens = result.stdout.split("\0").filter(Boolean);
  const out: string[] = [];
  for (let i = 0; i < tokens.length; ) {
    const status = tokens[i++] ?? "";
    if (status.startsWith("R") || status.startsWith("C")) {
      const oldPath = tokens[i++];
      const newPath = tokens[i++];
      if (oldPath) out.push(oldPath);
      if (newPath) out.push(newPath);
      continue;
    }
    const file = tokens[i++];
    if (!file || status.startsWith("D")) continue;
    out.push(file);
  }
  return [...new Set(out.map(toRepoRelative))];
}

function unstagedAmong(paths: string[], runtime: HookRuntime = {}): string[] {
  if (paths.length === 0) return [];
  const result = runHookCommand(
    runtime,
    "partial-staging",
    ["git", "diff", "--name-only", "-z", "--", ...paths],
    {
      cwd: repoRoot,
    }
  );
  if (result.exitCode !== 0 || !result.stdout) return [];
  return result.stdout.split("\0").filter(Boolean).map(toRepoRelative);
}

function gitAdd(paths: string[], runtime: HookRuntime = {}): SpawnResult {
  if (paths.length === 0) return { exitCode: 0, stdout: "", stderr: "" };
  return runHookCommand(runtime, "formatter-restage", ["git", "add", "--", ...paths], {
    cwd: repoRoot,
  });
}

function captureRepoSnapshot(
  runtime: HookRuntime,
  resourceState?: ResourceStateKind
): HookRepoSnapshot {
  const branch = runHookCommand(runtime, "repo-state", ["git", "branch", "--show-current"], {
    cwd: repoRoot,
  });
  const head = runHookCommand(runtime, "repo-state", ["git", "rev-parse", "HEAD"], {
    cwd: repoRoot,
  });
  const staged = runHookCommand(
    runtime,
    "repo-state",
    ["git", "diff", "--cached", "--name-only", "-z"],
    {
      cwd: repoRoot,
    }
  );
  const unstaged = runHookCommand(runtime, "repo-state", ["git", "diff", "--name-only", "-z"], {
    cwd: repoRoot,
  });

  return {
    branch: branch.exitCode === 0 ? branch.stdout.trim() || null : null,
    head: head.exitCode === 0 ? head.stdout.trim() || null : null,
    stagedPaths: parsePathList(staged),
    unstagedPaths: parsePathList(unstaged),
    resourceState: resourceState ?? classifyResourcesState(runtime).kind,
  };
}

function runHookCommand(
  runtime: HookRuntime,
  phase: HookCommandPhase,
  argv: string[],
  options: { cwd?: string; env?: Record<string, string> } = {}
): SpawnResult {
  const commandOptions = { cwd: options.cwd ?? repoRoot, env: options.env };
  const startedAtMs = hookNow(runtime);
  const result = (runtime.runCommand ?? run)(argv, commandOptions);
  const endedAtMs = hookNow(runtime);
  runtime.trace?.commands.push({
    phase,
    argv: [...argv],
    cwd: commandOptions.cwd,
    env: options.env ? { ...options.env } : undefined,
    exitCode: result.exitCode,
    startedAtMs,
    endedAtMs,
    durationMs: Math.max(0, endedAtMs - startedAtMs),
  });
  return result;
}

function finalizePreCommit(
  runtime: HookRuntime,
  outcome: PreCommitOutcome,
  result: SpawnResult
): SpawnResult {
  if (runtime.trace?.preCommit) {
    runtime.trace.preCommit.outcome = outcome;
    runtime.trace.preCommit.exitCode = result.exitCode;
    runtime.trace.preCommit.postState = captureRepoSnapshot(runtime);
    runtime.trace.preCommit.endedAtMs = hookNow(runtime);
    runtime.trace.preCommit.durationMs = Math.max(
      0,
      runtime.trace.preCommit.endedAtMs - runtime.trace.preCommit.startedAtMs
    );
  }
  return result;
}

function finalizePrePush(
  runtime: HookRuntime,
  outcome: NonNullable<HookTrace["prePush"]>["outcome"],
  result: SpawnResult
): SpawnResult {
  if (runtime.trace?.prePush) {
    runtime.trace.prePush.outcome = outcome;
    runtime.trace.prePush.exitCode = result.exitCode;
    runtime.trace.prePush.postState = captureRepoSnapshot(runtime);
    runtime.trace.prePush.endedAtMs = hookNow(runtime);
    runtime.trace.prePush.durationMs = Math.max(
      0,
      runtime.trace.prePush.endedAtMs - runtime.trace.prePush.startedAtMs
    );
  }
  return result;
}

function hookNow(runtime: HookRuntime): number {
  return runtime.nowMs?.() ?? Date.now();
}

function parsePathList(result: SpawnResult): string[] {
  if (result.exitCode !== 0 || !result.stdout) return [];
  return result.stdout.split("\0").filter(Boolean).map(toRepoRelative);
}

function fileHash(repoRelativePath: string): string | null {
  const absolute = path.join(repoRoot, repoRelativePath);
  if (!existsSync(absolute)) return null;
  return createHash("sha256").update(readFileSync(absolute)).digest("hex");
}

function hookGritScanRoots(stagedPaths: readonly string[]): string[] {
  return stagedGritScanRoots(stagedPaths);
}

function parseCheckReportJson(output: string): CheckReport | undefined {
  const trimmed = output.trim();
  if (!trimmed) return undefined;
  if (!trimmed.startsWith("{") || !trimmed.endsWith("}")) return undefined;
  try {
    const report = JSON.parse(trimmed) as CheckReport;
    return validateCheckReport(report).length === 0 ? report : undefined;
  } catch {
    return undefined;
  }
}

function createHookOutput(reporter?: HookReporter): {
  writeStdout: (text: string) => void;
  writeStderr: (text: string) => void;
  result: () => Pick<SpawnResult, "stdout" | "stderr">;
} {
  let stdout = "";
  let stderr = "";
  return {
    writeStdout(text) {
      if (!text) return;
      stdout += text;
      reporter?.write({ channel: "stdout", text });
    },
    writeStderr(text) {
      if (!text) return;
      stderr += text;
      reporter?.write({ channel: "stderr", text });
    },
    result() {
      return { stdout, stderr };
    },
  };
}

function section(label: string, output: string): string {
  return output ? `\n[${label}]\n${output}` : "";
}

function isHookName(name: string | undefined): name is HookName {
  return name === "pre-commit" || name === "pre-push";
}

function resourceFailure(
  kind: Exclude<ResourceStateKind, "clean" | "not-configured" | "staged-gitlink">,
  detail: string,
  remediation: string[]
): ResourceState {
  return {
    kind,
    allowPreCommit: false,
    detail,
    remediation,
  };
}

function renderResourceStateFailure(state: ResourceState): string {
  return [
    `habitat hook pre-commit: resources state '${state.kind}' requires explicit action.`,
    state.detail,
    ...state.remediation.map((command) => `- ${command}`),
    "",
  ].join("\n");
}
