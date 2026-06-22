import type { CommandExecutor } from "@effect/platform/CommandExecutor";
import type { HabitatConfig } from "@internal/habitat-harness/resources/config/index";
import { repoRoot } from "@internal/habitat-harness/resources/paths";
import { Context, Effect, Layer } from "effect";
import { type CommandProviderError, CommandRunner } from "@internal/habitat-harness/resources/command/index";
import type { GitStateProvider } from "@internal/habitat-harness/providers/git/index";

export type GraphiteProviderRequirements =
  | CommandExecutor
  | HabitatConfig
  | CommandRunner
  | GitStateProvider;

export interface GraphiteProviderService {
  readonly parent: (options?: {
    cwd?: string;
  }) => Effect.Effect<string | null, never, GraphiteProviderRequirements>;
}

export class GraphiteProvider extends Context.Tag("@internal/habitat-harness/GraphiteProvider")<
  GraphiteProvider,
  GraphiteProviderService
>() {}

export const GraphiteProviderLive = Layer.succeed(GraphiteProvider, {
  parent: (options = {}) =>
    CommandRunner.pipe(
      Effect.flatMap((runner) =>
        runner.run({
          commandId: "graphite-parent",
          kind: "workspace-tool",
          executable: "gt",
          argv: ["branch", "info", "--no-interactive"],
          cwd: options.cwd ?? repoRoot,
          captureGitState: false,
        })
      ),
      Effect.map((result) =>
        result.exit.code === 0
          ? (result.stdout.text.match(/Parent:\s*([^\s]+)/)?.[1] ?? null)
          : null
      ),
      Effect.catchAll(() => Effect.succeed(null))
    ),
});

export function makeFakeGraphiteProviderLayer(
  handler: (options: { cwd: string }) => string | null | CommandProviderError
) {
  return Layer.succeed(GraphiteProvider, {
    parent: (options = {}) =>
      Effect.sync(() => handler({ cwd: options.cwd ?? repoRoot })).pipe(
        Effect.flatMap((result) =>
          result instanceof Error ? Effect.fail(result) : Effect.succeed(result)
        ),
        Effect.catchAll(() => Effect.succeed(null))
      ),
  });
}
