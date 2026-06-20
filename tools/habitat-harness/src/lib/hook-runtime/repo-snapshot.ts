import type { SpawnResult } from "../../providers/command/index.js";
import { repoRoot, toRepoRelative } from "../paths.js";
import { runHookCommand } from "./command-runner.js";
import { classifyResourcesState } from "./resource-inspection.js";
import type { HookRuntime } from "./runtime.js";
import type { HookRepoSnapshot, ResourceStateKind } from "./schema.js";

export function captureRepoSnapshot(
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
    { cwd: repoRoot }
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

function parsePathList(result: SpawnResult): string[] {
  if (result.exitCode !== 0 || !result.stdout) return [];
  return result.stdout.split("\0").filter(Boolean).map(toRepoRelative);
}
