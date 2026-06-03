import { Civ7DirectControlError } from "../direct-control-error.js";

export function jsLiteral(value: unknown): string {
  const json = JSON.stringify(value);
  if (json === undefined) {
    throw new Civ7DirectControlError("command-failed", "Cannot serialize Civ7 command input");
  }
  return json;
}
