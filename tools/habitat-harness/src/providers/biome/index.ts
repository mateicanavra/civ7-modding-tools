import type { CommandExecutor } from "@effect/platform/CommandExecutor";
import type { GitStateProvider } from "@internal/habitat-harness/providers/git/index";
import {
  type CommandProviderError,
  CommandRunner,
} from "@internal/habitat-harness/resources/command/index";
import type { HabitatCommandResult } from "@internal/habitat-harness/resources/command/types";
import type { HabitatConfig } from "@internal/habitat-harness/resources/config/index";
import { repoRoot } from "@internal/habitat-harness/resources/paths";
import { Context, Effect, Layer } from "effect";

type BiomeProviderRequirements = CommandExecutor | HabitatConfig | CommandRunner | GitStateProvider;

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
  ) => Effect.Effect<HabitatCommandResult, CommandProviderError, BiomeProviderRequirements>;
  readonly argv: (request: BiomeCommandRequest) => string[];
}

export class BiomeProvider extends Context.Tag("@internal/habitat-harness/BiomeProvider")<
  BiomeProvider,
  BiomeProviderService
>() {}

export const BiomeProviderLive = Layer.succeed(BiomeProvider, makeLiveBiomeProvider());

export function makeFakeBiomeProviderLayer(
  handler: (request: BiomeCommandRequest) => HabitatCommandResult
) {
  return Layer.succeed(BiomeProvider, {
    run: (request) => Effect.sync(() => handler(request)),
    argv: biomeArgv,
  });
}

function makeLiveBiomeProvider(): BiomeProviderService {
  return {
    run: (request) =>
      CommandRunner.pipe(
        Effect.flatMap((runner) =>
          runner.run({
            commandId: `biome-${request.kind}`,
            kind: "biome-handoff",
            executable: "biome",
            argv: biomeArgv(request).slice(1),
            cwd: repoRoot,
            captureGitState: false,
          })
        )
      ),
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
