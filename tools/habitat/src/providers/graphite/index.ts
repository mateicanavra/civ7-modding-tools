import {
  type CommandProviderError,
  CommandRunner,
  type CommandRunnerService,
} from "@habitat/cli/resources/command/index";
import { Context, Effect, Layer } from "effect";

export interface GraphiteProviderService {
  readonly parentArgv: () => readonly string[];
  readonly parent: (options?: { cwd?: string }) => Effect.Effect<string | null>;
}

export class GraphiteProvider extends Context.Tag("@habitat/cli/GraphiteProvider")<
  GraphiteProvider,
  GraphiteProviderService
>() {}

export function makeGraphiteProviderLayer(repoRoot: string) {
  return Layer.effect(
    GraphiteProvider,
    Effect.map(CommandRunner, (runner) => makeLiveGraphiteProvider(repoRoot, runner))
  );
}

function makeLiveGraphiteProvider(
  repoRoot: string,
  runner: CommandRunnerService
): GraphiteProviderService {
  return {
    parentArgv,
    parent: (options = {}) =>
      runner
        .run({
          commandId: "graphite-parent",
          kind: "workspace-tool",
          executable: "gt",
          argv: parentArgv().slice(1),
          cwd: options.cwd ?? repoRoot,
          captureGitState: false,
        })
        .pipe(
          Effect.map((result) =>
            result.exit.code === 0
              ? (result.stdout.text.match(/Parent:\s*([^\s]+)/)?.[1] ?? null)
              : null
          ),
          Effect.catchAll(() => Effect.succeed(null))
        ),
  };
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
