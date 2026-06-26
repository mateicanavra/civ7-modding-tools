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
