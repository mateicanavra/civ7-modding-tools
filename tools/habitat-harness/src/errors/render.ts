import type { HabitatError } from "./habitat-error.js";

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
    case "ConfigUnavailable":
      return `Config unavailable: ${error.source} (${error.cause})`;
    case "JsonParseFailed":
      return `JSON parse failed: ${error.path} (${error.cause})`;
    case "SchemaValidationFailed":
      return `Schema validation failed: ${error.subject} (${error.cause})`;
    case "WorkspaceGraphUnavailable":
      return `Workspace graph unavailable: ${error.cause}`;
    case "BaselineRefused":
      return `Baseline refused: ${error.reason} (${error.detail})`;
    case "ProtectedZoneRefused":
      return `Protected zone refused: ${error.path} (${error.reason})`;
    case "UnsafeStagedState":
      return `Unsafe staged state: ${error.reason}`;
  }
}
