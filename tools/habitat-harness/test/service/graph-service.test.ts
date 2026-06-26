import path from "node:path";
import type { GraphServiceRunInput } from "@internal/habitat-harness/service/modules/graph/contract";
import { graphRouter } from "@internal/habitat-harness/service/modules/graph/router";
import {
  captureOutput,
  makeHabitatCommandResult,
} from "@internal/habitat-harness/resources/command/index";
import { CommandUnavailable } from "@internal/habitat-harness/resources/errors/index";
import {
  affectedArgv,
  graphArgv,
  makeFakeNxProviderLayer,
  type NxGraphRequest,
  NxProvider,
} from "@internal/habitat-harness/providers/nx/index";
import { repoRoot } from "@internal/habitat-harness/resources/paths";
import { Effect, Layer } from "effect";
import { withFiberContext } from "effect-orpc/node";
import { describe, expect, test } from "vitest";
import { makeFakePlatformFileSystemLayer } from "../support/fake-platform-file-system.js";

describe("Habitat graph service", () => {
  test("runs Nx graph through providers and returns compact CLI JSON", async () => {
    const events: string[] = [];
    const graphRequests: NxGraphRequest[] = [];
    const graphPath = path.join("/tmp/habitat-graph-fake", "graph.json");
    const layer = Layer.mergeAll(
      makeFakeNxProviderLayer({
        graph: (request) => {
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
        },
      }),
      makeFakePlatformFileSystemLayer(
        events,
        new Map([[graphPath, JSON.stringify({ graph: { nodes: { app: {} } } })]])
      )
    );

    const result = await Effect.runPromise(
      runGraphProcedure({ json: true }).pipe(Effect.provide(layer))
    );

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
    const layer = Layer.mergeAll(
      makeFakeNxProviderLayer({
        graph: (request) =>
          makeHabitatCommandResult({
            commandId: "nx-project-graph",
            kind: "workspace-tool",
            executable: "nx",
            argv: ["graph", "--file", request.outputPath],
            cwd: repoRoot,
            captureGitState: false,
          }),
      }),
      makeFakePlatformFileSystemLayer(
        [],
        new Map([[graphPath, JSON.stringify({ graph: null, nodes: { root: {} } })]])
      )
    );

    await expect(
      Effect.runPromise(runGraphProcedure({ json: true }).pipe(Effect.provide(layer)))
    ).rejects.toThrow("Habitat graph service failed.");
  });

  test("returns failed Nx command streams without reading graph JSON", async () => {
    const events: string[] = [];
    const layer = Layer.mergeAll(
      makeFakeNxProviderLayer({
        graph: (request) =>
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
          ),
      }),
      makeFakePlatformFileSystemLayer(events)
    );

    const result = await Effect.runPromise(runGraphProcedure({}).pipe(Effect.provide(layer)));

    expect(result).toEqual({
      exitCode: 2,
      stdout: "",
      stderr: "nx graph failed\n",
    });
    expect(events).toEqual(["mkdtemp:/tmp/habitat-graph-fake", "remove:/tmp/habitat-graph-fake"]);
  });

  test("returns provider infrastructure failures as command streams", async () => {
    const events: string[] = [];
    const layer = Layer.mergeAll(
      Layer.succeed(NxProvider, {
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
      }),
      makeFakePlatformFileSystemLayer(events)
    );

    const result = await Effect.runPromise(runGraphProcedure({}).pipe(Effect.provide(layer)));

    expect(result).toEqual({
      exitCode: 127,
      stdout: "",
      stderr: "nx unavailable\n",
    });
    expect(events).toEqual(["mkdtemp:/tmp/habitat-graph-fake", "remove:/tmp/habitat-graph-fake"]);
  });
});

function runGraphProcedure(input: GraphServiceRunInput) {
  return Effect.gen(function* () {
    const runGraph = graphRouter.run.callable({ context: {} });
    return yield* withFiberContext(() => runGraph(input));
  });
}
