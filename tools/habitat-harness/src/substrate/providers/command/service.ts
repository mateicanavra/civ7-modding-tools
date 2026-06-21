import type { CommandExecutor } from "@effect/platform/CommandExecutor";
import type { HabitatConfig } from "@internal/habitat-harness/substrate/config/index";
import type { Effect } from "effect";
import type { GitStateProvider } from "../git/state.js";
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
