import type { CommandProviderError } from "../../errors/index.js";
import { runSyncHabitatCommand } from "./runner.js";
import type { HabitatCommandResult } from "./types.js";

export interface SpawnResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

/**
 * Runs a command through Habitat's command materialization policy and projects
 * the provider observation into the historical spawn-shaped result contract.
 */
export function runSyncSpawnCommand(
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
  return spawnResultFromCommandResult(result);
}

export function spawnResultFromCommandResult(result: HabitatCommandResult): SpawnResult {
  return {
    exitCode: result.exit.code,
    stdout: result.stdout.text,
    stderr: result.stderr.text,
  };
}

export function spawnResultFromCommandProviderError(error: CommandProviderError): SpawnResult {
  switch (error._tag) {
    case "CommandFailed":
      return { exitCode: error.exitCode, stdout: "", stderr: error.stderr };
    case "CommandInterrupted":
      return { exitCode: 127, stdout: "", stderr: `${error.cause}\n` };
    case "CommandUnavailable":
      return { exitCode: 127, stdout: "", stderr: `${error.cause}\n` };
  }
}
