import { Context, Effect, Layer } from "effect";
import { HabitatConfig, type HabitatToolExecutionPlane } from "../config/index.js";
import {
  type MaterializedHabitatCommand,
  materializeDefaultHabitatCommand,
  materializeHabitatCommandWithConfig,
} from "../providers/command/index.js";

export type { HabitatToolExecutionPlane, MaterializedHabitatCommand };

export interface WorkspaceToolProviderService {
  materialize: (
    requestedExecutable: string,
    argv: readonly string[]
  ) => Effect.Effect<MaterializedHabitatCommand, never, HabitatConfig>;
}

export class WorkspaceToolProvider extends Context.Tag(
  "@internal/habitat-harness/WorkspaceToolProvider"
)<WorkspaceToolProvider, WorkspaceToolProviderService>() {}

export const WorkspaceToolProviderLive = Layer.succeed(WorkspaceToolProvider, {
  materialize: (requestedExecutable, argv) =>
    Effect.gen(function* () {
      const configService = yield* HabitatConfig;
      const config = yield* configService.get;
      return materializeHabitatCommandWithConfig(config, requestedExecutable, argv);
    }),
});

export function materializeWorkspaceToolCommand(
  requestedExecutable: string,
  argv: readonly string[]
): Effect.Effect<MaterializedHabitatCommand, never, WorkspaceToolProvider | HabitatConfig> {
  return Effect.gen(function* () {
    const provider = yield* WorkspaceToolProvider;
    return yield* provider.materialize(requestedExecutable, argv);
  });
}

export function materializeHabitatCommand(
  requestedExecutable: string,
  argv: readonly string[]
): MaterializedHabitatCommand {
  return materializeDefaultHabitatCommand(requestedExecutable, argv);
}
