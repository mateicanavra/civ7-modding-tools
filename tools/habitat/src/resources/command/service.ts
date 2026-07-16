import type { Effect } from "effect";
import type { CommandProviderError } from "./errors.js";
import type { HabitatProcessRequest } from "./request.js";
import type { HabitatCommandResult } from "./result.js";

export interface CommandRunnerService {
  readonly run: (
    request: HabitatProcessRequest
  ) => Effect.Effect<HabitatCommandResult, CommandProviderError>;
}
