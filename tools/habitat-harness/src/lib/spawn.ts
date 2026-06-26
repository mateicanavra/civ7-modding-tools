import { runSyncHabitatCommand } from "../providers/command/index.js";

export interface SpawnResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

/**
 * Argument-array spawning only (no shell interpolation, ever).
 * cwd defaults to the repo root resolved by the caller.
 */
export function run(
  argv: string[],
  opts: { cwd: string; env?: Record<string, string>; captureGitState?: boolean }
): SpawnResult {
  const [cmd, ...args] = argv;
  const result = runSyncHabitatCommand({
    commandId: `sync-${cmd}`,
    kind: "workspace-tool",
    executable: cmd,
    argv: args,
    cwd: opts.cwd,
    env: opts.env,
    captureGitState: opts.captureGitState,
  });
  return {
    exitCode: result.exit.code,
    stdout: result.stdout.text,
    stderr: result.stderr.text,
  };
}
