import { Civ7DirectControlError } from "../direct-control-error.js";
import type { Civ7CommandResult } from "./types.js";

export function jsonPayloadFromCommandResult<T extends object>(
  result: Civ7CommandResult,
  label: string
): T {
  try {
    const payload = JSON.parse(result.output[0] ?? "{}") as T;
    return {
      host: result.host,
      port: result.port,
      state: result.state,
      ...payload,
    } as T;
  } catch (err) {
    throw new Civ7DirectControlError(
      "command-failed",
      `${label} returned invalid JSON: ${result.output.join("\n") || "<empty>"}`,
      { cause: err, details: result }
    );
  }
}
