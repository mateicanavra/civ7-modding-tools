import type { CommandExecutor } from "@effect/platform/CommandExecutor";
import type { GitStateProvider } from "@habitat/cli/providers/git/index";
import {
  type CommandProviderError,
  CommandRunner,
} from "@habitat/cli/resources/command/index";
import type { HabitatConfig } from "@habitat/cli/resources/config/index";
import { Context, Effect, Layer } from "effect";

export type GraphiteProviderRequirements =
  | CommandExecutor
  | HabitatConfig
  | CommandRunner
  | GitStateProvider;

export interface GraphiteProviderService {
  readonly parentArgv: () => readonly string[];
  readonly parent: (options?: {
    cwd?: string;
  }) => Effect.Effect<string | null, never, GraphiteProviderRequirements>;
}

export class GraphiteProvider extends Context.Tag("@habitat/cli/GraphiteProvider")<
  GraphiteProvider,
  GraphiteProviderService
>() {}

export function makeGraphiteProviderLayer(repoRoot: string): Layer.Layer<GraphiteProvider> {
  return Layer.succeed(GraphiteProvider, {
    parentArgv,
    parent: (options = {}) =>
      CommandRunner.pipe(
        Effect.flatMap((runner) =>
          runner.run({
            commandId: "graphite-parent",
            kind: "workspace-tool",
            executable: "gt",
            argv: parentArgv().slice(1),
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
}

export function makeFakeGraphiteProviderLayer(
  handler: (options: { cwd: string }) => string | null | CommandProviderError,
  { repoRoot = "." }: { readonly repoRoot?: string } = {}
) {
  return Layer.succeed(GraphiteProvider, {
    parentArgv,
    parent: (options = {}) =>
      Effect.sync(() => handler({ cwd: options.cwd ?? repoRoot })).pipe(
        Effect.flatMap((result) =>
          result instanceof Error ? Effect.fail(result) : Effect.succeed(result)
        ),
        Effect.catchAll(() => Effect.succeed(null))
      ),
  });
}

export function parentArgv(): readonly string[] {
  return ["gt", "branch", "info", "--no-interactive"];
}
