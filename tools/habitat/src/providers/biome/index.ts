import {
  type CommandProviderError,
  CommandRunner,
  type CommandRunnerService,
} from "@habitat/cli/resources/command/index";
import type { HabitatCommandResult } from "@habitat/cli/resources/command/types";
import { Context, Effect, Layer } from "effect";

export type BiomeCommandKind = "format" | "check" | "ci";

export interface BiomeCommandRequest {
  kind: BiomeCommandKind;
  paths?: readonly string[];
  write?: boolean;
  noErrorsOnUnmatched?: boolean;
}

export interface BiomeProviderService {
  readonly run: (
    request: BiomeCommandRequest
  ) => Effect.Effect<HabitatCommandResult, CommandProviderError>;
  readonly argv: (request: BiomeCommandRequest) => string[];
}

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
    run: (request) => Effect.sync(() => handler(request)),
    argv: biomeArgv,
  });
}

function makeLiveBiomeProvider(
  repoRoot: string,
  runner: CommandRunnerService
): BiomeProviderService {
  return {
    run: (request) =>
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
  return [
    "biome",
    request.kind,
    ...(request.kind === "format" && request.write ? ["--write"] : []),
    ...(request.noErrorsOnUnmatched ? ["--no-errors-on-unmatched"] : []),
    ...(request.paths && request.paths.length > 0 ? request.paths : ["."]),
  ];
}
