import type { CommandExecutor } from "@effect/platform/CommandExecutor";
import type { Effect } from "effect";
import type { HabitatConfig } from "../../config/index.js";
import type { CommandProviderError } from "../../errors/index.js";
import type { HabitatClock } from "../../resources/index.js";
import type { HabitatProcessRequest } from "./request.js";
import type { HabitatCommandResult } from "./result.js";

export type {
  CommandCompletedObservation,
  CommandFailedObservation,
  CommandInterruptedObservation,
  CommandNotRunObservation,
  CommandObservation,
  CommandOutputParseFailedObservation,
  CommandSchemaDriftObservation,
  CommandToolUnavailableObservation,
} from "./observation.js";
export {
  assertNeverCommandObservation,
  commandObservationFromExit,
  renderCommandObservation,
} from "./observation.js";
export type { CommandCachePolicy, HabitatCommandKind, HabitatProcessRequest } from "./request.js";
export type { HabitatCommandResult, OutputCapture, RedactedEnvValue } from "./result.js";

export interface CommandRunnerService {
  readonly run: (
    request: HabitatProcessRequest
  ) => Effect.Effect<
    HabitatCommandResult,
    CommandProviderError,
    CommandExecutor | HabitatConfig | HabitatClock
  >;
  readonly runSync: (request: HabitatProcessRequest) => HabitatCommandResult;
}
