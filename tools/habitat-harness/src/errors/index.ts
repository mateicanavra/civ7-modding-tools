export {
  BaselineRefused,
  ConfigUnavailable,
  type HabitatDomainError,
  JsonParseFailed,
  ProtectedZoneRefused,
  SchemaValidationFailed,
  UnsafeStagedState,
  WorkspaceGraphUnavailable,
} from "./domain-errors.js";
export type { HabitatError } from "./habitat-error.js";
export {
  CommandFailed,
  CommandInterrupted,
  type CommandProviderError,
  CommandUnavailable,
  FileReadFailed,
  FileWriteFailed,
  type HabitatProviderError,
} from "./provider-errors.js";
export { renderHabitatError } from "./render.js";
