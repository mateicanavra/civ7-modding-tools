export {
  CommandFailed,
  CommandInterrupted,
  type CommandProviderError,
  CommandUnavailable,
} from "@internal/habitat-harness/substrate/providers/command/errors";
export type { HabitatError } from "./habitat-error.ts";
export {
  FileReadFailed,
  FileWriteFailed,
  type HabitatProviderError,
} from "./provider-errors.ts";
export { renderHabitatError } from "./render.ts";
