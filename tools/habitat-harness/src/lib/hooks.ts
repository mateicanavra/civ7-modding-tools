import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { mergeBase } from "./baseline.js";
import { repoRoot, toRepoRelative } from "./paths.js";
import { run, type SpawnResult } from "./spawn.js";

type HookName = "pre-commit" | "pre-push";

interface HookOptions {
  base?: string;
}

type RunCommand = typeof run;

interface HookRuntime {
  runCommand?: RunCommand;
  pathExists?: (target: string) => boolean;
}

interface GritReport {
  results?: unknown[];
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

const prePushTargets = ["biome:ci", "boundaries", "grit:check", "habitat:check", "test"];
const resourcesSubmodulePath = ".civ7/outputs/resources";

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

const gritCandidateExtensions = new Set([
  ".cjs",
  ".cts",
  ".js",
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
  const runCommand = runtime.runCommand ?? run;
  let stdout = "habitat hook pre-commit\n";
  let stderr = "";

  const resources = classifyResourcesState(runtime);
  stdout += `resources: ${resources.kind}\n`;
  if (!resources.allowPreCommit) {
    return {
      exitCode: 1,
      stdout,
      stderr: stderr + renderResourceStateFailure(resources),
    };
  }

  const staged = stagedPaths(runCommand).filter((candidate) =>
    existsSync(path.join(repoRoot, candidate))
  );

  const fileLayer = runCommand(
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
  stdout += section("file-layer staged check", fileLayer.stdout);
  stderr += fileLayer.stderr;
  if (fileLayer.exitCode !== 0) return { exitCode: fileLayer.exitCode, stdout, stderr };

  const biomePaths = staged.filter((candidate) =>
    biomeCandidateExtensions.has(path.extname(candidate))
  );
  const partials = unstagedAmong(biomePaths, runCommand);
  if (partials.length > 0) {
    return {
      exitCode: 1,
      stdout,
      stderr:
        stderr +
        [
          "habitat hook pre-commit: refusing to format partially staged files.",
          "Stage or unstage each whole file before committing; Habitat does not stash or rewrite unstaged hunks.",
          ...partials.map((file) => `- ${file}`),
          "",
        ].join("\n"),
    };
  }

  const beforeHashes = new Map(biomePaths.map((candidate) => [candidate, fileHash(candidate)]));
  if (biomePaths.length > 0) {
    const format = runCommand(
      ["biome", "format", "--write", "--no-errors-on-unmatched", ...biomePaths],
      {
        cwd: repoRoot,
      }
    );
    stdout += section("biome format", format.stdout);
    stderr += format.stderr;
    if (format.exitCode !== 0) return { exitCode: format.exitCode, stdout, stderr };

    const touched = biomePaths.filter(
      (candidate) => beforeHashes.get(candidate) !== fileHash(candidate)
    );
    if (touched.length > 0) {
      const restage = gitAdd(touched, runCommand);
      stdout += section("formatter restage", restage.stdout);
      stderr += restage.stderr;
      if (restage.exitCode !== 0) return { exitCode: restage.exitCode, stdout, stderr };
      stdout += `formatter restage: ${touched.length} path(s)\n`;
    } else {
      stdout += "formatter restage: 0 paths\n";
    }

    const check = runCommand(["biome", "check", "--no-errors-on-unmatched", ...biomePaths], {
      cwd: repoRoot,
    });
    stdout += section("biome check", check.stdout);
    stderr += check.stderr;
    if (check.exitCode !== 0) return { exitCode: check.exitCode, stdout, stderr };
  } else {
    stdout += "biome: no staged supported files\n";
  }

  const gritPaths = staged.filter((candidate) =>
    gritCandidateExtensions.has(path.extname(candidate))
  );
  if (gritPaths.length > 0) {
    const grit = runCommand(["grit", "--json", "check", "--level", "error", ...gritPaths], {
      cwd: repoRoot,
      env: {
        GRIT_CACHE_DIR: path.join(repoRoot, ".grit", "cache"),
        GRIT_TELEMETRY_DISABLED: "true",
      },
    });
    stdout += section("grit check", grit.stdout);
    stderr += grit.stderr;
    if (grit.exitCode !== 0) return { exitCode: grit.exitCode, stdout, stderr };
    const report = parseGritJson(grit.stdout) ?? parseGritJson(grit.stderr);
    if (!report) {
      return {
        exitCode: 1,
        stdout,
        stderr: `${stderr}habitat hook pre-commit: could not parse Grit JSON output.\n`,
      };
    }
    if ((report.results?.length ?? 0) > 0) return { exitCode: 1, stdout, stderr };
  } else {
    stdout += "grit: no staged TypeScript/JavaScript files\n";
  }

  stdout += "habitat hook pre-commit: PASS\n";
  return { exitCode: 0, stdout, stderr };
}

function runPrePush(options: HookOptions): SpawnResult {
  const base = options.base ?? resolvePrePushBase();
  const result = run(
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
  return {
    exitCode: result.exitCode,
    stdout: `habitat hook pre-push: repo Nx affected base=${base}\n${result.stdout}`,
    stderr: result.stderr,
  };
}

export function classifyResourcesState(runtime: HookRuntime = {}): ResourceState {
  const runCommand = runtime.runCommand ?? run;
  const pathExists = runtime.pathExists ?? existsSync;
  const gitmodulesPath = path.join(repoRoot, ".gitmodules");
  if (!pathExists(gitmodulesPath)) {
    return {
      kind: "not-configured",
      allowPreCommit: true,
      detail: "No .gitmodules file is present.",
      remediation: [],
    };
  }

  const configured = runCommand(
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
      ["bun run resources:init", "bun run resources:status"]
    );
  }

  const insideWorktree = runCommand(
    ["git", "-C", resourcesRoot, "rev-parse", "--is-inside-work-tree"],
    { cwd: repoRoot }
  );
  if (insideWorktree.exitCode !== 0) {
    return resourceFailure(
      "uninitialized",
      `${resourcesSubmodulePath} is not an initialized Git worktree.`,
      ["bun run resources:init", "bun run resources:status"]
    );
  }

  const submoduleTopLevel = runCommand(["git", "-C", resourcesRoot, "rev-parse", "--show-toplevel"], {
    cwd: repoRoot,
  });
  if (
    submoduleTopLevel.exitCode !== 0 ||
    path.resolve(submoduleTopLevel.stdout.trim()) !== path.resolve(resourcesRoot)
  ) {
    return resourceFailure(
      "uninitialized",
      `${resourcesSubmodulePath} exists but is not an initialized submodule Git worktree.`,
      ["bun run resources:init", "bun run resources:status"]
    );
  }

  const gitDir = runCommand(["git", "-C", resourcesRoot, "rev-parse", "--git-dir"], {
    cwd: repoRoot,
  });
  if (gitDir.exitCode !== 0) {
    return resourceFailure(
      "uninitialized",
      `Could not inspect the ${resourcesSubmodulePath} Git directory.`,
      ["bun run resources:init", "bun run resources:status"]
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
      ["bun run resources:unlock", "bun run resources:status"]
    );
  }

  const submoduleStatus = runCommand(["git", "-C", resourcesRoot, "status", "--porcelain"], {
    cwd: repoRoot,
  });
  if (submoduleStatus.exitCode !== 0) {
    return resourceFailure(
      "uninitialized",
      `Could not inspect ${resourcesSubmodulePath} status.`,
      ["bun run resources:init", "bun run resources:status"]
    );
  }
  if (submoduleStatus.stdout.trim()) {
    return resourceFailure(
      "dirty-submodule",
      `${resourcesSubmodulePath} has uncommitted resource changes.`,
      ["bun run resources:publish", "bun run resources:status"]
    );
  }

  const unstagedGitlink = runCommand(["git", "diff", "--quiet", "--", resourcesSubmodulePath], {
    cwd: repoRoot,
  });
  if (unstagedGitlink.exitCode === 1) {
    return resourceFailure(
      "unstaged-gitlink",
      `The ${resourcesSubmodulePath} gitlink changed but is not staged.`,
      [`git add ${resourcesSubmodulePath}`, "bun run resources:status"]
    );
  }
  if (unstagedGitlink.exitCode !== 0) {
    return resourceFailure(
      "uninitialized",
      `Could not inspect the unstaged ${resourcesSubmodulePath} gitlink state.`,
      ["bun run resources:init", "bun run resources:status"]
    );
  }

  const stagedGitlink = runCommand(
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
      ["bun run resources:init", "bun run resources:status"]
    );
  }

  return {
    kind: "clean",
    allowPreCommit: true,
    detail: `${resourcesSubmodulePath} is initialized, clean, and has no gitlink delta.`,
    remediation: [],
  };
}

function resolvePrePushBase(): string {
  const parent = graphiteParent();
  if (parent) return parent;
  return mergeBase("main") ?? "main";
}

function graphiteParent(): string | null {
  const info = run(["gt", "branch", "info", "--no-interactive"], { cwd: repoRoot });
  if (info.exitCode !== 0) return null;
  return info.stdout.match(/Parent:\s*([^\s]+)/)?.[1] ?? null;
}

function stagedPaths(runCommand: RunCommand = run): string[] {
  const result = runCommand(["git", "diff", "--cached", "--name-status", "-z"], {
    cwd: repoRoot,
  });
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

function unstagedAmong(paths: string[], runCommand: RunCommand = run): string[] {
  if (paths.length === 0) return [];
  const result = runCommand(["git", "diff", "--name-only", "-z", "--", ...paths], {
    cwd: repoRoot,
  });
  if (result.exitCode !== 0 || !result.stdout) return [];
  return result.stdout.split("\0").filter(Boolean).map(toRepoRelative);
}

function gitAdd(paths: string[], runCommand: RunCommand = run): SpawnResult {
  if (paths.length === 0) return { exitCode: 0, stdout: "", stderr: "" };
  return runCommand(["git", "add", "--", ...paths], { cwd: repoRoot });
}

function fileHash(repoRelativePath: string): string | null {
  const absolute = path.join(repoRoot, repoRelativePath);
  if (!existsSync(absolute)) return null;
  return createHash("sha256").update(readFileSync(absolute)).digest("hex");
}

function parseGritJson(output: string): GritReport | undefined {
  const trimmed = output.trim();
  if (!trimmed) return undefined;
  for (const candidate of [
    trimmed,
    trimmed.slice(trimmed.indexOf("{"), trimmed.lastIndexOf("}") + 1),
  ]) {
    if (!candidate.startsWith("{") || !candidate.endsWith("}")) continue;
    try {
      return JSON.parse(candidate) as GritReport;
    } catch {
      // Grit can emit wrapper text around JSON; try the next candidate.
    }
  }
  return undefined;
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
