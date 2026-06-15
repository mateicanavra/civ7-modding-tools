import { Civ7DirectControlError } from "./direct-control-error.js";

export function boundedInteger(value: number, min: number, max: number, label: string): number {
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new Civ7DirectControlError(
      "command-failed",
      `${label} must be an integer between ${min} and ${max}`
    );
  }
  return value;
}

export function validateIdentifier(value: string, label: string): string {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(value)) {
    throw new Civ7DirectControlError("command-failed", `${label} must be a simple identifier`);
  }
  return value;
}

export function validatePlayerId(playerId: number): number {
  return boundedInteger(playerId, 0, 1024, "playerId");
}
