import type { CommandProviderError } from "../../errors/index.js";
import type { SpawnResult } from "../../lib/spawn.js";
import type { HabitatCommandResult } from "./types.js";

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
