import { Effect, Layer } from "effect";
import { CommandRunner } from "./runner.js";
import type { HabitatCommandResult, HabitatProcessRequest } from "./types.js";

export function makeFakeCommandRunnerLayer(
  handler: (request: HabitatProcessRequest) => HabitatCommandResult
) {
  return Layer.succeed(CommandRunner, {
    run: (request: HabitatProcessRequest) => Effect.sync(() => handler(request)),
  });
}
