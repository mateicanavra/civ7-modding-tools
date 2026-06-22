import type { CommandCachePolicy } from "./request.js";

export type CommandObservation =
  | CommandNotRunObservation
  | CommandCompletedObservation
  | CommandFailedObservation
  | CommandInterruptedObservation
  | CommandToolUnavailableObservation
  | CommandOutputParseFailedObservation
  | CommandSchemaDriftObservation;

export interface CommandNotRunObservation {
  readonly kind: "not-run";
  readonly reason: string;
}

export interface CommandCompletedObservation {
  readonly kind: "completed";
  readonly exitCode: 0;
  readonly cachePolicy: CommandCachePolicy;
}

export interface CommandFailedObservation {
  readonly kind: "failed";
  readonly exitCode: number;
  readonly cachePolicy: CommandCachePolicy;
}

export interface CommandInterruptedObservation {
  readonly kind: "interrupted";
  readonly exitCode: number;
  readonly signal: string | null;
  readonly cachePolicy: CommandCachePolicy;
}

export interface CommandToolUnavailableObservation {
  readonly kind: "tool-unavailable";
  readonly detail: string;
}

export interface CommandOutputParseFailedObservation {
  readonly kind: "output-parse-failed";
  readonly detail: string;
  readonly cachePolicy: CommandCachePolicy;
}

export interface CommandSchemaDriftObservation {
  readonly kind: "schema-drift";
  readonly detail: string;
  readonly cachePolicy: CommandCachePolicy;
}

export function commandObservationFromExit(input: {
  readonly exitCode: number;
  readonly signal: string | null;
  readonly interrupted: boolean;
  readonly cachePolicy: CommandCachePolicy;
}): CommandCompletedObservation | CommandFailedObservation | CommandInterruptedObservation {
  if (input.interrupted) {
    return {
      kind: "interrupted",
      exitCode: input.exitCode,
      signal: input.signal,
      cachePolicy: input.cachePolicy,
    };
  }
  if (input.exitCode === 0) {
    return {
      kind: "completed",
      exitCode: 0,
      cachePolicy: input.cachePolicy,
    };
  }
  return {
    kind: "failed",
    exitCode: input.exitCode,
    cachePolicy: input.cachePolicy,
  };
}

export function assertNeverCommandObservation(value: never): never {
  throw new Error(`Unhandled command observation: ${JSON.stringify(value)}`);
}

export function renderCommandObservation(observation: CommandObservation): string {
  switch (observation.kind) {
    case "not-run":
      return `not run: ${observation.reason}`;
    case "completed":
      return "completed";
    case "failed":
      return `failed with exit ${observation.exitCode}`;
    case "interrupted":
      return `interrupted${observation.signal ? ` by ${observation.signal}` : ""}`;
    case "tool-unavailable":
      return `tool unavailable: ${observation.detail}`;
    case "output-parse-failed":
      return `output parse failed: ${observation.detail}`;
    case "schema-drift":
      return `schema drift: ${observation.detail}`;
    default:
      return assertNeverCommandObservation(observation);
  }
}
