import {
  type CommandProviderError,
  CommandRunner,
  type CommandRunnerService,
} from "@habitat/cli/resources/command/index";
import type { HabitatCommandResult } from "@habitat/cli/resources/command/types";
import { Context, Effect, Layer, Match } from "effect";

export interface GraphiteProviderService extends ReturnType<typeof makeLiveGraphiteProvider> {}

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

function makeLiveGraphiteProvider(repoRoot: string, runner: CommandRunnerService) {
  return {
    parentArgv,
    parent: (options: { readonly cwd?: string } = {}) =>
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
          Effect.map(graphiteParentFromResult),
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
    parent: (options: { readonly cwd?: string } = {}) =>
      Effect.succeed(handler({ cwd: options.cwd ?? repoRoot })).pipe(
        Effect.flatMap(fakeGraphiteParentResult),
        Effect.catchAll(() => Effect.succeed(null))
      ),
  });
}

export function parentArgv(): readonly string[] {
  return ["gt", "branch", "info", "--no-interactive"];
}

function graphiteParentFromResult(result: HabitatCommandResult) {
  return Match.value(result.exit.code).pipe(
    Match.when(0, () => result.stdout.text.match(/Parent:\s*([^\s]+)/)?.[1] ?? null),
    Match.orElse(() => null)
  );
}

function fakeGraphiteParentResult(result: string | null | CommandProviderError) {
  return Match.value(result).pipe(
    Match.when(isCommandProviderError, Effect.fail),
    Match.orElse((parent: string | null) => Effect.succeed(parent))
  );
}

function isCommandProviderError(
  value: string | null | CommandProviderError
): value is CommandProviderError {
  return value instanceof Error;
}
