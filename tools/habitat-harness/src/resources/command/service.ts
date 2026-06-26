import type { CommandExecutor } from "@effect/platform/CommandExecutor";
import type { HabitatConfig } from "@internal/habitat-harness/resources/config/index";
import type { Effect } from "effect";
import type { GitStateProvider } from "@internal/habitat-harness/providers/git/state";
import type { CommandProviderError } from "./errors.js";
import type { HabitatProcessRequest } from "./request.js";
import type { HabitatCommandResult } from "./result.js";

export interface CommandRunnerService {
  readonly run: (
    request: HabitatProcessRequest
  ) => Effect.Effect<
    HabitatCommandResult,
    CommandProviderError,
    CommandExecutor | HabitatConfig | GitStateProvider
  >;
  readonly runSync: (request: HabitatProcessRequest) => HabitatCommandResult;
}
