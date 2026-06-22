import path from "node:path";
import {
  affectedArgv,
  graphArgv,
  type NxGraphRequest,
} from "@internal/habitat-harness/providers/nx/index";
import {
  captureOutput,
  makeHabitatCommandResult,
} from "@internal/habitat-harness/resources/command/index";
import { CommandUnavailable } from "@internal/habitat-harness/resources/errors/index";
import { repoRoot } from "@internal/habitat-harness/resources/paths";
import type { HabitatServiceDeps } from "@internal/habitat-harness/service/base";
import type { GraphServiceRunInput } from "@internal/habitat-harness/service/modules/graph/contract";
import { graphRouter } from "@internal/habitat-harness/service/modules/graph/router";
import { Effect } from "effect";
import { withFiberContext } from "effect-orpc/node";
import { describe, expect, test } from "vitest";
import { makeTestHabitatServiceDeps } from "../support/habitat-service-deps";

describe("Habitat graph service", () => {
  test("runs Nx graph through providers and returns compact CLI JSON", async () => {
    const events: string[] = [];
    const graphRequests: NxGraphRequest[] = [];
    const graphPath = path.join("/tmp/habitat-graph-fake", "graph.json");
    const deps = graphDeps(
      events,
      new Map([[graphPath, JSON.stringify({ graph: { nodes: { app: {} } } })]]),
      {
        graph: (request) =>
          Effect.sync(() => {
            graphRequests.push(request);
            return makeHabitatCommandResult(
              {
                commandId: "nx-project-graph",
                kind: "workspace-tool",
                executable: "nx",
                argv: ["graph", "--file", request.outputPath],
                cwd: repoRoot,
                captureGitState: false,
              },
              { stdout: captureOutput("graph written\n") }
            );
          }),
      }
    );

    const result = await Effect.runPromise(runGraphProcedure({ json: true }, deps));

    expect(result).toEqual({
      exitCode: 0,
      stdout: '{"nodes":{"app":{}}}\n',
      stderr: "",
    });
    expect(graphRequests).toEqual([{ outputPath: graphPath }]);
    expect(events).toEqual([
      "mkdtemp:/tmp/habitat-graph-fake",
      "read:/tmp/habitat-graph-fake/graph.json",
      "remove:/tmp/habitat-graph-fake",
    ]);
  });

  test("rejects nullish graph payloads instead of falling back to raw JSON", async () => {
    const graphPath = path.join("/tmp/habitat-graph-fake", "graph.json");
    const deps = graphDeps(
      [],
      new Map([[graphPath, JSON.stringify({ graph: null, nodes: { root: {} } })]]),
      {
        graph: (request) =>
          Effect.succeed(
            makeHabitatCommandResult({
              commandId: "nx-project-graph",
              kind: "workspace-tool",
              executable: "nx",
              argv: ["graph", "--file", request.outputPath],
              cwd: repoRoot,
              captureGitState: false,
            })
          ),
      }
    );

    await expect(Effect.runPromise(runGraphProcedure({ json: true }, deps))).rejects.toThrow(
      "Habitat graph service read invalid Nx graph JSON at /tmp/habitat-graph-fake/graph.json: graph must be a non-null object."
    );
  });

  test("returns failed Nx command streams without reading graph JSON", async () => {
    const events: string[] = [];
    const deps = graphDeps(events, new Map(), {
      graph: (request) =>
        Effect.succeed(
          makeHabitatCommandResult(
            {
              commandId: "nx-project-graph",
              kind: "workspace-tool",
              executable: "nx",
              argv: ["graph", "--file", request.outputPath],
              cwd: repoRoot,
              captureGitState: false,
            },
            {
              exit: { code: 2, signal: null, interrupted: false },
              stderr: captureOutput("nx graph failed\n"),
            }
          )
        ),
    });

    const result = await Effect.runPromise(runGraphProcedure({}, deps));

    expect(result).toEqual({
      exitCode: 2,
      stdout: "",
      stderr: "nx graph failed\n",
    });
    expect(events).toEqual(["mkdtemp:/tmp/habitat-graph-fake", "remove:/tmp/habitat-graph-fake"]);
  });

  test("returns provider infrastructure failures as command streams", async () => {
    const events: string[] = [];
    const deps = graphDeps(events, new Map(), {
      affected: (request) =>
        Effect.fail(
          new CommandUnavailable({
            commandId: "nx-affected",
            executable: "nx",
            argv: affectedArgv(request).slice(1),
            cwd: repoRoot,
            cause: "nx unavailable",
          })
        ),
      affectedArgv,
      graph: (request) =>
        Effect.fail(
          new CommandUnavailable({
            commandId: "nx-project-graph",
            executable: "nx",
            argv: graphArgv(request).slice(1),
            cwd: repoRoot,
            cause: "nx unavailable",
          })
        ),
      graphArgv,
    });

    const result = await Effect.runPromise(runGraphProcedure({}, deps));

    expect(result).toEqual({
      exitCode: 127,
      stdout: "",
      stderr: "nx unavailable\n",
    });
    expect(events).toEqual(["mkdtemp:/tmp/habitat-graph-fake", "remove:/tmp/habitat-graph-fake"]);
  });
});

interface GraphTestDeps {
  readonly nx?: Partial<HabitatServiceDeps["nx"]>;
  readonly platform?: Partial<HabitatServiceDeps["platform"]>;
}

function graphDeps(
  events: string[],
  files: ReadonlyMap<string, string>,
  nx: Partial<GraphTestDeps["nx"]>
): GraphTestDeps {
  const tempDir = "/tmp/habitat-graph-fake";
  return {
    platform: {
      acquireTempDirectory: () =>
        Effect.acquireRelease(
          Effect.sync(() => {
            events.push(`mkdtemp:${tempDir}`);
            return tempDir;
          }),
          () =>
            Effect.sync(() => {
              events.push(`remove:${tempDir}`);
            })
        ),
      readText: (targetPath) =>
        Effect.sync(() => {
          events.push(`read:${targetPath}`);
          return files.get(targetPath) ?? "";
        }),
    },
    nx: {
      affected: () =>
        Effect.succeed(
          makeHabitatCommandResult({
            commandId: "nx-affected",
            kind: "workspace-tool",
            executable: "nx",
            argv: [],
            cwd: repoRoot,
            captureGitState: false,
          })
        ),
      affectedArgv,
      graphArgv,
      ...nx,
    },
  };
}

function runGraphProcedure(input: GraphServiceRunInput, deps: GraphTestDeps) {
  return Effect.gen(function* () {
    const baseDeps = makeTestHabitatServiceDeps();
    const runGraph = graphRouter.run.callable({
      context: {
        deps: {
          ...baseDeps,
          ...deps,
          nx: { ...baseDeps.nx, ...deps.nx },
          platform: { ...baseDeps.platform, ...deps.platform },
        },
      },
    });
    return yield* withFiberContext(() => runGraph(input));
  });
}
