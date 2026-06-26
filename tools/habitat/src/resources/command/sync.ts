import { spawnSync } from "node:child_process";

export interface SyncHostCommandResult {
  readonly status: number | null;
  readonly signal: string | null;
  readonly error?: Error;
  readonly stdout: string;
  readonly stderr: string;
}

export interface SyncHostCommandOptions {
  readonly cwd: string;
  readonly env?: NodeJS.ProcessEnv;
  readonly timeout?: number;
  readonly killSignal?: NodeJS.Signals;
  readonly maxBuffer?: number;
}

export function runSyncHostCommand(
  executable: string,
  argv: readonly string[],
  options: SyncHostCommandOptions
): SyncHostCommandResult {
  const result = spawnSync(executable, [...argv], {
    cwd: options.cwd,
    env: options.env,
    encoding: "utf8",
    maxBuffer: options.maxBuffer ?? 64 * 1024 * 1024,
    timeout: options.timeout,
    killSignal: options.killSignal,
  });
  return {
    status: result.status,
    signal: result.signal,
    error: result.error,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
  };
}
