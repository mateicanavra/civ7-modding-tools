import { Civ7DirectControlError } from "../direct-control-error.js";

export function jsLiteral(value: unknown): string {
  let json: string | undefined;
  try {
    json = JSON.stringify(value);
  } catch (err) {
    throw new Civ7DirectControlError("command-failed", "Cannot serialize Civ7 command input", {
      cause: err,
    });
  }
  if (json === undefined) {
    throw new Civ7DirectControlError("command-failed", "Cannot serialize Civ7 command input");
  }
  return json;
}
