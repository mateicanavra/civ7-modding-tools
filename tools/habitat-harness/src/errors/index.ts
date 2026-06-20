export {
  BaselineRefused,
  ConfigUnavailable,
  type HabitatDomainError,
  JsonParseFailed,
  ProtectedZoneRefused,
  SchemaValidationFailed,
  UnsafeStagedState,
  WorkspaceGraphUnavailable,
} from "./domain-errors.ts";
export type { HabitatError } from "./habitat-error.ts";
export {
  CommandFailed,
  CommandInterrupted,
  type CommandProviderError,
  CommandUnavailable,
  FileReadFailed,
  FileWriteFailed,
  type HabitatProviderError,
} from "./provider-errors.ts";
export { renderHabitatError } from "./render.ts";
