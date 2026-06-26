import { readGitState } from "@internal/habitat-harness/substrate/providers/git/state";
import { parseWorktreeObservation, type WorktreeObservation } from "./schema.js";

export function observeWorktree(cwd?: string): WorktreeObservation {
  const state = readGitState(cwd);
  return parseWorktreeObservation({
    kind: "worktree-observation",
    dirty: state.dirty,
    dirtyPathCount: dirtyPathCount(state.statusShort),
    statusDigest: state.statusDigest,
    branch: state.branch ?? undefined,
    head: state.head ?? undefined,
  });
}

function dirtyPathCount(statusShort: string): number {
  return statusShort
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean).length;
}
