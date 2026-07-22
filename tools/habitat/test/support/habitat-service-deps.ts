import path from "node:path";
import { biomeArgv } from "@habitat/cli/providers/biome/index";
import { makeGitProviderFromCommandHandler } from "@habitat/cli/providers/git/index";
import { parentArgv } from "@habitat/cli/providers/graphite/index";
import {
  affectedArgv,
  graphArgv,
  runManyArgv,
  runTargetArgv,
} from "@habitat/cli/providers/nx/index";
import { ruleRegistryRepoPath } from "@habitat/cli/resources/authority-paths";
import { captureOutput, makeHabitatCommandResult } from "@habitat/cli/resources/command/index";
import type { HabitatProcessRequest } from "@habitat/cli/resources/command/types";
import { repoRoot } from "@habitat/cli/resources/paths";
import {
  isDirectorySync,
  readDirectorySync,
  readTextSync,
} from "@habitat/cli/resources/platform/filesystem";
import type { HabitatReportEvent } from "@habitat/cli/resources/reporter/index";
import type { HabitatServiceDeps } from "@habitat/cli/service/base";
import { loadRuleRegistryDocument, ruleFactsCatalog } from "@habitat/cli/service/model/rules/index";
import { Effect } from "effect";

const testTempDirectory = path.join(path.sep, "tmp", "habitat-service-test");
const emptyText = String();

export function makeTestRuleFacts() {
  return ruleFactsCatalog(
    loadRuleRegistryDocument(path.join(repoRoot, ruleRegistryRepoPath), {
      isDirectory: isDirectorySync,
      readDirectory: readDirectorySync,
      readText: readTextSync,
    })
  );
}

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
      parentArgv,
      parent: () => Effect.succeed(null),
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
      acquireTempDirectory: () => Effect.succeed(testTempDirectory),
      env: {},
      hashFile: () => null,
      isDirectory: () => Effect.succeed(false),
      isDirectorySync: () => false,
      isFile: () => false,
      isFileEffect: () => Effect.succeed(false),
      makeDirectory: () => Effect.void,
      pathExists: () => false,
      readDirectory: () => Effect.succeed([]),
      readDirectorySync: () => [],
      readText: () => Effect.succeed(emptyText),
      readTextSync: () => emptyText,
      repoRoot,
      statKind: () => undefined,
      writeText: () => Effect.void,
    },
    reporter: fakeReporter(),
    ruleDiagnostics: {
      runRules: (demand) =>
        Effect.succeed(
          new Map(
            demand.ruleIds.map((ruleId) => [
              ruleId,
              {
                kind: "executed" as const,
                result: { exitCode: 0, diagnostics: [] },
                durationMs: 0,
              },
            ])
          )
        ),
    },
    ruleFixPreview: {
      preview: () => Effect.succeed({ kind: "completed", results: [] }),
    },
    rules: makeTestRuleFacts(),
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
