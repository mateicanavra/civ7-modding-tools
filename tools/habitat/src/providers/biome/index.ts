import { CommandRunner, type CommandRunnerService } from "@habitat/cli/resources/command/index";
import type { HabitatCommandResult } from "@habitat/cli/resources/command/types";
import { Context, Effect, Layer, Match } from "effect";

export type BiomeCommandKind = "format" | "check" | "ci";

export interface BiomeCommandRequest {
  kind: BiomeCommandKind;
  paths?: readonly string[];
  write?: boolean;
  noErrorsOnUnmatched?: boolean;
}

export interface BiomeProviderService extends ReturnType<typeof makeLiveBiomeProvider> {}

export class BiomeProvider extends Context.Tag("@habitat/cli/BiomeProvider")<
  BiomeProvider,
  BiomeProviderService
>() {}

export function makeBiomeProviderLayer(repoRoot: string) {
  return Layer.effect(
    BiomeProvider,
    Effect.map(CommandRunner, (runner) => makeLiveBiomeProvider(repoRoot, runner))
  );
}

export function makeFakeBiomeProviderLayer(
  handler: (request: BiomeCommandRequest) => HabitatCommandResult
) {
  return Layer.succeed(BiomeProvider, {
    run: (request) => Effect.succeed(handler(request)),
    argv: biomeArgv,
  });
}

function makeLiveBiomeProvider(repoRoot: string, runner: CommandRunnerService) {
  return {
    run: (request: BiomeCommandRequest) =>
      runner.run({
        commandId: `biome-${request.kind}`,
        kind: "biome-handoff",
        executable: "biome",
        argv: biomeArgv(request).slice(1),
        cwd: repoRoot,
        captureGitState: false,
      }),
    argv: biomeArgv,
  };
}

export function biomeArgv(request: BiomeCommandRequest): string[] {
  const write = Match.value(request).pipe(
    Match.when({ kind: "format", write: true }, () => ["--write"]),
    Match.orElse(() => [])
  );
  const noErrorsOnUnmatched = Match.value(request.noErrorsOnUnmatched).pipe(
    Match.when(true, () => ["--no-errors-on-unmatched"]),
    Match.orElse(() => [])
  );
  const paths = Match.value(request.paths).pipe(
    Match.when(
      (candidate: readonly string[] | undefined): candidate is readonly string[] =>
        candidate !== undefined && candidate.length > 0,
      (candidate) => candidate
    ),
    Match.orElse(() => ["."])
  );
  return ["biome", request.kind, ...write, ...noErrorsOnUnmatched, ...paths];
}
