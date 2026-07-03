import { repoRoot } from "../../lib/paths.js";
import { runHookCommand } from "./command-runner.js";
import type { HookRuntime } from "./runtime.js";

export type PrePushBaseDecision =
  | {
      kind: "resolved";
      base: string;
      source: "explicit" | "graphite-parent" | "merge-base";
    }
  | {
      kind: "refused";
      message: string;
    };

export function resolvePrePushBase(runtime: HookRuntime = {}): PrePushBaseDecision {
  const parent = resolveGraphiteParent(runtime);
  if (parent) return { kind: "resolved", base: parent, source: "graphite-parent" };
  const defaultBranch = remoteDefaultBranch(runtime);
  const base = defaultBranch ? mergeBaseForRef(defaultBranch, runtime) : null;
  if (base) return { kind: "resolved", base, source: "merge-base" };
  return {
    kind: "refused",
    message:
      "could not resolve an affected base from Graphite parent or the remote default branch; pass --base explicitly.",
  };
}

export function resolveGraphiteParent(runtime: HookRuntime = {}): string | null {
  const info = runHookCommand(
    runtime,
    "pre-push-base",
    ["gt", "branch", "info", "--no-interactive"],
    { cwd: repoRoot }
  );
  if (info.exitCode !== 0) return null;
  return info.stdout.match(/Parent:\s*([^\s]+)/)?.[1] ?? null;
}

function remoteDefaultBranch(runtime: HookRuntime = {}): string | null {
  const result = runHookCommand(
    runtime,
    "pre-push-base",
    ["git", "symbolic-ref", "--quiet", "--short", "refs/remotes/origin/HEAD"],
    { cwd: repoRoot }
  );
  if (result.exitCode !== 0) return null;
  const ref = result.stdout.trim();
  return ref || null;
}

function mergeBaseForRef(ref: string, runtime: HookRuntime = {}): string | null {
  const result = runHookCommand(runtime, "pre-push-base", ["git", "merge-base", "HEAD", ref], {
    cwd: repoRoot,
  });
  if (result.exitCode !== 0) return null;
  return result.stdout.trim() || null;
}
