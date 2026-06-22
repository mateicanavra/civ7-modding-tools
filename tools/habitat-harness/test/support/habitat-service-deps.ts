import { biomeArgv } from "@internal/habitat-harness/providers/biome/index";
import { makeGitProviderFromCommandHandler } from "@internal/habitat-harness/providers/git/index";
import {
  affectedArgv,
  graphArgv,
  runManyArgv,
  runTargetArgv,
} from "@internal/habitat-harness/providers/nx/index";
import {
  captureOutput,
  makeHabitatCommandResult,
} from "@internal/habitat-harness/resources/command/index";
import type { HabitatProcessRequest } from "@internal/habitat-harness/resources/command/types";
import { repoRoot } from "@internal/habitat-harness/resources/paths";
import type { HabitatReportEvent } from "@internal/habitat-harness/resources/reporter/index";
import type { HabitatServiceDeps } from "@internal/habitat-harness/service/base";
import type { CheckReport } from "@internal/habitat-harness/service/model/check/index";
import { Effect } from "effect";

export function makeTestHabitatServiceDeps(
  overrides: Partial<HabitatServiceDeps> = {}
): HabitatServiceDeps {
  return {
    biome: {
      run: (request) =>
        Effect.succeed(
          commandResult({
            commandId: `biome-${request.kind}`,
            kind: "biome-handoff",
            executable: "biome",
            argv: biomeArgv(request).slice(1),
          })
        ),
      argv: biomeArgv,
    },
    commandRunner: {
      run: (request) => Effect.succeed(commandResult(request)),
      runSync: commandResult,
    },
    git: makeGitProviderFromCommandHandler((argv, options) =>
      commandResult({
        commandId: `git-${argv.join("-")}`,
        kind: "git-state",
        executable: "git",
        argv,
        cwd: options.cwd,
      })
    ),
    graphite: {
      parent: () => Effect.succeed(null),
    },
    grit: {
      check: (request) =>
        Effect.succeed(commandResult(gritRequest("grit-check", request.scanRoots))),
      checkRequest: (request) => gritRequest("grit-check", request.scanRoots),
      applyDryRun: (request) =>
        Effect.succeed(commandResult(gritRequest(request.commandId, request.scanRoots))),
      applyDryRunRequest: (request) => gritRequest(request.commandId, request.scanRoots),
    },
    nx: {
      affected: (request) =>
        Effect.succeed(
          commandResult({
            commandId: "nx-affected",
            kind: "workspace-tool",
            executable: "nx",
            argv: affectedArgv(request).slice(1),
          })
        ),
      affectedArgv,
      graph: (request) =>
        Effect.succeed(
          commandResult({
            commandId: "nx-project-graph",
            kind: "workspace-tool",
            executable: "nx",
            argv: graphArgv(request).slice(1),
          })
        ),
      graphArgv,
      runMany: (request) =>
        Effect.succeed(
          commandResult({
            commandId: "nx-run-many",
            kind: "workspace-tool",
            executable: "nx",
            argv: runManyArgv(request).slice(1),
          })
        ),
      runManyArgv,
      runTarget: (request) =>
        Effect.succeed(
          commandResult({
            commandId: "nx-run-target",
            kind: "workspace-tool",
            executable: "nx",
            argv: runTargetArgv(request).slice(1),
          })
        ),
      runTargetArgv,
      workspaceGraph: () =>
        Effect.succeed({
          kind: "graph-ready",
          snapshot: { projects: [] },
        }),
    },
    platform: {
      acquireTempDirectory: () => Effect.succeed("/tmp/habitat-service-test"),
      env: {},
      hashFile: () => null,
      pathExists: () => false,
      readText: () => Effect.succeed(""),
      repoRoot,
    },
    reporter: fakeReporter(),
    ...overrides,
  };
}

function fakeReporter(events: HabitatReportEvent[] = []) {
  return {
    emit: (event: HabitatReportEvent) =>
      Effect.sync(() => {
        events.push(event);
      }),
  };
}

function commandResult(
  request: Omit<HabitatProcessRequest, "captureGitState" | "cwd"> & {
    readonly cwd?: string;
    readonly captureGitState?: boolean;
  }
) {
  return makeHabitatCommandResult(
    {
      cwd: repoRoot,
      captureGitState: false,
      ...request,
    },
    { stdout: captureOutput("") }
  );
}

function gritRequest(commandId: string, scanRoots: readonly string[] = []): HabitatProcessRequest {
  return {
    commandId,
    kind: "pattern-check",
    executable: "grit",
    argv: [],
    cwd: repoRoot,
    scanRoots,
    captureGitState: false,
  };
}

function passingCheckReport(command: string): CheckReport {
  return {
    schemaVersion: 1,
    command,
    startedAt: "2026-06-21T00:00:00.000Z",
    ok: true,
    rules: [],
  };
}
