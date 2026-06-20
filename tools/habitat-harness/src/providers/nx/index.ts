import type { CommandExecutor } from "@effect/platform/CommandExecutor";
import { Context, Effect, Layer } from "effect";
import type { HabitatConfig } from "../../config/index.js";
import type { CommandProviderError } from "../../errors/index.js";
import { repoRoot } from "../../lib/paths.js";
import type { HabitatClock } from "../../resources/index.js";
import { CommandRunner, spawnResultFromCommandResult } from "../command/index.js";
import type { HabitatCommandResult } from "../command/types.js";

type NxProviderRequirements = CommandExecutor | HabitatConfig | HabitatClock | CommandRunner;

export interface NxAffectedRequest {
  base: string;
  targets: readonly string[];
  head?: string;
}

export interface NxProviderService {
  readonly affected: (
    request: NxAffectedRequest
  ) => Effect.Effect<HabitatCommandResult, CommandProviderError, NxProviderRequirements>;
  readonly affectedArgv: (request: NxAffectedRequest) => string[];
}

export class NxProvider extends Context.Tag("@internal/habitat-harness/NxProvider")<
  NxProvider,
  NxProviderService
>() {}

export const NxProviderLive = Layer.succeed(NxProvider, makeLiveNxProvider());

export function makeFakeNxProviderLayer(
  handler: (request: NxAffectedRequest) => HabitatCommandResult
) {
  return Layer.succeed(NxProvider, {
    affected: (request) => Effect.sync(() => handler(request)),
    affectedArgv,
  });
}

function makeLiveNxProvider(): NxProviderService {
  return {
    affected: (request) =>
      CommandRunner.pipe(
        Effect.flatMap((runner) =>
          runner.run({
            commandId: "nx-affected",
            kind: "workspace-tool",
            executable: "nx",
            argv: affectedArgv(request).slice(1),
            cwd: repoRoot,
            captureGitState: false,
          })
        )
      ),
    affectedArgv,
  };
}

export function affectedArgv(request: NxAffectedRequest): string[] {
  return [
    "nx",
    "affected",
    "-t",
    request.targets.join(","),
    "--base",
    request.base,
    "--head",
    request.head ?? "HEAD",
    "--outputStyle=static",
  ];
}

export { spawnResultFromCommandResult };
