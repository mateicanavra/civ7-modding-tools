import type { Static, TSchema } from "typebox";
import { Value } from "typebox/value";

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

export function schemaPayloadFromCommandResult<Schema extends TSchema>(
  result: Civ7CommandResult,
  label: string,
  schema: Schema
): Static<Schema> {
  const payload = jsonPayloadFromCommandResult<Record<string, unknown>>(result, label);
  const observed = {
    ...payload,
    host: result.host,
    port: result.port,
    state: result.state,
  };
  if (Value.Check(schema, observed)) return observed;
  throw new Civ7DirectControlError("command-failed", `${label} returned an invalid payload`, {
    details: result,
  });
}

export function throwUnexpectedCommandPayloadStatus(
  result: Civ7CommandResult,
  label: string,
  status: never
): never {
  throw new Civ7DirectControlError(
    "command-failed",
    `${label} returned unexpected status: ${String(status)}`,
    { details: result }
  );
}
