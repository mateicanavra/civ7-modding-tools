import type { HabitatError } from "./habitat-error.ts";

export function renderHabitatError(error: HabitatError): string {
  switch (error._tag) {
    case "CommandUnavailable":
      return `Command unavailable: ${error.executable} (${error.cause})`;
    case "CommandFailed":
      return `Command failed: ${error.executable} exited ${error.exitCode}`;
    case "CommandInterrupted":
      return `Command interrupted: ${error.executable} (${error.cause})`;
    case "FileReadFailed":
      return `File read failed: ${error.path} (${error.cause})`;
    case "FileWriteFailed":
      return `File write failed: ${error.path} (${error.cause})`;
  }
}
