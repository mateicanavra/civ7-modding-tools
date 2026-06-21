import { existsSync } from "node:fs";
import path from "node:path";
import { repoRoot, toRepoRelative } from "@internal/habitat-harness/substrate/lib/paths";
import { runHookCommand } from "./command-runner.js";
import {
  allowedResourceDecision,
  refusedResourceDecision,
  resourceDecisionToFacade,
} from "./resource.js";
import type { HookRuntime } from "./runtime.js";
import type {
  ResourcePreCommitDecision,
  ResourceStateFacade,
  ResourceStateKind,
} from "./schema.js";

export function classifyResourcesState(runtime: HookRuntime = {}): ResourceStateFacade {
  return resourceDecisionToFacade(classifyResourcePreCommitDecision(runtime));
}

export function classifyResourcePreCommitDecision(
  runtime: HookRuntime = {}
): ResourcePreCommitDecision {
  if (!runtime.resourcePolicy) {
    return allowedResourceDecision("not-configured", "No hook resource policy is configured.");
  }
  const pathExists = runtime.pathExists ?? existsSync;
  const resourcePath = normalizeResourcePath(runtime.resourcePolicy.path);
  const resourceCommands = runtime.resourcePolicy.commands;
  if (!resourcePath || resourcePath === ".." || resourcePath.startsWith("../")) {
    return resourceFailure("inspection-failed", "Hook resource policy path is outside the repo.", [
      resourceCommands.status,
    ]);
  }
  const resourcesRoot = path.join(repoRoot, resourcePath);
  if (!pathExists(resourcesRoot)) {
    return resourceFailure(
      "uninitialized",
      `The configured resource worktree is absent: ${resourcePath}.`,
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
    return resourceFailure("uninitialized", `${resourcePath} is not an initialized Git worktree.`, [
      resourceCommands.init,
      resourceCommands.status,
    ]);
  }

  const submoduleTopLevel = runHookCommand(
    runtime,
    "resource-state",
    ["git", "-C", resourcesRoot, "rev-parse", "--show-toplevel"],
    { cwd: repoRoot }
  );
  if (
    submoduleTopLevel.exitCode !== 0 ||
    path.resolve(submoduleTopLevel.stdout.trim()) !== path.resolve(resourcesRoot)
  ) {
    return resourceFailure(
      "uninitialized",
      `${resourcePath} exists but is not an initialized resource Git worktree.`,
      [resourceCommands.init, resourceCommands.status]
    );
  }

  const gitDir = runHookCommand(
    runtime,
    "resource-state",
    ["git", "-C", resourcesRoot, "rev-parse", "--git-dir"],
    { cwd: repoRoot }
  );
  if (gitDir.exitCode !== 0) {
    return resourceFailure(
      "uninitialized",
      `Could not inspect the ${resourcePath} Git directory.`,
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
      `The resource Git index is locked: ${path.join(gitDirAbsolute, "index.lock")}.`,
      [resourceCommands.unlock, resourceCommands.status]
    );
  }

  const submoduleStatus = runHookCommand(
    runtime,
    "resource-state",
    ["git", "-C", resourcesRoot, "status", "--porcelain"],
    { cwd: repoRoot }
  );
  if (submoduleStatus.exitCode !== 0) {
    return resourceFailure("uninitialized", `Could not inspect ${resourcePath} status.`, [
      resourceCommands.init,
      resourceCommands.status,
    ]);
  }
  if (submoduleStatus.stdout.trim()) {
    return resourceFailure("dirty-submodule", `${resourcePath} has uncommitted resource changes.`, [
      resourceCommands.publish,
      resourceCommands.status,
    ]);
  }

  const unstagedGitlink = runHookCommand(
    runtime,
    "resource-state",
    ["git", "diff", "--quiet", "--", resourcePath],
    { cwd: repoRoot }
  );
  if (unstagedGitlink.exitCode === 1) {
    return resourceFailure(
      "unstaged-gitlink",
      `The ${resourcePath} gitlink changed but is not staged.`,
      [`git add ${resourcePath}`, resourceCommands.status]
    );
  }
  if (unstagedGitlink.exitCode !== 0) {
    return resourceFailure(
      "uninitialized",
      `Could not inspect the unstaged ${resourcePath} gitlink state.`,
      [resourceCommands.init, resourceCommands.status]
    );
  }

  const stagedGitlink = runHookCommand(
    runtime,
    "resource-state",
    ["git", "diff", "--cached", "--quiet", "--", resourcePath],
    { cwd: repoRoot }
  );
  if (stagedGitlink.exitCode === 1) {
    return allowedResourceDecision(
      "staged-gitlink",
      `The ${resourcePath} gitlink is staged and the resource worktree is clean.`
    );
  }
  if (stagedGitlink.exitCode !== 0) {
    return resourceFailure(
      "uninitialized",
      `Could not inspect the staged ${resourcePath} gitlink state.`,
      [resourceCommands.init, resourceCommands.status]
    );
  }

  return allowedResourceDecision(
    "clean",
    `${resourcePath} is initialized, clean, and has no gitlink delta.`
  );
}

function normalizeResourcePath(resourcePath: string): string {
  const absolute = path.isAbsolute(resourcePath) ? resourcePath : path.join(repoRoot, resourcePath);
  return toRepoRelative(absolute);
}

function resourceFailure(
  kind: Exclude<ResourceStateKind, "clean" | "not-configured" | "staged-gitlink">,
  detail: string,
  remediation: string[]
): ResourcePreCommitDecision {
  const refusedKind = kind === "uninitialized" ? "uninitialized" : kind;
  return refusedResourceDecision(refusedKind, detail, remediation);
}
