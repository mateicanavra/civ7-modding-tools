import type { CommandExecutor } from "@effect/platform/CommandExecutor";
import type { Effect } from "effect";
import type { HabitatConfig } from "../../config/index.js";
import type { CommandProviderError } from "./errors.js";
import type { HabitatProcessRequest } from "./request.js";
import type { HabitatCommandResult } from "./result.js";

export interface CommandRunnerService {
  readonly run: (
    request: HabitatProcessRequest
  ) => Effect.Effect<HabitatCommandResult, CommandProviderError, CommandExecutor | HabitatConfig>;
  readonly runSync: (request: HabitatProcessRequest) => HabitatCommandResult;
}
