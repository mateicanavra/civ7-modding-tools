import { repoRoot } from "../paths.js";
import { run, type SpawnResult } from "../spawn.js";
import { type HookRuntime, hookNow } from "./runtime.js";
import type { HookCommandPhase } from "./schema.js";

export function runHookCommand(
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
