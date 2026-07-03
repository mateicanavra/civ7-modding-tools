import path from "node:path";
import { Effect, Layer } from "effect";
import { describe, expect, test } from "vitest";
import { CommandUnavailable } from "../../src/errors/index.js";
import { repoRoot } from "../../src/lib/paths.js";
import { captureOutput, makeHabitatCommandResult } from "../../src/providers/command/index.js";
import {
  affectedArgv,
  graphArgv,
  makeFakeNxProviderLayer,
  type NxGraphRequest,
  NxProvider,
} from "../../src/providers/nx/index.js";
import { makeFakeHabitatFileSystemLayer } from "../../src/resources/index.js";
import { runGraphService } from "../../src/service/modules/graph/router.js";

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
              executable: "target-check",
              argv: ["graph", "--file", request.outputPath],
              cwd: repoRoot,
              captureGitState: false,
            },
            { stdout: captureOutput("graph written\n") }
          );
        },
      }),
      makeFakeHabitatFileSystemLayer(
        events,
        new Map([[graphPath, JSON.stringify({ graph: { nodes: { app: {} } } })]])
      )
    );

    const result = await Effect.runPromise(
      runGraphService({ json: true }).pipe(Effect.provide(layer))
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

  test("keeps the legacy nullish graph projection contract", async () => {
    const graphPath = path.join("/tmp/habitat-graph-fake", "graph.json");
    const layer = Layer.mergeAll(
      makeFakeNxProviderLayer({
        graph: (request) =>
          makeHabitatCommandResult({
            commandId: "nx-project-graph",
            kind: "workspace-tool",
            executable: "target-check",
            argv: ["graph", "--file", request.outputPath],
            cwd: repoRoot,
            captureGitState: false,
          }),
      }),
      makeFakeHabitatFileSystemLayer(
        [],
        new Map([[graphPath, JSON.stringify({ graph: null, nodes: { root: {} } })]])
      )
    );

    const result = await Effect.runPromise(
      runGraphService({ json: true }).pipe(Effect.provide(layer))
    );

    expect(result.stdout).toBe('{"graph":null,"nodes":{"root":{}}}\n');
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
              executable: "target-check",
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
      makeFakeHabitatFileSystemLayer(events)
    );

    const result = await Effect.runPromise(runGraphService({}).pipe(Effect.provide(layer)));

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
              executable: "target-check",
              argv: graphArgv(request).slice(1),
              cwd: repoRoot,
              cause: "target-check unavailable",
            })
          ),
        graphArgv,
      }),
      makeFakeHabitatFileSystemLayer(events)
    );

    const result = await Effect.runPromise(runGraphService({}).pipe(Effect.provide(layer)));

    expect(result).toEqual({
      exitCode: 127,
      stdout: "",
      stderr: "target-check unavailable\n",
    });
    expect(events).toEqual(["mkdtemp:/tmp/habitat-graph-fake", "remove:/tmp/habitat-graph-fake"]);
  });
});
