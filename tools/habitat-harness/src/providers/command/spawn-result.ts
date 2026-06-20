import type { SpawnResult } from "../../lib/spawn.js";
import type { HabitatCommandResult } from "./types.js";

export function spawnResultFromCommandResult(result: HabitatCommandResult): SpawnResult {
  return {
    exitCode: result.exit.code,
    stdout: result.stdout.text,
    stderr: result.stderr.text,
  };
}
