import path from "node:path";
import {
  type CommandProviderError,
  type HabitatCommandResult,
  type SpawnResult,
  spawnResultFromCommandProviderError,
  spawnResultFromCommandResult,
} from "@internal/habitat-harness/resources/command/index";
import { service } from "@internal/habitat-harness/service/impl";
import { Effect } from "effect";
import type { GraphServiceRunInput } from "./contract.js";
import {
  GraphServiceBadRequestError,
  GraphServiceInternalError,
} from "./model/errors/graph.errors.js";

export interface GraphModuleContext {
  readonly runGraph: ReturnType<typeof makeRunGraph>;
}

export const module = service.graph.use(({ context, next }) => {
  const runGraph = makeRunGraph({
    acquireTempDirectory: context.deps.platform.acquireTempDirectory,
    readText: context.deps.platform.readText,
    runNxGraph: context.deps.nx.graph,
  });
  return next({
    context: {
      runGraph,
    } satisfies GraphModuleContext,
  });
});

interface GraphJsonFailure {
  readonly message: string;
}

type GraphBadRequest = (input: { readonly message: string }) => GraphServiceBadRequestError;

interface GraphRuntimeDeps {
  readonly acquireTempDirectory: (
    prefix: string
  ) => Effect.Effect<string, unknown, any>;
  readonly readText: (filePath: string) => Effect.Effect<string, unknown, any>;
  readonly runNxGraph: (
    input: { readonly outputPath: string }
  ) => Effect.Effect<HabitatCommandResult, CommandProviderError, any>;
}

function makeRunGraph(deps: GraphRuntimeDeps) {
  return (input: GraphServiceRunInput = {}, badRequest: GraphBadRequest) =>
    Effect.scoped(
      Effect.gen(function* () {
        const tempDir = yield* deps
          .acquireTempDirectory("habitat-graph-")
          .pipe(Effect.mapError(graphServiceInternalError));
        const graphPath = path.join(tempDir, "graph.json");
        const spawnResult = yield* deps.runNxGraph({ outputPath: graphPath }).pipe(
          Effect.match({
            onFailure: spawnResultFromCommandProviderError,
            onSuccess: spawnResultFromCommandResult,
          })
        );
        if (spawnResult.exitCode !== 0) return spawnResult;

        const graphText = yield* deps
          .readText(graphPath)
          .pipe(Effect.mapError(graphServiceInternalError));
        const graphPayload = yield* parseGraphJson(graphPath, graphText).pipe(
          Effect.mapError((failure) => badRequest({ message: failure.message }))
        );
        const selectedPayload = yield* selectGraphPayload(graphPath, graphPayload).pipe(
          Effect.mapError((failure) => badRequest({ message: failure.message }))
        );
        return {
          exitCode: 0,
          stdout: `${JSON.stringify(selectedPayload, null, input.json ? 0 : 2)}\n`,
          stderr: "",
        } satisfies SpawnResult;
      })
    );
}

function parseGraphJson(graphPath: string, graphText: string) {
  return Effect.try({
    try: () => JSON.parse(graphText) as unknown,
    catch: (cause): GraphJsonFailure => ({
      message: `Habitat graph service could not parse Nx graph JSON at ${graphPath}: ${
        cause instanceof Error ? cause.message : String(cause)
      }`,
    }),
  });
}

function selectGraphPayload(
  graphPath: string,
  payload: unknown
): Effect.Effect<unknown, GraphJsonFailure> {
  if (payload && typeof payload === "object" && "graph" in payload) {
    const graph = (payload as { readonly graph: unknown }).graph;
    if (!graph || typeof graph !== "object") {
      return Effect.fail({
        message: `Habitat graph service read invalid Nx graph JSON at ${graphPath}: graph must be a non-null object.`,
      });
    }
    return Effect.succeed(graph);
  }
  return Effect.succeed(payload);
}

function graphServiceInternalError() {
  return new GraphServiceInternalError({
    message: "Habitat graph service failed.",
  });
}
